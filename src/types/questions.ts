export type QuestionCategory = string;

export type Question = {
  id: string;
  question: string;
  category: string; // This will store the custom category from mapping
  end_datetime: string;
  yes_value: number;
  no_value: number;
  status: 'active' | 'resolved_yes' | 'resolved_no';
  created_by: string;
  category_mapping?: Array<{ custom_category: string }>;
};

export type QuestionStats = {
  total: number;
  active: number;
  resolvedYes: number;
  resolvedNo: number;
};

// Remove or comment out the hardcoded CATEGORIES array since we're now fetching from DB
// export const CATEGORIES: { label: string; value: QuestionCategory }[] = [
//   { label: "Politics", value: "Politics" },
//   { label: "News", value: "News" },
//   { label: "India", value: "India" },
//   { label: "USA", value: "USA" },
//   { label: "Crypto", value: "Crypto" },
//   { label: "Space", value: "Space" },
//   { label: "Technology", value: "Technology" },
//   { label: "Others", value: "Others" }
// ];

// Define this type to fix form validation issues
export type QuestionFormValues = {
  question: string;
  category: string;
  dateString: string;
  time: string;
  yesValue: string;
  noValue: string;
};

export const validateQuestion = (data: Partial<QuestionFormValues>): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Skip validation if data is incomplete
  if (!data.category || !data.category.trim()) {
    errors.category = "Category is required";
    return errors;
  }

  // Date and time validation
  if (data.dateString && data.time) {
    const [day, month] = data.dateString.split('-').map(num => parseInt(num));
    const [hours, minutes] = data.time.split(':').map(num => parseInt(num));
    const selectedDate = new Date(2025, month - 1, day, hours, minutes);
    const now = new Date();
    
    if (selectedDate <= now) {
      errors.date = "End date and time must be in the future";
    }
  }

  // Yes/No value validation
  if (data.yesValue && data.noValue) {
    const yesValue = parseInt(data.yesValue);
    const noValue = parseInt(data.noValue);
    
    if (isNaN(yesValue) || isNaN(noValue)) {
      errors.values = "Yes and No values must be numbers";
    } else if (yesValue + noValue !== 100) {
      errors.values = "Yes and No values must total exactly 100";
    }
  }

  return errors;
};
