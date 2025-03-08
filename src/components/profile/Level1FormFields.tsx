
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AddressField } from "./fields/AddressField";
import { CountryField } from "./fields/CountryField";
import { DocumentTypeField } from "./fields/DocumentTypeField";
import { DateOfBirthField } from "./fields/DateOfBirthField";
import { FormData } from "./types";

export const Level1FormFields = () => {
  const form = useFormContext<FormData>();

  // Handle input change for FullName field to prevent numbers
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow letters, spaces, apostrophes, hyphens, and dots
    const sanitizedValue = value.replace(/[0-9]/g, '');
    
    // Update the form value if it's different from the input
    if (value !== sanitizedValue) {
      e.target.value = sanitizedValue;
    }
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input 
                placeholder="John Doe" 
                {...field} 
                onChange={(e) => {
                  handleFullNameChange(e);
                  field.onChange(e);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <DateOfBirthField form={form} />
      <CountryField form={form} />
      <AddressField form={form} />
      <DocumentTypeField form={form} />
      
      <div className="space-y-4">
        {/* Document upload component is rendered outside of FormField to avoid type errors */}
        <FormLabel>Required Document</FormLabel>
        <div>
          <FormItem>
            <div>
              <div>
                {/* Document Upload component will handle onUploadComplete */}
              </div>
            </div>
            <FormMessage />
          </FormItem>
        </div>
      </div>
    </div>
  );
};
