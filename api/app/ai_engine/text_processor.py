import re
from typing import List, Dict, Tuple
from app.utils.logger import logger


class TextProcessor:
    """NLP text processor for medical report analysis."""

    MEDICAL_SECTION_PATTERNS = [
        r"(?i)(patient\s*name|athlete\s*name):\s*(.+)",
        r"(?i)(date\s*of\s*test|sample\s*date):\s*(.+)",
        r"(?i)(sample\s*type|specimen):\s*(.+)",
        r"(?i)(result|findings|detected|positive|negative):\s*(.+)",
        r"(?i)(substance|compound|drug|medication):\s*(.+)",
        r"(?i)(concentration|level|amount):\s*(.+\s*(?:ng/ml|µg/ml|pg/ml|mg/l))",
        r"(?i)(threshold|limit|cutoff):\s*(.+)",
    ]

    def clean_text(self, text: str) -> str:
        """Clean and normalize OCR text."""
        # Remove extra whitespace
        text = re.sub(r"\s+", " ", text)
        # Fix common OCR errors
        text = text.replace("|", "l").replace("0", "O")
        # Remove special characters except medical ones
        text = re.sub(r"[^\w\s.,;:()\-/°%µ]", "", text)
        return text.strip()

    def extract_medical_sections(self, text: str) -> Dict[str, str]:
        """Extract structured sections from medical text."""
        sections = {}
        for pattern in self.MEDICAL_SECTION_PATTERNS:
            matches = re.findall(pattern, text)
            for match in matches:
                if isinstance(match, tuple) and len(match) == 2:
                    key = match[0].strip().lower().replace(" ", "_")
                    sections[key] = match[1].strip()
        return sections

    def extract_numeric_values(self, text: str) -> List[Dict[str, str]]:
        """Extract numeric measurements from text."""
        pattern = r"(\d+\.?\d*)\s*(ng/ml|µg/ml|pg/ml|mg/l|nmol/l|µmol/l|%)"
        matches = re.findall(pattern, text, re.IGNORECASE)
        return [{"value": m[0], "unit": m[1]} for m in matches]

    def tokenize(self, text: str) -> List[str]:
        """Simple word tokenizer."""
        return [w.lower() for w in re.findall(r"\b[a-zA-Z]{2,}\b", text)]

    def get_ngrams(self, tokens: List[str], n: int = 2) -> List[str]:
        """Generate n-grams from token list."""
        return [" ".join(tokens[i:i+n]) for i in range(len(tokens) - n + 1)]


text_processor = TextProcessor()
