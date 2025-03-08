
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateQuestion } from "@/types/questions";
import * as XLSX from "xlsx";
import { toast } from "sonner";

interface BulkQuestionData {
  question: string;
  category: string;
  dateString: string;
  time: string;
  yesValue: string;
  noValue: string;
}

interface BulkUploadProps {
  onUpload: (questions: BulkQuestionData[]) => void;
}

export const BulkUploadQuestions = ({ onUpload }: BulkUploadProps) => {
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const questions: BulkQuestionData[] = [];
        const validationErrors: string[] = [];

        jsonData.forEach((row, index) => {
          // Ensure all required fields are present and convert to string
          const questionData = {
            question: String(row.question || ""),
            category: String(row.category || ""),
            dateString: String(row.date || ""),
            time: String(row.time || ""),
            yesValue: String(row.yes_value || "0"),
            noValue: String(row.no_value || "0")
          };

          const errors = validateQuestion(questionData);
          
          if (Object.keys(errors).length > 0) {
            validationErrors.push(`Row ${index + 1}: ${Object.values(errors).join(', ')}`);
          } else {
            questions.push(questionData);
          }
        });

        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          toast.error("Some questions failed validation");
        } else if (questions.length === 0) {
          toast.error("No valid questions found in the file");
        } else {
          setErrors([]);
          onUpload(questions);
          toast.success("Questions validated successfully");
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        toast.error("Error parsing file. Please check the format.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          className="flex-1"
        />
        <Button
          variant="outline"
          onClick={() => {
            const template = [
              {
                question: "Example question?",
                category: "Politics",
                date: "25-04",
                time: "14:30",
                yes_value: "60",
                no_value: "40"
              }
            ];
            const ws = XLSX.utils.json_to_sheet(template);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Questions");
            XLSX.writeFile(wb, "question_template.xlsx");
          }}
        >
          Download Template
        </Button>
      </div>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            <ul className="list-disc pl-4">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
