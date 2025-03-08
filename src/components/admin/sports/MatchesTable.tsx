import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SportMatch } from "@/types/sports";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";

// Add a safe date formatter helper
const safeFormatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    return format(date, "MMM dd, yyyy HH:mm");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

interface MatchesTableProps {
  matches: SportMatch[];
  isLoading: boolean;
  onEdit: (match: SportMatch) => void;
  onDelete: (matchId: string) => void;
}

export function MatchesTable({ matches, isLoading, onEdit, onDelete }: MatchesTableProps) {
  const [matchToDelete, setMatchToDelete] = useState<{
    id: string;
    isOpen: boolean;
  }>({
    id: '',
    isOpen: false
  });

  const handleDelete = async (matchId: string) => {
    try {
      await onDelete(matchId);
      setMatchToDelete({ id: '', isOpen: false });
    } catch (error) {
      console.error('Error deleting match:', error);
    }
  };

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-4 text-left">Title</th>
            <th className="p-4 text-left">Event</th>
            <th className="p-4 text-left">Trade Start</th>
            <th className="p-4 text-left">Trade End</th>
            <th className="p-4 text-left">Live Start</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={6} className="p-4 text-center">Loading matches...</td>
            </tr>
          ) : matches.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-4 text-center">No matches found. Try adjusting your search.</td>
            </tr>
          ) : (
            matches.map((match) => {
              const eventTitle = match.sport_events ? match.sport_events.title : match.event_id;
              
              return (
                <tr key={match.id} className="border-b">
                  <td className="p-4">{match.title}</td>
                  <td className="p-4">{eventTitle}</td>
                  <td className="p-4">{safeFormatDate(match.trade_start_time)}</td>
                  <td className="p-4">{safeFormatDate(match.trade_end_time)}</td>
                  <td className="p-4">{safeFormatDate(match.live_start_time)}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(match)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <AlertDialog 
                        open={matchToDelete.isOpen && matchToDelete.id === match.id}
                        onOpenChange={(open) => {
                          setMatchToDelete(prev => ({
                            ...prev,
                            isOpen: open
                          }));
                        }}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setMatchToDelete({
                              id: match.id,
                              isOpen: true
                            })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Match</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete the match and all its associated questions. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => setMatchToDelete({ id: '', isOpen: false })}
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="destructive" 
                              onClick={() => handleDelete(match.id)}
                            >
                              Delete
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
