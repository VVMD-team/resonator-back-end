import { object, string } from "yup";

const removeFileOwnerSchema = object().shape({
  fileId: string().required().label("File ID"),
});

export default removeFileOwnerSchema;
