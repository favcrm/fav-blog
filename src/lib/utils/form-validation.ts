export interface FieldValidation {
  field: string;
  message: string;
}

export function isBlank(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

export function validateRequired(
  value: string | null | undefined,
  field: string,
  label: string,
): FieldValidation | null {
  return isBlank(value) ? { field, message: `${label} is required.` } : null;
}

export function validateEmail(
  value: string,
  field = "email",
): FieldValidation | null {
  if (isBlank(value)) return { field, message: "Email is required." };
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    ? null
    : { field, message: "Enter a valid email address." };
}

export function firstError(
  validations: Array<FieldValidation | null | false | undefined>,
): FieldValidation | null {
  return validations.find(Boolean) || null;
}
