# thenothingapp
---

````markdown
# The Nothing App

**The Nothing App** is a minimalist, decentralized web application where nothing becomes something — one user at a time. Starting from a blank screen, each new wallet-connected user mints a `$NTH` token on the Avalanche blockchain and creates a visual node in a growing, real-time universe. Every action impacts the economy and the interface. No buttons. No feed. Just presence turned into value.

---

## 🌌 Features

- 🕳 **Blank Canvas UI** — The app begins with nothing. Literally.
- 🔗 **Wallet Integration** — Connect with MetaMask or any WalletConnect-compatible wallet.
- 🪙 **$NTH Token Minting** — Mint a native token upon sign-up (first-time only).
- 🌐 **Node Generation** — Each user is visualized as a glowing node based on wallet hash.
- 📈 **Dynamic Token Economy**  
  - Mint: increases token price  
  - Burn: removes tokens and lowers price  
  - Sell: redistributes AVAX, decreases price
- 🔁 **Real-Time Sync** — See new users appear live via Firebase or Socket.io.

---

## 🧱 Tech Stack

| Layer        | Technology                          |
|--------------|--------------------------------------|
| Frontend     | Next.js, Tailwind CSS, Ethers.js     |
| Wallet Auth  | WalletConnect, MetaMask              |
| Blockchain   | Solidity smart contract on Avalanche |
| Tokenomics   | Custom ERC-20 bonding curve token    |
| Real-Time DB | Firebase Realtime Database           |
| Hosting      | Vercel (or Netlify)                  |

---

## 🚀 Getting Started

### 1. Clone the Repo
```bash
git clone https://github.com/yourusername/nothing-app.git
cd nothing-app
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_CONTRACT_ADDRESS=...
NEXT_PUBLIC_ALCHEMY_API=...
```

### 4. Run Locally

```bash
npm run dev
```

---

## 🔐 Smart Contracts

* Language: Solidity
* Network: Avalanche C-Chain
* Key Functions:

  * `signupMint()`: Mints 1 `$NTH` token on first sign-in
  * `burn(uint256 amount)`: Burns tokens, lowers price
  * `sell(uint256 amount)`: Sells tokens for AVAX, reduces token price

> Contract address and explorer link will be added here.

---

## 📦 Folder Structure

```
/contracts        → Solidity token contract
/pages            → Next.js routes
/components       → Visual and UI components
/lib              → Wallet & Web3 helpers
/public           → Static assets
```

---

## ✨ Contributing

We welcome contributions! Feel free to:

* Suggest features
* Open issues
* Submit pull requests

---

## 📄 License

MIT © 2025 — Built with zero UI, full intention.

---

## 🙏 Credits

Created by [Marcus Mattus](https://github.com/marcusmattus)
Powered by Avalanche, Firebase, and open source curiosity.
