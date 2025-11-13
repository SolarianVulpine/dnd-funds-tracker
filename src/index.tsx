import { TransactionForm } from "./components/TransactionForm";
import { type Party } from "./models/party";
import { type PartyMember } from "./models/partyMember";
import { type Currency } from "./models/currency";
import { transferCurrency } from "./utils/currency";
import { createRoot } from "react-dom/client";
import { useState } from "react";

export function App() {
  const initialParty: Party = {
    id: "party-1",
    name: "The Merry Adventurers",
    treasury: {
      platinum: 10,
      gold: 100,
      electrum: 0,
      silver: 500,
      copper: 1000,
    },
    members: [
      {
        id: "member-1",
        name: "Boric the Fighter",
        wallet: { platinum: 0, gold: 10, electrum: 0, silver: 20, copper: 50 },
      },
      {
        id: "member-2",
        name: "Lyra the Rogue",
        wallet: { platinum: 0, gold: 15, electrum: 0, silver: 0, copper: 0 },
      },
    ],
  };
  const [party, setParty] = useState(initialParty);

  function handleTestTransfer() {
    const newParty = {
      ...party,
      treasury: { ...party.treasury },
      members: party.members.map((member) => ({
        ...member,
        wallet: { ...member.wallet },
      })),
    };

    const amountToTransfer = { platinum: 0, gold: 10, electrum: 0, silver: 0, copper: 0 };

    const targetMember = newParty.members.find((m) => m.id === "member-1");

    if (targetMember) {
      const success = transferCurrency(newParty.treasury, targetMember.wallet, amountToTransfer);

      if (success) {
        setParty(newParty);
      } else {
        alert("Transfer failed: Insufficient funds!");
      }
    }
  }

  return (
    <div>
      <h1>{party.name}</h1>
      <h2>Available Funds:</h2>
      <ul>
        {Object.entries(party.treasury).map(([currency, amount]) => (
          <li key={currency}>
            {currency}: {amount}
          </li>
        ))}
      </ul>
      <br></br>
      <h2>Members:</h2>
      <ul>
        {party.members.map((member) => (
          <li key={member.id}>
            <strong>{member.name}</strong>
            <ul>
              {Object.entries(member.wallet).map(([currency, amount]) => (
                <li key={currency}>
                  {currency}: {amount}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <button onClick={handleTestTransfer}>
        Transfer 10 Gold to Boric
      </button>
    </div>
  );
}

const container = document.getElementById("root") as HTMLElement;
// Make that div container the root element for the react application
const root = createRoot(container);
// Render the App component into "root" div
root.render(<App />);
