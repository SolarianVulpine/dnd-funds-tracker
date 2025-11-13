import { useId } from "react";
import { type PartyMember } from "../models/partyMember";

interface TransactionFormProps {
        members: PartyMember[];
        onSubmitTransaction: (formData: FormData) => void;
}

export function TransactionForm({ members, onSubmitTransaction }: TransactionFormProps) {
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
                        <label htmlFor={platinumInputId}>Platinum:</label>
                        <input id={platinumInputId} name="platinum" type="number" defaultValue={0} />
                        <label htmlFor={goldInputId}>Gold:</label>
                        <input id={goldInputId} name="gold" type="number" defaultValue={0} />
                        <label htmlFor={electrumInputId}>Electrum:</label>
                        <input id={electrumInputId} name="electrum" type="number" defaultValue={0} />
                        <label htmlFor={silverInputId}>Silver:</label>
                        <input id={silverInputId} name="silver" type="number" defaultValue={0} />
                        <label htmlFor={copperInputId}>Copper:</label>
                        <input id={copperInputId} name="copper" type="number" defaultValue={0} />
                        <label htmlFor="from-wallet-select">From Wallet:</label>
                        <select id="from-wallet-select" name="fromWallet">
                                <option value="treasury">Treasury</option>
                                {members.map((member) => (
                                        <option key={member.id} value={member.id}>
                                                {member.name}
                                        </option>
                                ))}
                        </select>
                        <label htmlFor="to-wallet-select">To Wallet:</label>
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


