import { TransactionForm } from "./components/TransactionForm";
import { type Party } from "./models/party";
import { type PartyMember } from "./models/partyMember";
import { type Currency } from "./models/currency";
import { addCurrency, transferCurrency } from "./utils/currency";
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

  function handleSubmitTransaction(formData: FormData) {
    const type = formData.get("transactionType") as string;

    const amount: Currency = {
      platinum: Number(formData.get("platinum")),
      gold: Number(formData.get("gold")),
      electrum: Number(formData.get("electrum")),
      silver: Number(formData.get("silver")),
      copper: Number(formData.get("copper")),
    };

    if (type === "transfer") {
      const fromWalletId = formData.get("fromWallet") as string;
      const toWalletId = formData.get("toWallet") as string;

      if (fromWalletId === toWalletId) {
        alert("You cannot transfer to the same wallet.");
        return;
      }

      // 1. Deep Copy
      const newParty = {
        ...party,
        treasury: { ...party.treasury },
        members: party.members.map((member) => ({
          ...member,
          wallet: { ...member.wallet },
        })),
      };

      // 2. Find the actual wallet OBJECTS
      let fromWallet: Currency | undefined;
      if (fromWalletId === "treasury") {
        fromWallet = newParty.treasury;
      } else {
        fromWallet = newParty.members.find(
          (m) => m.id === fromWalletId,
        )?.wallet;
      }

      // Now do the same for the 'to' wallet
      let toWallet: Currency | undefined;
      if (toWalletId === "treasury") {
        toWallet = newParty.treasury;
      } else {
        toWallet = newParty.members.find((m) => m.id === toWalletId)?.wallet;
      }

      // 3. Make sure both wallets were found
      if (!fromWallet || !toWallet) {
        alert("Error: Could not find one of the wallets.");
        return;
      }

      // 4. Execute the transfer
      const success = transferCurrency(fromWallet, toWallet, amount);

      // 5. Update the state
      if (success) {
        setParty(newParty);
      } else {
        alert("Transfer failed! Insufficient funds.");
      }
    } else if (type === "deposit") {
      const toWalletId = formData.get("toWallet") as string;

      const newParty = {
        ...party,
        treasury: { ...party.treasury },
        members: party.members.map((member) => ({
          ...member,
          wallet: { ...member.wallet },
        })),
      };

      let targetWallet: Currency | undefined;
      if (toWalletId === "treasury") {
        targetWallet = newParty.treasury;
      } else {
        targetWallet = newParty.members.find(
          (m) => m.id === toWalletId,
        )?.wallet;
      }

      if (!targetWallet) {
        alert("Error: Could not find the wallet to deposit into.");
        return;
      }
      const success = addCurrency(targetWallet, amount);

      if (success) {
        setParty(newParty);
      } else {
        alert("Deposit failed: invalid amount entered.");
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
      <TransactionForm
        members={party.members}
        onSubmitTransaction={handleSubmitTransaction}
      />
    </div>
  );
}

const container = document.getElementById("root") as HTMLElement;
// Make that div container the root element for the react application
const root = createRoot(container);
// Render the App component into "root" div
root.render(<App />);
