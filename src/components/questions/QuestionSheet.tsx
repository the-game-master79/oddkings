import { useState, useEffect } from "react";
import { z } from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Question, QuestionCategory, validateQuestion, QuestionFormValues } from "@/types/questions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNewsCategories } from "@/hooks/useNewsCategories";

interface QuestionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  editingQuestion?: Question;
}

// Define the form schema
const formSchema = z.object({
  question: z.string().min(1, "Question is required"),
  category: z.string().min(1, "Category is required"),
  dateString: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  yesValue: z.string().min(1, "Yes value is required"),
  noValue: z.string().min(1, "No value is required"),
});

export const QuestionSheet = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editingQuestion,
}: QuestionSheetProps) => {
  const [yesNoTotal, setYesNoTotal] = useState<number | null>(null);

  // Explicitly typed default values
  const defaultValues: QuestionFormValues = {
    question: "",
    category: "",
    dateString: "",
    time: "",
    yesValue: "",
    noValue: "",
  };

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { data: categories = [], isLoading: isCategoriesLoading } = useNewsCategories();

  // Reset form when the sheet opens/closes or editing question changes
  useEffect(() => {
    if (editingQuestion) {
      const endDate = new Date(editingQuestion.end_datetime);
      // Set form values individually
      form.setValue("question", editingQuestion.question);
      form.setValue("category", editingQuestion.category);
      form.setValue("dateString", format(endDate, "dd-MM"));
      form.setValue("time", format(endDate, "HH:mm"));
      form.setValue("yesValue", editingQuestion.yes_value.toString());
      form.setValue("noValue", editingQuestion.no_value.toString());
    } else {
      // Reset to empty values
      form.setValue("question", "");
      form.setValue("category", "");
      form.setValue("dateString", "");
      form.setValue("time", "");
      form.setValue("yesValue", "");
      form.setValue("noValue", "");
    }
  }, [editingQuestion, form, isOpen]);

  // Calculate yes/no total when values change
  useEffect(() => {
    const yesValue = parseInt(form.watch("yesValue") || "0");
    const noValue = parseInt(form.watch("noValue") || "0");
    
    if (!isNaN(yesValue) && !isNaN(noValue)) {
      setYesNoTotal(yesValue + noValue);
    } else {
      setYesNoTotal(null);
    }
  }, [form.watch("yesValue"), form.watch("noValue")]);

  const handleSubmit = (data: QuestionFormValues) => {
    // Validate the question data
    const errors = validateQuestion(data);
    
    if (Object.keys(errors).length > 0) {
      // Display the first error message
      toast.error(Object.values(errors)[0]);
      return;
    }
    
    onSubmit(data);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {editingQuestion ? "Edit Question" : "Create New Question"}
          </SheetTitle>
          <SheetDescription>
            {editingQuestion 
              ? "Update the question details" 
              : "Fill in the details to create a new prediction question"}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Question Field */}
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Will Bitcoin reach $100,000 by the end of 2025?" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Category Dropdown */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                      disabled={isCategoriesLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isCategoriesLoading ? "Loading categories..." : "Select a category"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.isArray(categories) && categories.map((category) => (
                          <SelectItem 
                            key={category.value} 
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Date and Time Fields */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateString"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date (DD-MM)</FormLabel>
                      <FormControl>
                        <Input placeholder="31-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time (HH:MM)</FormLabel>
                      <FormControl>
                        <Input placeholder="23:59" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Yes/No Value Fields */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="yesValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yes %</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="noValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No %</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Show total validation */}
              {yesNoTotal !== null && (
                <div className={`text-sm ${yesNoTotal === 100 ? 'text-green-500' : 'text-red-500'}`}>
                  Total: {yesNoTotal}% {yesNoTotal === 100 ? '✓' : `(must be exactly 100%)`}
                </div>
              )}
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || (yesNoTotal !== null && yesNoTotal !== 100)}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingQuestion ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    editingQuestion ? "Update Question" : "Create Question"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};
