# MATKA Blockchain

Single-digit number gaming on BNB Smart Chain. Players stake USDT (BEP-20) on a digit from 0 to 9 within a scheduled session; a single winning digit is declared on-chain and winning bets settle through the smart contract.

**Website:** https://matkaworlds.com/
**Network:** BNB Smart Chain (BEP-20)
**Game contract:** `0x142092c3afb9Cb10621a6aeFe38896926E831a2c`

---

## Contents

- [Game rules](#game-rules)
- [Economics](#economics)
- [Repository structure](#repository-structure)
- [Requirements](#requirements)
- [Setup](#setup)
- [Environment variables](#environment-variables)
- [Contracts](#contracts)
- [Deploy & verify](#deploy--verify)
- [Dashboard](#dashboard)
- [Admin operations](#admin-operations)
- [Testing](#testing)
- [Security notes](#security-notes)
- [Disclaimer](#disclaimer)

---

## Game rules

1. User connects a BNB Chain wallet (MetaMask, Trust Wallet, Binance Web3 Wallet, or any WalletConnect wallet).
2. User picks an open session and a digit from 0–9, then stakes USDT.
3. Multiple bets per session are allowed — different digits, repeated digits, different amounts. Each bet settles independently.
4. When the betting window closes, the contract stops accepting new bets.
5. The authorised admin declares one winning digit for the session. It cannot be re-declared.
6. Winning bets become claimable; players withdraw to their own wallet.

Wallets are non-custodial — the platform never holds private keys.

## Economics

| Item | Value |
| --- | --- |
| Gross winning payout | 9× the bet amount |
| Admin charge | 10% of the gross winning amount |
| Net payout to player | 8.1× the bet amount |
| Fee on placing a bet | None (gas only) |
| Fee on a losing bet | None |
| Referral income | 10% of the referred player's bet amount |
| Referral qualification | Referred player must reach 100 USDT cumulative bets |
| Referral depth | Single level, direct referrals only |

```
grossWin   = betAmount * 9
adminFee   = grossWin * 10 / 100
netPayout  = grossWin - adminFee        // = betAmount * 8.1
referral   = betAmount * 10 / 100       // credited to referrer, win or lose
```

Referral reward is based on bet amount, not on whether the referred player wins.

> Payouts are fixed odds, not pool-based. A winning 100 USDT bet always nets 810 USDT regardless of how many other players joined the session — the treasury must therefore stay funded for the maximum outstanding exposure.

## Repository structure

```
contracts/          Solidity sources (game contract, interfaces)
scripts/            Deploy, verify and admin scripts
test/               Contract test suite
dashboard/          User Dashboard web app
  src/
    components/
    hooks/          Wallet connection, contract reads/writes
    abi/            Exported contract ABI
docs/               Whitepaper / Litepaper PDFs
```

Adjust this section to match the actual layout before publishing.

## Requirements

- Node.js 18 or newer
- npm or yarn
- A BNB Chain wallet with BNB for gas
- USDT (BEP-20) for testing on mainnet, or testnet USDT on BSC testnet

## Setup

```bash
git clone <repo-url>
cd matka-blockchain
npm install

# contracts
npx hardhat compile

# dashboard
cd dashboard
npm install
npm run dev
```

## Environment variables

Create a `.env` file in the project root. Never commit it.

```
PRIVATE_KEY=            # deployer / admin key — keep out of version control
BSC_RPC_URL=            # e.g. https://bsc-dataseed.binance.org
BSCSCAN_API_KEY=        # for contract verification
USDT_ADDRESS=           # USDT BEP-20 token address
TREASURY_ADDRESS=       # receives the 10% admin charge
```

Dashboard (`dashboard/.env`):

```
VITE_CHAIN_ID=56
VITE_CONTRACT_ADDRESS=0x142092c3afb9Cb10621a6aeFe38896926E831a2c
VITE_USDT_ADDRESS=
VITE_RPC_URL=
```

## Contracts

Core functions:

| Function | Caller | Purpose |
| --- | --- | --- |
| `placeBet(session, number, amount)` | Player | Transfers USDT in and records the bet. Reverts once the betting window has closed. |
| `declareResult(session, number)` | Admin | Records the winning digit for a closed session. One result per session, no re-declaration. |
| `claim(session)` | Player | Pays out net winnings (8.1× stake) for eligible bets. |
| `withdrawReferral()` | Player | Withdraws accumulated referral balance in USDT. |

Before `placeBet`, the player must approve the game contract to spend USDT:

```js
await usdt.approve(GAME_CONTRACT, amount);
await game.placeBet(sessionId, number, amount);
```

Amounts use USDT's 18 decimals on BSC — use `parseUnits(value, 18)`, not `parseEther` assumptions, and confirm the decimals of the token address you deploy against.

## Deploy & verify

```bash
npx hardhat run scripts/deploy.js --network bsc
npx hardhat verify --network bsc <deployed-address> <constructor-args>
```

After deploying, update:

- `VITE_CONTRACT_ADDRESS` in the dashboard env
- the contract address printed in the whitepaper, litepaper and website footer

## Dashboard

The User Dashboard covers:

- Wallet connection and USDT balance
- Available sessions and session status
- Number selection and bet placement
- Bet history: previous bets, numbers, amounts, session info, results
- Winnings: winning bets, claimable payouts, payout history
- Referrals: personal referral link, referred-player activity, referral rewards, withdrawals

Every bet, result and claim maps to a BNB Smart Chain transaction, so the dashboard should surface the transaction hash and a BscScan link for each action.

```bash
cd dashboard
npm run dev      # local development
npm run build    # production build
```

## Admin operations

Result declaration is a privileged on-chain call. Recommended practice:

- Keep the admin key in a hardware wallet or signer service, never in the repo or on a shared machine.
- Move to a multi-signature admin before scaling — this is listed as a Phase 2 item in the roadmap.
- Log every `declareResult` transaction hash for audit purposes.
- Monitor treasury balance against outstanding claimable winnings.

## Testing

```bash
npx hardhat test
npx hardhat coverage
```

Cases worth covering:

- Bet rejected after the betting window closes
- Result cannot be declared twice for the same session
- Payout equals exactly 8.1× the stake after the 10% admin charge
- Referral credited only after the referred player crosses 100 USDT cumulative
- Referral credited on losing bets as well as winning ones
- Claim cannot be replayed for an already-claimed bet
- Non-admin cannot call `declareResult`

## Security notes

- Result declaration is currently centralised. On-chain verifiable randomness / VRF is the Phase 4 plan; until then the trust assumption should be stated plainly to users.
- Guard `claim` and `withdrawReferral` against reentrancy and double-spend.
- Validate that `number` is within 0–9 and that `amount` is above a configured minimum.
- Get an independent audit before handling significant volume (Phase 2 roadmap item).
- The platform never asks for seed phrases or private keys. Users should approve USDT spending only for the verified contract address above.

## Disclaimer

This software is for a game of chance involving real funds. Participation is restricted to users aged 18 or older, or the higher legal age in their jurisdiction, and only where permitted by local law. Online gambling is prohibited or restricted in many jurisdictions, including several Indian states — confirm the legal position for every market you operate in before launch. Nothing in this repository is legal or financial advice.


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
