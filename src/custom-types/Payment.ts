import { CURRENCIES } from "enums";

export type Payment = {
  amount: string;
  currency: CURRENCIES;
};
