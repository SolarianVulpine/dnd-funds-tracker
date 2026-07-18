# Dnd Party Funds Tracker

One day, while looting the now-smoldering ruins of a circus run by murderous vampiric clowns, my druid and her teammates came across a pile of riches large enough to create a new problem: how do you split loot fairly without doing a lot of math by hand?

This app is built to solve that exact problem for Dungeons & Dragons parties. It tracks a shared treasury, individual member wallets, and the movement of currency between them so the party can focus on adventuring instead of bookkeeping.

## Table of Contents

- [Dnd Party Funds Tracker](#dnd-party-funds-tracker)
  - [Table of Contents](#table-of-contents)
  - [Project Description](#project-description)
  - [Usage / How It Works](#usage--how-it-works)
  - [Development Progress](#development-progress)
  - [Installation](#installation)
  - [Tech Stack](#tech-stack)
  - [Future Roadmap](#future-roadmap)
  - [Author](#author)

## Project Description

This project was built to make party bookkeeping less tedious for tabletop campaigns while keeping the process thematic and easy to follow. Instead of manually tracking who holds what, the app keeps a simple `Party` object with a shared treasury and a set of party members, each with their own wallet.

It currently supports two core actions:

- transferring currency between wallets
- depositing loot into a chosen wallet

The app uses a simple in-memory state model for now, so it is best suited for local play, prototyping, or demonstrating the core finance workflow before backend features are added.

## Usage / How It Works

When the app loads, it renders a sample party with a treasury and two members. The main state lives in `src/index.tsx`, and the `TransactionForm` component sends form data back to the app through a callback.

Currency handling is split into two helpers in `src/utils/currency.ts`:

- `transferCurrency(from, to, amount)` checks for sufficient funds before moving values between wallets.
- `addCurrency(target, amount)` adds funds to a wallet and rejects negative values.

The form supports both transaction modes:

- Transfer: move currency from one wallet to another.
- Deposit Loot: add currency directly to a selected wallet.

The app currently uses React state only. There is no authentication, persistence, or backend storage yet.

## Development Progress

<details>

<summary><b>Milestone 1: Core Logic and Initial UI</b></summary>

- Defined the core TypeScript models for `Currency`, `PartyMember`, and `Party`.
- Built the `transferCurrency` helper in `src/utils/currency.ts` to move funds safely and prevent negative balances.
- Set up the main React app in `src/index.tsx` with sample party data and `useState`-driven state management.
- Rendered the treasury and member wallets dynamically from the party state.
- Added an early test transfer flow to prove that state updates and re-renders worked correctly.

</details>

<details>

<summary><b>Milestone 2: Building the Transaction Form</b></summary>

- Created a reusable `TransactionForm` component in `src/components/TransactionForm.tsx`.
- Wired the form to generate wallet dropdowns from the current party members.
- Used `FormData` on submit so the component could pass data upward cleanly.
- Lifted transaction handling into the parent app through `onSubmitTransaction`.
- Noted the edge case of transferring to the same wallet and handled it explicitly.

</details>

<details>

<summary><b>Milestone 3: Implementing Full Transaction Logic</b></summary>

- Finished `handleSubmitTransaction` in `src/index.tsx` as the central transaction handler.
- Added wallet lookup logic for both the treasury and individual party members.
- Added validation for same-wallet transfers, missing wallets, and insufficient funds.
- Updated the app state only after a successful transfer or deposit.
- Removed the older test transfer button once the form handled the real workflow.

</details>

## Installation

Prerequisite: Node.js 20 or newer is recommended.

```bash
git clone https://github.com/SolarianVulpine/dnd-funds-tracker
cd dnd-funds-tracker
npm install
npm run dev
```

Useful scripts:

```bash
npm run build
npm run preview
npm run lint
npm run format
```

## Tech Stack

- React 19
- TypeScript
- Vite
- ESLint
- Prettier

## Future Roadmap

- transaction history and logging
- user accounts and authentication
- persistent storage for parties and members
- richer UI styling and balance summaries
- optional screenshots or a short demo video once the UI is finalized

## Author

Built by Torin Teale - SolarianVulpine
