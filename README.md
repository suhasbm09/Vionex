# Vionex

A **decentralized**, **AI-powered** platform bridging surplus and scarcity in healthcare.  
Donors can contribute medicines, and NGOs request exactly what they need—the matching is handled by an AI microservice and all transactions (confirmations & feedback) are immutably logged on Solana Devnet.

---

## 📋 Table of Contents

- [Features](#-features)  
- [Tech Stack](#-tech-stack)  
- [Prerequisites](#-prerequisites)  
- [Getting Started](#-getting-started)  
  - [1. Clone the Repo](#1-clone-the-repo)  
  - [2. Configure Environment](#2-configure-environment)  
  - [3. Install Dependencies](#3-install-dependencies)  
  - [4. Firebase Setup](#4-firebase-setup)  
  - [5. Solana & Anchor Setup](#5-solana--anchor-setup)  
  - [6. Build & Deploy Anchor Program](#6-build--deploy-anchor-program)  
  - [7. Run Services](#7-run-services)  
- [Usage](#-usage)  
- [Project Structure](#-project-structure)  
- [Contributing](#-contributing)  
- [License](#-license)  
- [Contact](#-contact)  

---

## 🌟 Features

- **Donor Portal**  
  - Sign up / log in via email  
  - Create, list, and manage medicine donations  
  - QR-code based handover verification  

- **NGO Portal**  
  - Sign up / log in via email  
  - AI-powered matching of available donations  
  - Request items with on-chain confirmation & feedback  
  - Immutable feedback logging on Solana Devnet  

- **AI Matcher**  
  - Flask microservice using fraud detection & match scoring  
  - Real-time recommendations based on expiry, quantity, location  

- **Blockchain Logging**  
  - Anchor/Rust smart contract records confirmations  
  - Backend serializes & submits Borsh-encoded transactions  
  - View transaction on Solscan Devnet  

---

## 🛠️ Tech Stack

| Layer           | Technology                                    |
| --------------- | --------------------------------------------- |
| Frontend        | React · TailwindCSS · Framer Motion · Vite     |
| UI Icons        | lucide-react                                   |
| Routing & State | React Router · React Context                   |
| Backend         | Node.js · Express · Firebase Admin             |
| Blockchain      | Solana Devnet · @solana/web3.js · Borsh        |
| Smart Contracts | Anchor (Rust)                                  |
| AI Matching     | Python · Flask · pandas                        |

---

## 📋 Prerequisites

- **Node.js** v16+ & **npm**  
- **Python** 3.8+  
- **Solana CLI** & **Anchor CLI**  
- **Firebase** project with service account JSON  
- **jq** (for IDL patching, optional)

---

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/suhasbm09/Vionex.git
cd Vionex

2. Configure Environment

Create a .env in backend/:

# backend/.env
FIREBASE_SERVICE_ACCOUNT=./serviceAccountKey.json
SOLANA_KEYPAIR=./vionex-keypair.json
ANCHOR_PROGRAM_ID=9dkwNagtgEGXme8zZfSvwtTwoTvG6thwhWmyohkrooGY

3. Install Dependencies

# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install express@4 cors firebase-admin @solana/web3.js borsh axios

# AI Matcher
cd ../ai_matcher
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

4. Firebase Setup

    Create a Firebase project.

    Generate a service account JSON and save as backend/serviceAccountKey.json.

    Enable Firestore in “Native” mode.

5. Solana & Anchor Setup

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.14.17/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor --tag v0.28.0 anchor-cli --locked

# Login & set Devnet
solana config set --url https://api.devnet.solana.com

6. Build & Deploy Anchor Program

cd solana/smart_contract
anchor build
anchor deploy --provider.cluster devnet
# Copy generated program ID into backend/.env ANCHOR_PROGRAM_ID

7. Run Services

# 1. AI Matcher (port 5001)
cd ai_matcher
source .venv/bin/activate
flask run --port 5001

# 2. Backend (port 5000)
cd ../backend
node app.js

# 3. Frontend (port 5173)
cd ../frontend
npm run dev

🎯 Usage

    Donor:

        Visit http://localhost:5173 → “I’m a Donor” → log in / set up profile → dashboard → + New Donation → Generate QR.

    NGO:

        Visit http://localhost:5173 → “I’m an NGO” → log in / set up profile → AI-recommended matches → Request → Confirm handover → Provide feedback.

    Blockchain:

        After feedback, click “View on Solscan” to inspect the transaction on Devnet.

📂 Project Structure

Vionex/
│
├─ ai_matcher/            # Python Flask service for AI matching & fraud detection
│  └─ app.py
│
├─ frontend/              # React + Vite + Tailwind client
│  └─ src/
│     ├─ pages/
│     ├─ components/
│     └─ index.css
│
├─ backend/               # Node.js + Express server
│  ├─ config/
│  │  └─ firebase.js
│  ├─ controllers/
│  ├─ routes/
│  ├─ solanaLogger.js     # Raw Borsh + web3.js integration
│  ├─ serviceAccountKey.json
│  └─ app.js
│
└─ solana/
   └─ smart_contract/     # Anchor framework Rust program
      └─ programs/
         └─ smart_contract/
            └─ src/lib.rs

