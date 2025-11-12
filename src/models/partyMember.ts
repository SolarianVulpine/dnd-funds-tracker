import { type Currency } from "./currency";
export interface PartyMember {
        id: string;
        name: string;
        wallet: Currency;
        imageUrl?: string;
}