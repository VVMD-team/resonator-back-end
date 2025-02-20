import { object, string, array } from "yup";
import fileData from "./templates/fileData";

import { bufferSchema } from "./global";

const fileDataExtended = {
  ...fileData,
  id: string().required().label("File ID"),
  fileBuffer: bufferSchema,
};

const shareTransferBoxSchema = object().shape({
  recipientWalletPublicKey: string().required().label("Recipient Public Key"),
  boxId: string().required().label("Box ID"),
  filesData: array().of(object().shape(fileDataExtended)),
});

export default shareTransferBoxSchema;
