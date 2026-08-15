import { useCallback, useEffect, useRef, useState } from "react";
import {
  resolveSchema,
  type ValidationErrors,
  type ValidationSchema,
} from "@/core/utils/validation";

export type UseFormOptions<TValues extends Record<string, unknown>> = {
  schema: ValidationSchema<TValues>;
  defaultValues: TValues;
  onSubmit: (values: TValues) => void | Promise<void>;
};

/**
 * The form instance every `use<Entity>Form` hook wraps: values bound to a
 * schema resolver, per-field errors that clear as the user types, a reset that
 * re-hydrates from an edit payload, and a submit guard.
 */
export const useForm = <TValues extends Record<string, unknown>>({
  schema,
  defaultValues,
  onSubmit,
}: UseFormOptions<TValues>) => {
  const [values, setValues] = useState<TValues>(defaultValues);
  const [errors, setErrors] = useState<ValidationErrors<TValues>>({});
  const [submitting, setSubmitting] = useState(false);

  // Keeps `reset()` stable while still restoring the latest defaults.
  const defaultsRef = useRef(defaultValues);
  useEffect(() => {
    defaultsRef.current = defaultValues;
  }, [defaultValues]);

  const setField = useCallback(
    <TField extends keyof TValues>(field: TField, value: TValues[TField]) => {
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) =>
        current[field] ? { ...current, [field]: undefined } : current,
      );
    },
    [],
  );

  const reset = useCallback((next?: Partial<TValues>) => {
    setValues({ ...defaultsRef.current, ...next });
    setErrors({});
  }, []);

  const setFormErrors = useCallback((next: ValidationErrors<TValues>) => {
    setErrors(next);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;

    const nextErrors = resolveSchema(schema, values);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  }, [onSubmit, schema, submitting, values]);

  return {
    values,
    errors,
    submitting,
    setField,
    setFormErrors,
    reset,
    handleSubmit,
  };
};

export default useForm;
