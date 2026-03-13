import re
from typing import List, Dict, Any, Optional, Tuple
from app.constants.drug_risk_levels import RiskLevel, DrugDetectionStatus
from app.ai_engine.text_processor import text_processor
from app.utils.logger import logger


# Comprehensive WADA banned substances database
BANNED_SUBSTANCES = {
    "Anabolic Steroids": {
        "risk": RiskLevel.HIGH,
        "substances": [
            {"name": "Nandrolone", "keywords": ["nandrolone", "deca-durabolin", "deca durabolin", "19-nortestosterone"]},
            {"name": "Stanozolol", "keywords": ["stanozolol", "winstrol", "stromba"]},
            {"name": "Testosterone", "keywords": ["testosterone", "testoviron", "sustanon", "androgen"]},
            {"name": "Oxandrolone", "keywords": ["oxandrolone", "anavar", "oxandrin"]},
            {"name": "Methandienone", "keywords": ["methandienone", "dianabol", "danabol", "methandrostenolone"]},
            {"name": "Boldenone", "keywords": ["boldenone", "equipoise"]},
            {"name": "Trenbolone", "keywords": ["trenbolone", "parabolan"]},
        ],
    },
    "Peptide Hormones": {
        "risk": RiskLevel.HIGH,
        "substances": [
            {"name": "EPO (Erythropoietin)", "keywords": ["epo", "erythropoietin", "epogen", "procrit"]},
            {"name": "HGH (Human Growth Hormone)", "keywords": ["hgh", "human growth hormone", "somatotropin", "growth hormone"]},
            {"name": "IGF-1", "keywords": ["igf-1", "igf1", "insulin-like growth factor"]},
        ],
    },
    "Stimulants": {
        "risk": RiskLevel.MEDIUM,
        "substances": [
            {"name": "Amphetamine", "keywords": ["amphetamine", "adderall", "dextroamphetamine"]},
            {"name": "Cocaine", "keywords": ["cocaine", "benzoylecgonine", "coca"]},
            {"name": "MDMA", "keywords": ["mdma", "ecstasy", "methylenedioxymethamphetamine"]},
            {"name": "Ephedrine", "keywords": ["ephedrine", "pseudoephedrine", "norephedrine"]},
            {"name": "Modafinil", "keywords": ["modafinil", "provigil", "armodafinil"]},
        ],
    },
    "Beta-2 Agonists": {
        "risk": RiskLevel.MEDIUM,
        "substances": [
            {"name": "Clenbuterol", "keywords": ["clenbuterol", "spiropent", "ventipulmin"]},
            {"name": "Salbutamol (High dose)", "keywords": ["salbutamol", "albuterol", "ventolin"]},
            {"name": "Salmeterol (Banned route)", "keywords": ["salmeterol", "serevent"]},
        ],
    },
    "Diuretics": {
        "risk": RiskLevel.MEDIUM,
        "substances": [
            {"name": "Furosemide", "keywords": ["furosemide", "lasix", "frusemide"]},
            {"name": "Hydrochlorothiazide", "keywords": ["hydrochlorothiazide", "hctz"]},
            {"name": "Probenecid", "keywords": ["probenecid", "benemid"]},
        ],
    },
    "Narcotics": {
        "risk": RiskLevel.CRITICAL,
        "substances": [
            {"name": "Morphine", "keywords": ["morphine", "ms contin", "oramorph"]},
            {"name": "Heroin", "keywords": ["heroin", "diacetylmorphine", "diamorphine"]},
            {"name": "Oxycodone", "keywords": ["oxycodone", "oxycontin", "percocet"]},
            {"name": "Fentanyl", "keywords": ["fentanyl", "duragesic", "actiq"]},
        ],
    },
    "Cannabinoids": {
        "risk": RiskLevel.LOW,
        "substances": [
            {"name": "THC (Cannabis)", "keywords": ["thc", "cannabis", "marijuana", "cannabinoids", "delta-9"]},
            {"name": "Synthetic Cannabinoids", "keywords": ["synthetic cannabinoids", "spice", "k2"]},
        ],
    },
    "Beta-Blockers": {
        "risk": RiskLevel.LOW,
        "substances": [
            {"name": "Propranolol", "keywords": ["propranolol", "inderal"]},
            {"name": "Atenolol", "keywords": ["atenolol", "tenormin"]},
            {"name": "Metoprolol", "keywords": ["metoprolol", "lopressor", "toprol"]},
        ],
    },
}

HEALTH_RISKS = {
    RiskLevel.LOW: ["Mild performance enhancement", "Minor cardiovascular effects"],
    RiskLevel.MEDIUM: ["Hormonal imbalance", "Cardiovascular strain", "Liver stress"],
    RiskLevel.HIGH: ["Severe liver damage", "Hormone disruption", "Heart enlargement", "Infertility"],
    RiskLevel.CRITICAL: ["Life-threatening cardiac events", "Severe addiction", "Organ failure"],
}


class DrugDetector:
    """AI-powered drug detection engine using keyword matching + confidence scoring."""

    def __init__(self):
        self._build_detection_index()

    def _build_detection_index(self):
        """Build keyword-to-drug mapping index."""
        self.keyword_index: Dict[str, Dict[str, Any]] = {}
        for category, data in BANNED_SUBSTANCES.items():
            for substance in data["substances"]:
                for keyword in substance["keywords"]:
                    self.keyword_index[keyword.lower()] = {
                        "drug_name": substance["name"],
                        "category": category,
                        "risk_level": data["risk"],
                        "all_keywords": substance["keywords"],
                    }

    def detect(self, text: str) -> Dict[str, Any]:
        """Main detection method."""
        if not text or len(text.strip()) < 10:
            return self._empty_result()

        cleaned_text = text.lower()
        tokens = text_processor.tokenize(cleaned_text)
        bigrams = text_processor.get_ngrams(tokens, 2)
        trigrams = text_processor.get_ngrams(tokens, 3)
        all_grams = tokens + bigrams + trigrams

        detected = {}
        match_details = []

        for gram in all_grams:
            if gram in self.keyword_index:
                info = self.keyword_index[gram]
                drug_name = info["drug_name"]
                if drug_name not in detected:
                    detected[drug_name] = {
                        "drug_name": drug_name,
                        "category": info["category"],
                        "risk_level": info["risk_level"],
                        "matches": [],
                        "health_risks": HEALTH_RISKS.get(info["risk_level"], []),
                    }
                detected[drug_name]["matches"].append(gram)
                match_details.append({"keyword": gram, "drug": drug_name})

        if not detected:
            return {
                "status": DrugDetectionStatus.CLEAN,
                "detected_drugs": [],
                "risk_level": None,
                "confidence_score": self._calculate_clean_confidence(text),
                "match_details": [],
                "health_risks": [],
                "total_drugs_found": 0,
            }

        # Determine highest risk
        risk_priority = [RiskLevel.CRITICAL, RiskLevel.HIGH, RiskLevel.MEDIUM, RiskLevel.LOW]
        highest_risk = RiskLevel.LOW
        for drug_info in detected.values():
            if risk_priority.index(drug_info["risk_level"]) < risk_priority.index(highest_risk):
                highest_risk = drug_info["risk_level"]

        # Confidence: more matches + critical keywords = higher confidence
        confidence = self._calculate_detection_confidence(detected, text)

        detected_list = list(detected.values())
        all_health_risks = list(set(
            risk for d in detected_list for risk in d.get("health_risks", [])
        ))

        return {
            "status": DrugDetectionStatus.DETECTED,
            "detected_drugs": detected_list,
            "risk_level": highest_risk,
            "confidence_score": confidence,
            "match_details": match_details,
            "health_risks": all_health_risks,
            "total_drugs_found": len(detected),
        }

    def _calculate_detection_confidence(self, detected: Dict, text: str) -> float:
        """Calculate confidence score for detections."""
        total_matches = sum(len(d["matches"]) for d in detected.values())
        base_confidence = min(0.5 + (total_matches * 0.05), 0.98)

        # Boost confidence if medical context words present
        medical_context = ["test", "analysis", "positive", "detected", "found", "result",
                           "laboratory", "sample", "urine", "blood", "serum"]
        context_hits = sum(1 for word in medical_context if word in text.lower())
        context_boost = min(context_hits * 0.02, 0.1)

        return round(min(base_confidence + context_boost, 0.99), 4)

    def _calculate_clean_confidence(self, text: str) -> float:
        """Confidence that report is clean."""
        negative_indicators = ["negative", "not detected", "no banned", "clean", "pass", "cleared"]
        hits = sum(1 for word in negative_indicators if word in text.lower())
        base = 0.75 + (hits * 0.04)
        return round(min(base, 0.97), 4)

    def _empty_result(self) -> Dict[str, Any]:
        return {
            "status": DrugDetectionStatus.INCONCLUSIVE,
            "detected_drugs": [],
            "risk_level": None,
            "confidence_score": 0.0,
            "match_details": [],
            "health_risks": [],
            "total_drugs_found": 0,
        }

    def get_drug_info(self, drug_name: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific drug."""
        for category, data in BANNED_SUBSTANCES.items():
            for substance in data["substances"]:
                if substance["name"].lower() == drug_name.lower():
                    return {
                        "name": substance["name"],
                        "category": category,
                        "risk_level": data["risk"],
                        "health_risks": HEALTH_RISKS.get(data["risk"], []),
                        "keywords": substance["keywords"],
                    }
        return None


drug_detector = DrugDetector()
