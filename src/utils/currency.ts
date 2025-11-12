import { type Currency } from "../models/currency";

export function transferCurrency(from: Currency, to: Currency, amount: Currency): void {
        from.platinum -= amount.platinum;
        from.gold -= amount.gold;
        from.electrum -= amount.electrum;
        from.silver -= amount.silver;
        from.copper -= amount.copper;

        to.platinum += amount.platinum;
        to.gold += amount.gold;
        to.electrum += amount.electrum;
        to.silver += amount.silver;
        to.copper += amount.copper;
}