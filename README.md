# 🪙 MiningBot

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-purple?logo=ethereum&logoColor=white)](https://ethereum.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-0db7ed?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

### 🤖 Automated Sepolia ETH Miner for AI & Web3 Research

**MiningBot** automates the collection, management, and distribution of **Sepolia ETH** across multiple wallets.  
It’s built for developers and researchers who require constant testnet liquidity for experiments on Ethereum-based systems.  

Developed as part of the **AI & Blockchain Research Lab** at *The Hebrew University of Jerusalem* under Prof. Renana Peres.

---

## ⚙️ Features

- ⚡ **Parallel mining** – concurrent faucet requests with async or Docker workers  
- 🔐 **Secure wallet handling** – environment-based private-key management  
- 🌐 **RPC integration** – works with **Infura**, **Alchemy**, or any custom endpoint  
- 🧠 **Smart scheduling** – timed requests to prevent faucet bans  
- 🪄 **Automated fund redistribution** – balances wallets dynamically for experiments  
- 🧰 **Docker-ready** deployment

---

# 🧭 Architecture
+-------------------+
| Scheduler |
| (Timer / Cron) |
+--------+----------+
|
v
+-------------------+
| Mining Manager |
| (Parallel Faucet) |
+--------+----------+
|
v
+-------------------+
| Wallet Handler |
| (Keys / Balances) |
+-------------------+


---

## 🧩 Tech Stack

| Category | Tools |
|-----------|-------|
| Language |  JavaScript |
| Blockchain |  Ethereum Sepolia Testnet |
| Infrastructure |  Infura RPC |
| Automation |  Docker / asyncio |
| Security |  `.env` key management |

---

## 🔧 Installation

# Clone the repo
git clone https://github.com/NirEllor/MiningBot.git
cd MiningBot

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# 🧠 Usage
npm miner.js

# ⚙️ Environment Variables
INFURA_API_KEY=your_infura_key
PRIVATE_KEY=your_private_wallet_key
WALLET_ADDRESS=0xYourWallet
MINING_INTERVAL=60   # seconds between mining cycles

# 🐳 Docker Support
docker build -t miningbot .
docker run -d --env-file .env miningbot


# 📊 Example Output
[INFO] Mining round started...
[INFO] Wallet 0x1a3f... received 0.1 SepoliaETH
[INFO] Balances reallocated successfully
[INFO] Sleeping for 60 seconds...

# 👨‍💻 Author
Nir Ellor
Full-Stack Web3 & AI Developer


