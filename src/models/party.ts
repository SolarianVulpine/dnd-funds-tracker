import { type Currency } from "./currency";
import { type PartyMember } from "./partyMember";

export interface Party {
        id: string;
        name: string;
        members: PartyMember[];
        treasury: Currency;
}