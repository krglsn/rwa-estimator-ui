# Web UI for RWA Estimator

## Overview

This project provides a web-based UI to demonstrate key user flows and concepts of the [RWA Estimator](https://github.com/krglsn/rwa-estimator).

- **No backend** or database is involved — the frontend connects directly to a specified blockchain network and wallet.
- **Role separation is not enforced** in this demo: all permissions are based solely on wallet access rights defined in the smart contract.
  - If you connect using a **Token Owner** wallet, you'll see and be able to use all corresponding functions.
  - If you connect as a **non-registered user**, you'll only be able to **Deposit** and **Withdraw** tokens.

---

## Getting Started

### Option 1: Run on Avalanche Fuji Testnet

You can connect directly to the RWA Estimator contracts already deployed on the [Avalanche Fuji Testnet](https://github.com/krglsn/rwa-estimator).

#### Steps

1. Set up your RPC/WS URLs in `.env.fuji`.

   > ⚠️ Free RPC providers may not support batch requests. Some UI features may not work correctly without a reliable endpoint.

2. Install dependencies and start the development server:

   ```bash
   pnpm install
   pnpm run dev:fuji
   ```

3. Open the browser using the local server URL shown in the terminal output.

---

### Option 2: Run on a Local Fork (for advanced testing)

This allows more controlled testing using a locally forked chain (e.g. Sepolia).

#### Steps

1. Start Anvil with a forked chain:

   ```bash
   anvil --block-time 2 --rpc-url https://sepolia.gateway.tenderly.co
   ```

2. Top up test accounts with native coins:

   ```bash
   cast send --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 <your-address> --value "6 ether" --unlocked
   ```

3. Deploy [RWA Estimator](https://github.com/krglsn/rwa-estimator) smart contracts to the local fork.

4. Update the frontend configuration with the deployed contract address in:

   ```ts
   src/config/chain.ts
   ```

5. Install dependencies and start the UI:

   ```bash
   pnpm install
   pnpm run dev:fuji
   ```
---

## Feedback & Contributions

This is a demo project — feedback and suggestions are welcome.  
Feel free to [open an issue](https://github.com/krglsn/rwa-estimator/issues) or submit a pull request.
