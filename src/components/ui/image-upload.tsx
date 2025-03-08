
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Image, X } from 'lucide-react';

interface ImageUploadProps {
  id: string;
  value: string;
  onChange: (file: File | null) => void;
  onRemove: () => void;
}

export function ImageUpload({ id, value, onChange, onRemove }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onChange(file);
      }
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };
  
  return (
    <div className="space-y-2">
      <div
        className={`border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center min-h-[150px] ${
          isDragging ? 'border-primary bg-primary/5' : 'border-input'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {value ? (
          <div className="relative w-full">
            <img 
              src={value} 
              alt="Preview" 
              className="max-h-[200px] mx-auto object-contain"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-0 right-0"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <Image className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop an image or click to browse
            </p>
            <Input
              id={id}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById(id)?.click()}
            >
              Browse Files
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
