from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

def detect_fraud(d):
    score, issues = 0, []
    try:
        exp = datetime.strptime(d["expiryDate"], "%Y-%m-%d")
        days = (exp - datetime.now()).days
        if days < 0:
            score += 30; issues.append("Expired")
        elif days <= 7:
            score += 15; issues.append("Expiring soon")
    except:
        score += 20; issues.append("Invalid expiryDate")
    try:
        q = int(d["quantity"])
        if q > 500:
            score += 25; issues.append("High quantity")
        elif q <= 0:
            score += 20; issues.append("Invalid quantity")
    except:
        score += 20; issues.append("Qty parse error")
    for f in ["medicineName", "expiryDate", "quantity", "location"]:
        if not d.get(f):
            score += 10; issues.append(f"Missing {f}")
    return score, issues

def score_match(ngo, d):
    if ngo["medicineRequest"]["name"].strip().lower() != d.get("medicineName", "").strip().lower():
        return -1
    score = 0
    if ngo.get("location", "").strip().lower() == d.get("location", "").strip().lower():
        score += 20
    try:
        diff = abs(int(ngo["medicineRequest"]["quantity"]) - int(d["quantity"]))
        score += 20 if diff == 0 else (10 if diff <= 5 else 0)
    except:
        pass
    try:
        days = (datetime.strptime(d["expiryDate"], "%Y-%m-%d") - datetime.now()).days
        score += 15 if days > 180 else (10 if days > 90 else (5 if days > 30 else 0))
    except:
        pass
    return score

@app.route('/match', methods=['POST'])
def match():
    data = request.get_json()
    ngo = data["ngoProfile"]
    donations = data["donations"]
    results = []

    for d in donations:
        fraud_score, issues = detect_fraud(d)
        match_score = score_match(ngo, d)

        result = {
            "id": d.get("id"),
            "medicineName": d.get("medicineName", "Unknown"),
            "quantity": d.get("quantity", 0),
            "expiryDate": d.get("expiryDate", ""),
            "donorId": d.get("donorId", ""),
            "donorLocation": d.get("location", ""),  # key renamed for frontend clarity
            "status": d.get("status", "Available"),
            "fraudScore": fraud_score,
            "fraudIssues": issues,
            "matchScore": max(match_score, 0),
            "recommended": match_score >= 10  # Threshold for recommendation
        }

        results.append(result)

    # Prioritize highest match scores, lowest fraud
    results.sort(key=lambda x: (x["recommended"], x["matchScore"], -x["fraudScore"]), reverse=True)

    return jsonify({ "matches": results })

if __name__ == '__main__':
    app.run(port=5001, debug=True)
