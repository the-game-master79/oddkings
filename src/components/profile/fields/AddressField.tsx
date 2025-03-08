
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../types";
import { validateAddress } from "../utils/validation";

interface AddressFieldProps {
  form: UseFormReturn<FormData>;
}

export const AddressField = ({ form }: AddressFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="residentialAddress"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Residential Address</FormLabel>
          <FormControl>
            <Input 
              placeholder="Enter your residential address" 
              {...field}
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(value);
                validateAddress(value);
              }}
              className={!validateAddress(field.value) && field.value ? "border-red-500" : ""}
            />
          </FormControl>
          {field.value && !validateAddress(field.value) && (
            <p className="text-sm text-red-500">
              Only letters, numbers, spaces, commas, & and / are allowed
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
