import { type Currency } from "../models/currency";

export function transferCurrency(
  from: Currency,
  to: Currency,
  amount: Currency,
): boolean {
  const currencyTypes = Object.keys(amount) as (keyof Currency)[];

  for (const type of currencyTypes) {
    if (from[type] < amount[type]) {
      console.error(
        `Insufficient ${type} currency: Cannot transfer ${amount[type]} ${type}.`,
      );
      return false;
    }
  }

  for (const type of currencyTypes) {
    from[type] -= amount[type];
    to[type] += amount[type];
  }

  return true;
}

export function addCurrency(target: Currency, amount: Currency): boolean {
  const currencyTypes = Object.keys(amount) as (keyof Currency)[];

  for (const type of currencyTypes) {
    if (amount[type] < 0) {
      console.error(`Invalid amount for ${type}: ${amount[type]}`);
      return false;
    }
  }

  for (const type of currencyTypes) {
    target[type] += amount[type];
  }
  return true;
}
