# D&D Funds Tracker AI Coding Instructions

This document provides guidance for AI agents working on the D&D Funds Tracker codebase.

## 1. Core Architecture

The application is a single-page React app built with Vite and TypeScript. Its primary purpose is to manage a D&D party's finances.

- **Centralized State**: The entire application state is a single `Party` object managed in the `App` component (`src/index.tsx`) using the `useState` hook. All state updates must flow through this component.
- **Immutable State Updates**: All state modifications must be done immutably. Before changing the `party` object, create a deep copy. This is critical for React's change detection.
- **Data Models**: The core data structures are defined as TypeScript interfaces in the `src/models/` directory (`Party`, `PartyMember`, `Currency`). Always adhere to these interfaces.
- **Unidirectional Data Flow**: The `App` component is the single source of truth. It passes state and handler functions down to child components via props.
- **Lifting State Up**: Child components, like `TransactionForm`, do not manage their own state. They receive an `onSubmit` handler from the `App` component and use it to pass form data back up to the parent for processing. This is the primary mechanism for component interaction.

## 2. Developer Workflow

- **Running the App**: To start the development server, run `npm run dev`.
- **Building for Production**: To create a production build, run `npm run build`.
- **Dependencies**: All dependencies are managed in `package.json`. Use `npm install` to add new ones.

## 3. Key Files and Patterns

- **`src/index.tsx`**: The main application entry point. It contains the primary `App` component, which manages all state and business logic.
- **`src/components/TransactionForm.tsx`**: A reusable, controlled component for initiating currency transfers. It is a good example of the "lifting state up" pattern.
- **`src/utils/currency.ts`**: Contains pure functions for currency manipulation, such as `transferCurrency`. This function includes important validation logic (e.g., preventing negative balances) and should be used for all currency movements.
- **`src/models/`**: This directory is the source of truth for all data structures. When adding new features, start by defining or updating the models here.

## 4. How to Implement New Features

1.  **Update the Model**: If the feature involves new data, update the interfaces in `src/models/`.
2.  **Create a Component**: If the feature requires a new UI element, create a new component in `src/components/`.
3.  **Add Logic to `App`**: Implement the business logic for the new feature as a handler function within the `App` component in `src/index.tsx`.
4.  **Integrate**: Pass the necessary data and the new handler function down to the relevant child component as props.

## 5. Collaboration and Learning Workflow

This section outlines the preferred method of interaction to ensure the user is learning throughout the development process.

- **Teach, Then Code**: Before implementing any feature or making a change, first explain the relevant concepts, the plan of action, and the "why" behind the approach.
- **Confirm Understanding**: After explaining the plan, pause and confirm that the user understands the steps and feels confident they could replicate them. Do not proceed until the user gives a clear signal to continue.
- **Step-by-Step Implementation**: Break down the implementation into logical, sequential steps. Explain each step as you go.
- **Guided Practice**: The primary goal is not just to complete the task, but to empower the user to do it themselves. Frame your actions as guidance rather than autonomous work.
