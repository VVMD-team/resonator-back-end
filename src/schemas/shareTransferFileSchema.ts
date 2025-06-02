import { object, string, boolean } from "yup";
import fileData from "./templates/fileData";

const shareTransferFileSchema = object().shape({
  recipientWalletPublicKey: string().required().label("Recipient Public Key"),
  fileId: string().required().label("File ID"),
  ...fileData,

  conversationId: string(),
});

export default shareTransferFileSchema;
