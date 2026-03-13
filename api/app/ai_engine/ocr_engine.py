import os
import io
from pathlib import Path
from typing import Dict, Any, Optional
from app.utils.logger import logger

# ── Graceful imports — won't crash if libs missing ──────────────
try:
    import pytesseract
    from PIL import Image
    import cv2
    import numpy as np
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    logger.warning("pytesseract / cv2 / PIL not installed — OCR will use text fallback")

try:
    from pdf2image import convert_from_path
    PDF2IMAGE_AVAILABLE = True
except ImportError:
    PDF2IMAGE_AVAILABLE = False
    logger.warning("pdf2image not installed — PDF OCR disabled")

try:
    import pypdf
    PYPDF_AVAILABLE = True
except ImportError:
    try:
        from PyPDF2 import PdfReader as _R
        PYPDF_AVAILABLE = True
    except ImportError:
        PYPDF_AVAILABLE = False

# Set tesseract cmd if available
if TESSERACT_AVAILABLE:
    try:
        from app.config.settings import settings
        pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
    except Exception:
        pass


def _extract_pdf_text_directly(file_path: str) -> str:
    """Extract text from PDF using pypdf (no OCR needed for digital PDFs)."""
    try:
        try:
            import pypdf
            reader = pypdf.PdfReader(file_path)
        except ImportError:
            from PyPDF2 import PdfReader
            reader = PdfReader(file_path)

        text_parts = []
        for page in reader.pages:
            try:
                t = page.extract_text()
                if t:
                    text_parts.append(t)
            except Exception:
                pass
        return "\n\n".join(text_parts)
    except Exception as e:
        logger.error(f"Direct PDF text extraction failed: {e}")
        return ""


class OCREngine:
    """OCR engine with graceful fallback when Tesseract is not installed."""

    SUPPORTED_IMAGE_TYPES = {"jpg", "jpeg", "png", "bmp", "tiff"}
    SUPPORTED_DOC_TYPES   = {"pdf"}

    def __init__(self):
        self.config = "--oem 3 --psm 6 -l eng"

    def _tesseract_installed(self) -> bool:
        if not TESSERACT_AVAILABLE:
            return False
        try:
            pytesseract.get_tesseract_version()
            return True
        except Exception:
            return False

    def preprocess_image(self, image) -> any:
        """Apply image preprocessing — only if cv2 available."""
        if not TESSERACT_AVAILABLE:
            return image
        try:
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image
            denoised = cv2.fastNlMeansDenoising(gray, h=10)
            thresh = cv2.adaptiveThreshold(
                denoised, 255,
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY, 11, 2
            )
            # Deskew
            coords = np.column_stack(np.where(thresh > 0))
            if len(coords) > 0:
                angle = cv2.minAreaRect(coords)[-1]
                if angle < -45:
                    angle = 90 + angle
                if abs(angle) > 0.5:
                    (h, w) = thresh.shape[:2]
                    M = cv2.getRotationMatrix2D((w / 2, h / 2), -angle, 1.0)
                    thresh = cv2.warpAffine(thresh, M, (w, h),
                                            flags=cv2.INTER_CUBIC,
                                            borderMode=cv2.BORDER_REPLICATE)
            kernel = np.array([[-1,-1,-1],[-1,9,-1],[-1,-1,-1]])
            return cv2.filter2D(thresh, -1, kernel)
        except Exception as e:
            logger.warning(f"Image preprocessing failed, using original: {e}")
            return image

    def extract_from_image(self, file_path: str) -> Dict[str, Any]:
        """Extract text from image file with full fallback."""
        # Try Tesseract first
        if TESSERACT_AVAILABLE and self._tesseract_installed():
            try:
                image = cv2.imread(file_path)
                if image is None:
                    pil_img = Image.open(file_path)
                    image   = np.array(pil_img.convert("RGB"))
                    image   = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

                preprocessed = self.preprocess_image(image)
                pil_image    = Image.fromarray(preprocessed)

                ocr_data = pytesseract.image_to_data(
                    pil_image, config=self.config,
                    output_type=pytesseract.Output.DICT
                )
                confidences = [int(c) for c in ocr_data["conf"] if int(c) > 0]
                avg_conf    = sum(confidences) / len(confidences) if confidences else 0.0
                text        = pytesseract.image_to_string(pil_image, config=self.config)

                return {
                    "text":       text.strip(),
                    "confidence": round(avg_conf / 100, 4),
                    "word_count": len([w for w in ocr_data["text"] if w.strip()]),
                    "success":    True,
                    "method":     "tesseract",
                }
            except Exception as e:
                logger.error(f"Tesseract OCR failed: {e}")

        # Fallback: try PIL basic read
        try:
            if TESSERACT_AVAILABLE:
                pil_img = Image.open(file_path)
                text    = pytesseract.image_to_string(pil_img, config=self.config)
                if text.strip():
                    return {"text": text.strip(), "confidence": 0.5, "word_count": len(text.split()), "success": True, "method": "pil_fallback"}
        except Exception as e:
            logger.warning(f"PIL OCR fallback failed: {e}")

        # Final fallback: return filename as hint so AI can still run
        logger.warning(f"All OCR methods failed for image {file_path} — using empty text fallback")
        return {
            "text":       f"Medical report file: {Path(file_path).name}",
            "confidence": 0.0,
            "word_count": 0,
            "success":    False,
            "method":     "fallback",
        }

    def extract_from_pdf(self, file_path: str) -> Dict[str, Any]:
        """Extract text from PDF — tries direct text extraction first, then OCR."""
        # 1. Try direct text extraction (works for digital PDFs — no Tesseract needed)
        if PYPDF_AVAILABLE:
            try:
                text = _extract_pdf_text_directly(file_path)
                if text and len(text.strip()) > 50:
                    logger.info(f"PDF text extracted directly (no OCR needed): {len(text)} chars")
                    return {
                        "text":       text.strip(),
                        "confidence": 0.95,
                        "pages":      1,
                        "success":    True,
                        "method":     "pypdf_direct",
                    }
            except Exception as e:
                logger.warning(f"Direct PDF extraction failed: {e}")

        # 2. Try pdf2image + Tesseract OCR
        if PDF2IMAGE_AVAILABLE and TESSERACT_AVAILABLE and self._tesseract_installed():
            try:
                images      = convert_from_path(file_path, dpi=200)
                all_text    = []
                all_confs   = []

                for pil_img in images:
                    image        = np.array(pil_img.convert("RGB"))
                    image        = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
                    preprocessed = self.preprocess_image(image)
                    pil_proc     = Image.fromarray(preprocessed)

                    text     = pytesseract.image_to_string(pil_proc, config=self.config)
                    ocr_data = pytesseract.image_to_data(pil_proc, config=self.config,
                                                          output_type=pytesseract.Output.DICT)
                    confs = [int(c) for c in ocr_data["conf"] if int(c) > 0]
                    if confs:
                        all_confs.append(sum(confs) / len(confs))
                    all_text.append(text.strip())

                combined = "\n\n--- Page Break ---\n\n".join(all_text)
                avg_conf = sum(all_confs) / len(all_confs) if all_confs else 0.0

                return {
                    "text":       combined,
                    "confidence": round(avg_conf / 100, 4),
                    "pages":      len(images),
                    "success":    True,
                    "method":     "pdf2image_tesseract",
                }
            except Exception as e:
                logger.error(f"PDF OCR pipeline failed: {e}")

        # 3. Final fallback
        logger.warning(f"All PDF extraction methods failed for {file_path}")
        return {
            "text":       f"Medical report PDF: {Path(file_path).name}",
            "confidence": 0.0,
            "pages":      0,
            "success":    False,
            "method":     "fallback",
        }

    def process_file(self, file_path: str) -> Dict[str, Any]:
        """Auto-detect file type and process."""
        ext = Path(file_path).suffix.lower().lstrip(".")
        if ext in self.SUPPORTED_DOC_TYPES:
            return self.extract_from_pdf(file_path)
        elif ext in self.SUPPORTED_IMAGE_TYPES:
            return self.extract_from_image(file_path)
        else:
            return {"text": "", "confidence": 0.0, "success": False, "error": f"Unsupported: {ext}"}


ocr_engine = OCREngine()