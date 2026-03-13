from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from app.middleware.auth_middleware import get_current_user
from app.ai_engine.drug_detector import drug_detector, BANNED_SUBSTANCES, HEALTH_RISKS
from app.constants.drug_risk_levels import RiskLevel

router = APIRouter(prefix="/chatbot", tags=["AI Chatbot"])

CHATBOT_RESPONSES = {
    "banned": "This substance is on the WADA prohibited list and is banned in all sports competitions.",
    "not_banned": "Based on our database, this substance is not currently on the WADA prohibited list. However, always verify with your team doctor before use.",
    "side_effects": "Prolonged use of performance-enhancing drugs can cause serious health issues including liver damage, hormonal imbalance, cardiovascular problems, and psychological effects.",
    "doping": "Doping refers to the use of prohibited substances or methods to enhance sports performance. It is banned by WADA and can result in suspension or permanent ban from competition.",
    "wada": "WADA (World Anti-Doping Agency) maintains the prohibited list and sets global anti-doping standards followed by all major sports organizations.",
    "default": "I can help you with questions about banned substances, side effects, anti-doping rules, and WADA guidelines. Please ask a specific question.",
}


class ChatMessage(BaseModel):
    message: str
    history: List[Dict[str, str]] = []


class ChatResponse(BaseModel):
    reply: str
    relevant_drugs: List[str] = []
    confidence: float = 0.0


@router.post("/chat", response_model=ChatResponse)
def chat(
    data: ChatMessage,
    current_user=Depends(get_current_user),
):
    message = data.message.lower().strip()

    # Check if user is asking about a specific drug
    relevant_drugs = []
    reply = CHATBOT_RESPONSES["default"]
    confidence = 0.5

    # Drug-specific queries
    for category, cat_data in BANNED_SUBSTANCES.items():
        for substance in cat_data["substances"]:
            for keyword in substance["keywords"]:
                if keyword in message:
                    relevant_drugs.append(substance["name"])
                    health_risks = HEALTH_RISKS.get(cat_data["risk"], [])
                    if any(w in message for w in ["banned", "prohibited", "legal", "allowed"]):
                        reply = f"{substance['name']} is BANNED under WADA rules (Category: {category}). Risk Level: {cat_data['risk'].value.upper()}."
                    elif any(w in message for w in ["side effect", "risk", "danger", "health"]):
                        reply = f"Health risks of {substance['name']}: {', '.join(health_risks)}. This is a {cat_data['risk'].value} risk substance."
                    else:
                        reply = f"{substance['name']} is a prohibited substance in the {category} category. Risk level: {cat_data['risk'].value.upper()}. {', '.join(health_risks[:2])}."
                    confidence = 0.92
                    break

    # General topic queries
    if not relevant_drugs:
        if any(w in message for w in ["doping", "anti-doping"]):
            reply = CHATBOT_RESPONSES["doping"]
            confidence = 0.88
        elif any(w in message for w in ["wada", "world anti-doping"]):
            reply = CHATBOT_RESPONSES["wada"]
            confidence = 0.88
        elif any(w in message for w in ["side effect", "danger", "risk", "health"]):
            reply = CHATBOT_RESPONSES["side_effects"]
            confidence = 0.80
        elif any(w in message for w in ["banned", "prohibited", "list"]):
            categories = list(BANNED_SUBSTANCES.keys())
            reply = f"WADA bans substances in these categories: {', '.join(categories)}. Always check with your team doctor before taking any medication."
            confidence = 0.85

    return ChatResponse(reply=reply, relevant_drugs=list(set(relevant_drugs)), confidence=confidence)
