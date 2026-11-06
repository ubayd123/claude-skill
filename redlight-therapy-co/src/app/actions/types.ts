export type FormState = {
  ok: boolean;
  message: string;
  reference?: string;
  errors?: Record<string, string>;
  link?: string;
};
export const initialFormState: FormState = { ok: false, message: "" };
