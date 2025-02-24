import { object, string } from "yup";
import fileData from "./templates/fileData";

const shareTransferFileSchema = object().shape({
  recipientWalletPublicKey: string().required().label("Recipient Public Key"),
  fileId: string().required().label("File ID"),
  ...fileData,
});

export default shareTransferFileSchema;
