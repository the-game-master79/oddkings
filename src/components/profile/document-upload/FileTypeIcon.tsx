
import { FileText, Image, File } from "lucide-react";

interface FileTypeIconProps {
  fileType: string;
}

export const FileTypeIcon = ({ fileType }: FileTypeIconProps) => {
  if (fileType.includes('pdf')) {
    return <FileText className="h-12 w-12 text-red-500" />;
  } else if (fileType.includes('image')) {
    return <Image className="h-12 w-12 text-blue-500" />;
  } else {
    return <File className="h-12 w-12 text-gray-500" />;
  }
};
