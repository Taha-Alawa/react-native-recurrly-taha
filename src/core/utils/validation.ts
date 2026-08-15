import i18n from "@/core/i18n";

/**
 * Tiny validation layer (architecture §7).
 *
 * Deliberately not react-hook-form + zod: this app's forms are four fields deep
 * at most, and a 60-line resolver keeps the dependency surface — and the RN
 * bundle — unchanged. The shape is the same: a declarative schema, a form value
 * type inferred from it, and a resolver the form hook binds to.
 */

export type FieldValidator<TValue, TValues> = (
  value: TValue,
  values: TValues,
) => string | undefined;

export type ValidationSchema<TValues> = {
  [K in keyof TValues]?: FieldValidator<TValues[K], TValues>[];
};

export type ValidationErrors<TValues> = Partial<Record<keyof TValues, string>>;

/** Shared message helper, so wording stays uniform across every form. */
export const messages = {
  required: (field: string) =>
    i18n.t(`validation.${field}Required`, i18n.t("validation.required", "This field is required.")),
  invalid: (field: string) =>
    i18n.t(`validation.${field}Invalid`, i18n.t("validation.invalid", "That value isn't valid.")),
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validators = {
  required:
    <TValues>(message: string): FieldValidator<unknown, TValues> =>
    (value) => {
      if (value === null || value === undefined) return message;
      if (typeof value === "string" && !value.trim()) return message;
      return undefined;
    },

  email:
    <TValues>(message: string): FieldValidator<string, TValues> =>
    (value) =>
      EMAIL_PATTERN.test(String(value).trim()) ? undefined : message,

  minLength:
    <TValues>(length: number, message: string): FieldValidator<string, TValues> =>
    (value) =>
      String(value ?? "").length >= length ? undefined : message,

  /** Parses loosely (accepts a comma decimal separator) then range-checks. */
  number:
    <TValues>(
      message: string,
      { min, exclusiveMin }: { min?: number; exclusiveMin?: number } = {},
    ): FieldValidator<string | number, TValues> =>
    (value) => {
      const parsed = Number(String(value ?? "").replace(",", "."));
      if (!String(value ?? "").trim() || Number.isNaN(parsed)) return message;
      if (min !== undefined && parsed < min) return message;
      if (exclusiveMin !== undefined && parsed <= exclusiveMin) return message;
      return undefined;
    },

  matchesField:
    <TValues>(field: keyof TValues, message: string): FieldValidator<unknown, TValues> =>
    (value, values) =>
      value === values[field] ? undefined : message,
};

/** The resolver: runs a schema over a value set and collects the first error per field. */
export const resolveSchema = <TValues extends Record<string, unknown>>(
  schema: ValidationSchema<TValues>,
  values: TValues,
): ValidationErrors<TValues> => {
  const errors: ValidationErrors<TValues> = {};

  (Object.keys(schema) as (keyof TValues)[]).forEach((field) => {
    const fieldValidators = schema[field];
    if (!fieldValidators) return;

    for (const validate of fieldValidators) {
      const error = validate(values[field] as never, values);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });

  return errors;
};
