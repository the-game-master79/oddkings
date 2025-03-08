
import { z } from "zod";

const MIN_AGE = 16;

const dateRegex = /^\d{2}-\d{2}-\d{4}$/;

export const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  country: z.string().min(1, "Please select a country"),
  dateOfBirth: z.date({
    required_error: "Please select a date",
  }).refine((date) => {
    const today = new Date();
    let calculatedAge = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      calculatedAge--;
    }
    return calculatedAge >= MIN_AGE;
  }, `You must be at least ${MIN_AGE} years old`),
  residentialAddress: z.string()
    .min(5, "Address must be at least 5 characters")
    .regex(/^[a-zA-Z0-9\s,/&]+$/, "Only letters, numbers, spaces, commas, & and / are allowed"),
  occupation: z.string().min(2, "Occupation must be at least 2 characters"),
  documentType: z.enum(["passport", "national_id", "driving_license"], {
    required_error: "Please select a document type",
  }),
});

export type FormData = z.infer<typeof formSchema>;
