export type InquiryFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | {
      status: "error";
      message: string;
      fieldErrors: Record<string, string[]>;
      /** Wartości do ponownego wypełnienia formularza po błędzie. */
      values: Record<string, string>;
    };

export const initialInquiryState: InquiryFormState = { status: "idle" };

export type NewInquiry = {
  vehicleSlug?: string;
  name: string;
  email: string;
  phone: string;
  startDate?: string;
  endDate?: string;
  message?: string;
  consentAt: Date;
};
