import { object, string } from "yup";
import fileData from "./templates/fileData";

const fileUploadSchema = object().shape({
  fileOriginalName: string().required().label("File Original Name"),
  fileMimeType: string().required().label("File mime Type"),
  boxId: string().label("Box ID"),
  ...fileData,
});

export default fileUploadSchema;
