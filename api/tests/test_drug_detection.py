import pytest
from app.ai_engine.drug_detector import drug_detector, DrugDetector
from app.ai_engine.text_processor import text_processor
from app.constants.drug_risk_levels import DrugDetectionStatus, RiskLevel


class TestDrugDetector:

    def setup_method(self):
        self.detector = DrugDetector()

    def test_detect_nandrolone(self):
        text = "Lab Result: Nandrolone detected in urine sample. Concentration: 25 ng/ml. Result: POSITIVE"
        result = self.detector.detect(text)
        assert result["status"] == DrugDetectionStatus.DETECTED
        assert result["total_drugs_found"] > 0
        drug_names = [d["drug_name"] for d in result["detected_drugs"]]
        assert "Nandrolone" in drug_names

    def test_detect_stanozolol(self):
        text = "Substance: Stanozolol (Winstrol). Sample positive. Risk: High"
        result = self.detector.detect(text)
        assert result["status"] == DrugDetectionStatus.DETECTED
        drug_names = [d["drug_name"] for d in result["detected_drugs"]]
        assert "Stanozolol" in drug_names

    def test_detect_epo(self):
        text = "EPO (erythropoietin) detected in blood sample. Athlete flagged positive."
        result = self.detector.detect(text)
        assert result["status"] == DrugDetectionStatus.DETECTED

    def test_detect_stimulants(self):
        text = "Amphetamine found in urine. Positive doping test."
        result = self.detector.detect(text)
        assert result["status"] == DrugDetectionStatus.DETECTED

    def test_clean_report(self):
        text = "All results negative. No banned substances detected. Athlete cleared. Clean report."
        result = self.detector.detect(text)
        assert result["status"] == DrugDetectionStatus.CLEAN
        assert result["total_drugs_found"] == 0
        assert result["confidence_score"] > 0

    def test_empty_text(self):
        result = self.detector.detect("")
        assert result["status"] == DrugDetectionStatus.INCONCLUSIVE

    def test_short_text(self):
        result = self.detector.detect("abc")
        assert result["status"] == DrugDetectionStatus.INCONCLUSIVE

    def test_risk_level_critical(self):
        text = "Morphine found in blood. High concentration. Positive result."
        result = self.detector.detect(text)
        if result["status"] == DrugDetectionStatus.DETECTED:
            assert result["risk_level"] == RiskLevel.CRITICAL

    def test_risk_level_high(self):
        text = "Testosterone detected in urine sample. Positive test."
        result = self.detector.detect(text)
        if result["status"] == DrugDetectionStatus.DETECTED:
            assert result["risk_level"] in (RiskLevel.HIGH, RiskLevel.CRITICAL)

    def test_confidence_score_range(self):
        text = "Nandrolone positive. Laboratory confirmed. High concentration detected."
        result = self.detector.detect(text)
        assert 0.0 <= result["confidence_score"] <= 1.0

    def test_multiple_drugs_detected(self):
        text = "Nandrolone and Stanozolol detected. Multiple substances. Positive test."
        result = self.detector.detect(text)
        assert result["status"] == DrugDetectionStatus.DETECTED
        assert result["total_drugs_found"] >= 1

    def test_health_risks_populated(self):
        text = "Nandrolone detected. Positive result."
        result = self.detector.detect(text)
        if result["status"] == DrugDetectionStatus.DETECTED:
            assert isinstance(result["health_risks"], list)

    def test_get_drug_info(self):
        info = self.detector.get_drug_info("Nandrolone")
        assert info is not None
        assert info["name"] == "Nandrolone"
        assert "category" in info
        assert "risk_level" in info
        assert "health_risks" in info

    def test_get_drug_info_nonexistent(self):
        info = self.detector.get_drug_info("FakeDrug123")
        assert info is None

    def test_case_insensitive_detection(self):
        text = "NANDROLONE detected in URINE SAMPLE. POSITIVE."
        result = self.detector.detect(text)
        assert result["status"] == DrugDetectionStatus.DETECTED


class TestTextProcessor:

    def setup_method(self):
        self.processor = text_processor

    def test_clean_text(self):
        dirty = "  Hello   World  "
        clean = self.processor.clean_text(dirty)
        assert clean == "Hello World"

    def test_tokenize(self):
        text = "nandrolone detected in blood sample"
        tokens = self.processor.tokenize(text)
        assert "nandrolone" in tokens
        assert "detected" in tokens

    def test_ngrams(self):
        tokens = ["blood", "sample", "positive"]
        bigrams = self.processor.get_ngrams(tokens, 2)
        assert "blood sample" in bigrams
        assert "sample positive" in bigrams

    def test_extract_numeric_values(self):
        text = "Concentration: 25.5 ng/ml. Level: 10 µg/ml"
        values = self.processor.extract_numeric_values(text)
        assert len(values) >= 1

    def test_empty_text(self):
        result = self.processor.clean_text("")
        assert result == ""
