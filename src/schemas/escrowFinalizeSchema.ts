import { object, string } from "yup";
import { ESCROW_DEALS } from "enums";

import enumsValidator from "helpers/yup/enumsValidator";

const checkIsRequiredDealType_to_file = (
  [dealType]: Array<any>,
  schema: any
) => {
  return [ESCROW_DEALS.funds_to_file, ESCROW_DEALS.file_to_file].includes(
    dealType
  )
    ? schema.required()
    : schema.notRequired();
};

const escrowFinalizeSchema = object().shape({
  escrowId: string().required().label("Escrow Id"),
  dealType: enumsValidator(ESCROW_DEALS).required().label("Deal type"),
  orderContractId: string().required().label("Order Contract Id"),

  fileOriginalName: string()
    .when("dealType", checkIsRequiredDealType_to_file)
    .label("File Original Name"),
  fileContractId: string()
    .when("dealType", checkIsRequiredDealType_to_file)
    .label("Contract File Id"),
  fileMimeType: string()
    .when("dealType", checkIsRequiredDealType_to_file)
    .label("File mime Type"),
  fileSharedKey: string()
    .when("dealType", checkIsRequiredDealType_to_file)
    .label("File Shared Key"),
});

export default escrowFinalizeSchema;
