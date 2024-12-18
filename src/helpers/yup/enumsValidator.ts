import * as yup from "yup";

const enumsValidator = <T extends Record<string, string | number>>(
  enumObject: T
) => {
  return yup
    .mixed<keyof T | T[keyof T]>()
    .oneOf(
      Object.values(enumObject) as T[keyof T][],
      `Allowed values: ${Object.values(enumObject).join(", ")}`
    );
};

export default enumsValidator;
