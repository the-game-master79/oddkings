
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../types";
import { validateDate } from "../utils/validation";

interface DateOfBirthFieldProps {
  form: UseFormReturn<FormData>;
}

export const DateOfBirthField = ({ form }: DateOfBirthFieldProps) => {
  const [dateInput, setDateInput] = useState('');

  return (
    <FormField
      control={form.control}
      name="dateOfBirth"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Date of Birth (DD-MM-YYYY)</FormLabel>
          <FormControl>
            <Input
              placeholder="DD-MM-YYYY"
              value={dateInput || (field.value ? field.value.toLocaleDateString('en-GB') : '')}
              className={!validateDate(dateInput) && dateInput.length === 10 ? "border-red-500" : ""}
              onChange={(e) => {
                const value = e.target.value;
                setDateInput(value);
                
                if (value && value.length === 10 && validateDate(value)) {
                  const [day, month, year] = value.split('-').map(Number);
                  const date = new Date(year, month - 1, day);
                  field.onChange(date);
                }
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key !== 'Backspace' && e.key !== 'Delete') {
                  if (e.currentTarget.value.length === 2 || e.currentTarget.value.length === 5) {
                    setDateInput(e.currentTarget.value + '-');
                  }
                }
              }}
              maxLength={10}
              onKeyPress={(e: React.KeyboardEvent) => {
                if (!/[\d-]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </FormControl>
          {dateInput.length === 10 && !validateDate(dateInput) && (
            <p className="text-sm text-red-500">
              Please enter a valid date. You must be at least 16 years old.
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
