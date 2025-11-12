# Dnd Party Funds Tracker

One day while looting the now smoldering ruins of a circus (it was run by
murderous vampiric clowns! it needed to be dismantled, I promise) my druid
and her teammates came across a large sum of various riches. Delighted as we were, our group was not immediately eager to do the math needed to divide the
loot between us.

The purpose of this App is to allow dnd players to keep track of the
collective net worth of their party (in currency, this app is not
intended to track the many non-coin items a party may collect).
There will exist a central pool of resources from which party members
may draw and deposit different units of currency. Each transaction being logged
with the party member associated with the exchange, for tracking purposes.

Inspired by multi-user campaign managment sites like [DndBeyond](https://www.dndbeyond.com/) and [Scabard](https://www.scabard.com/pbs/), users will be
able to create their party and add members. The individual party members will be eligable for claim by another user but would also be trackable without an
active claim being necessary (let's assume the party manager — treasurer? — retains
custody of unclaimed party members until otherwise handled).

To keep track of users and their actions I'll need authentication and profile handling. I'm looking into using **Google Cloud** services for managing such things on the backend.

For now I'll be constructing something very basic using React and Typescript.

### Data Models

The core data structure of the application is defined by the following TypeScript interfaces:

- **`Currency`**: Represents a collection of all coin types.
  - `platinum: number`
  - `gold: number`
  - `electrum: number`
  - `silver: number`
  - `copper: number`

- **`PartyMember`**: Represents a single character in the party.
  - `id: string`: A unique identifier for the member.
  - `name: string`: The character's name.
  - `wallet: Currency`: The member's personal funds.
  - `imageUrl?: string`: An optional URL for a character portrait.

- **`Party`**: Represents the entire adventuring party.
  - `id: string`: A unique identifier for the party.
  - `name: string`: The name of the party.
  - `members: PartyMember[]`: An array containing all members of the party.
  - `treasury: Currency`: The party's shared treasury.

### Necessary Functionality

#### Front-End (React)

The user interface will be built with several key components:

- **`LoginForm`**: For user authentication.
- **`AccountBalance`**: To display currency totals (for the party, the treasury, and individual members).
- **`TransactionForm`**: To handle moving currency between the treasury and party members.
- **`TransactionHistory`**: To show a log of all past transactions.

State Management will be handled using React's built-in hooks like `useState` for simple component-level state. The UI will be styled using a framework like Bootstrap or Tailwind CSS.

### Development Progress

**Milestone 1: Core Logic and Initial UI**

- **Data Models Created**: Defined TypeScript interfaces for `Currency`, `PartyMember`, and `Party` to create a strong data structure.
- **Currency Utility Function**: Implemented a robust `transferCurrency` function in `src/utils/currency.ts`. This function safely handles transfers between wallets and includes validation to prevent negative balances.
- **React App Setup**:
  - Initialized the main `App` component in `src/index.tsx`.
  - Created sample data for a starting party.
  - Used the `useState` hook to manage the entire party object as the application's state.
- **Dynamic UI Rendering**:
  - The `App` component now dynamically renders the party name, the treasury contents, and a list of all party members with their individual wallets.
  - Used the `.map()` method to iterate over arrays and objects to generate JSX, a core pattern in React development.
- **State Update Demonstration**:
  - Added a test button and an event handler (`handleTestTransfer`) to demonstrate a state update.
  - Clicking the button uses the `transferCurrency` utility to move funds and then calls `setParty` with a new, updated party object to trigger a re-render. This successfully demonstrates the full state management loop.
- **Development Server**: Learned how to run the Vite development server with `npm run dev` to view and test the application in a browser.

### Currency Rates

> 1 Platinum piece (Pp) is equal to

- 10 Gold Pieces (Gp)
- 20 Electrum Pieces (Ep)
- 100 Silver Pieces (Sp)
- 1000 Copper pieces (Cp)
