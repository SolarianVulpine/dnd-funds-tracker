import { useId, useState } from "react";
import { type PartyMember } from "../models/partyMember";

interface TransactionFormProps {
  members: PartyMember[];
  onSubmitTransaction: (formData: FormData) => void;
}

export function TransactionForm({
  members,
  onSubmitTransaction,
}: TransactionFormProps) {
  const [transactionType, setTransactionType] = useState("transfer");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSubmitTransaction(formData);
  }

  const platinumInputId = useId();
  const goldInputId = useId();
  const electrumInputId = useId();
  const silverInputId = useId();
  const copperInputId = useId();
  return (
    <form onSubmit={handleSubmit}>
      <h3>New Transaction</h3>
      <div>
        <button type="button" onClick={() => setTransactionType("transfer")}>
          Transfer
        </button>
        <button type="button" onClick={() => setTransactionType("deposit")}>
          Deposit Loot
        </button>
      </div>
      <label htmlFor={platinumInputId}>Platinum:</label>
      <input
        id={platinumInputId}
        name="platinum"
        type="number"
        defaultValue={0}
      />
      <label htmlFor={goldInputId}>Gold:</label>
      <input id={goldInputId} name="gold" type="number" defaultValue={0} />

      <label htmlFor={electrumInputId}>Electrum:</label>
      <input
        id={electrumInputId}
        name="electrum"
        type="number"
        defaultValue={0}
      />

      <label htmlFor={silverInputId}>Silver:</label>
      <input id={silverInputId} name="silver" type="number" defaultValue={0} />

      <label htmlFor={copperInputId}>Copper:</label>
      <input id={copperInputId} name="copper" type="number" defaultValue={0} />

      {transactionType === "transfer" ? (
        <>
          <label htmlFor="from-wallet-select">From Wallet:</label>
          <select id="from-wallet-select" name="fromWallet">
            <option value="treasury">Treasury</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </>
      ) : null}

      <label htmlFor="to-wallet-select">
        {transactionType === "transfer" ? "To Wallet:" : "Deposit To:"}
      </label>
      <select id="to-wallet-select" name="toWallet">
        <option value="treasury">Treasury</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </select>
      <button type="submit">Submit</button>
    </form>
  );
}
