import { CURRENCIES } from "enums";

export type Payment = {
  amount: number;
  currency: CURRENCIES;
};
