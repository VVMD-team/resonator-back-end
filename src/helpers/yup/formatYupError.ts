import { ValidationError } from "yup";

export default function formatYupError(error: ValidationError) {
  return error.errors.map((message) => ({
    status: 400,
    fieldName: error.path,
    message,
  }));
}
