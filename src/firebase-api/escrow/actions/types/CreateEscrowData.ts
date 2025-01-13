import { Payment } from "custom-types/Payment";
import { ESCROW_DEALS } from "enums";

type CreateEscrowData = {
  contractOrderHash: string;
  ownerId: string;
  counterpartyAddress: string;
  name: string;
  description: string;
  dealType: ESCROW_DEALS;

  counterpartyFileName?: string;
  counterpartyFileContractId?: string;
  ownersfileContractId?: string;
  ownersFileName?: string;
  ownersPayment?: Payment;
  requestedCounterpartyPayment?: Payment;
};

export default CreateEscrowData;
