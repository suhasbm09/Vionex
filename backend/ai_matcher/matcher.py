from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

def detect_fraud(d):
    score, issues = 0, []
    # expiry
    try:
        exp = datetime.strptime(d["expiryDate"], "%Y-%m-%d")
        days = (exp - datetime.now()).days
        if days < 0:
            score += 30; issues.append("Expired")
        elif days <= 7:
            score += 15; issues.append("Expiring soon")
    except:
        score += 20; issues.append("Invalid expiryDate")
    # quantity
    try:
        q = int(d["quantity"])
        if q > 500:
            score += 25; issues.append("High quantity")
        elif q <= 0:
            score += 20; issues.append("Invalid quantity")
    except:
        score += 20; issues.append("Qty parse error")
    # missing fields
    for f in ["medicineName","expiryDate","quantity","location"]:
        if not d.get(f):
            score += 10; issues.append(f"Missing {f}")
    return score, issues

def score_match(ngo, d):
    # must match name
    if ngo["medicineRequest"]["name"].lower() != d["medicineName"].lower():
        return -1
    s = 0
    # location
    if ngo.get("location","").lower() == d.get("location","").lower():
        s += 20
    # quantity closeness
    try:
        diff = abs(int(ngo["medicineRequest"]["quantity"]) - int(d["quantity"]))
        s += 20 if diff==0 else (10 if diff<=5 else 0)
    except:
        pass
    # expiry bonus
    try:
        days = (datetime.strptime(d["expiryDate"], "%Y-%m-%d") - datetime.now()).days
        s += 15 if days>180 else (10 if days>90 else (5 if days>30 else 0))
    except:
        pass
    return s

@app.route('/match', methods=['POST'])
def match():
    data = request.get_json()
    ngo = data["ngoProfile"]
    donations = data["donations"]
    results = []
    for d in donations:
        fraud_score, issues = detect_fraud(d)
        mscore = score_match(ngo, d)
        if mscore >= 0:
            results.append({**d, "matchScore":mscore, "fraudScore":fraud_score, "fraudIssues":issues})
    results.sort(key=lambda x:(x["matchScore"], -x["fraudScore"]), reverse=True)
    return jsonify({ "matches": results })

if __name__ == '__main__':
    app.run(port=5001, debug=True)
