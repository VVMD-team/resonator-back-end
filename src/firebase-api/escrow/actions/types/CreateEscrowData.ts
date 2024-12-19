import { Payment } from "custom-types/Payment";
import { ESCROW_DEALS } from "enums";

type CreateEscrowData = {
  ownerId: string;
  counterpartyAddress: string;
  name: string;
  description: string;
  dealType: ESCROW_DEALS;

  ownersFileId?: string;
  ownersPayment?: Payment;
  requestedCounterpartyPayment?: Payment;
};

export default CreateEscrowData;
