import { useId } from "react";

export function TransactionForm() {
        const platinumInputId = useId();
        const goldInputId = useId();
        const electrumInputId = useId();
        const silverInputId = useId();
        const copperInputId = useId();
        return (
                <form>
                        <h3>New Transaction</h3>
                        <label htmlFor={platinumInputId}>Platinum:</label>
                        <input id={platinumInputId} name="platinum" type="number" defaultValue={0}/>
                        <label htmlFor={goldInputId}>Gold:</label>
                        <input id={goldInputId} name="gold" type="number" defaultValue={0}/>
                        <label htmlFor={electrumInputId}>Electrum:</label>
                        <input id={electrumInputId} name="electrum" type="number" defaultValue={0}/>
                        <label htmlFor={silverInputId}>Silver:</label>
                        <input id={silverInputId} name="silver" type="number" defaultValue={0}/>
                        <label htmlFor={copperInputId}>Copper:</label>
                        <input id={copperInputId} name="copper" type="number" defaultValue={0}/>
                        <button type="submit">Submit</button>
                </form>
        );
}