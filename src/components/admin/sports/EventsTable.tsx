import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SportEvent } from "@/types/sports";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";

interface EventsTableProps {
  events: SportEvent[];
  isLoading: boolean;
  onEdit: (event: SportEvent) => void;
  onDelete: (eventId: string) => void;
}

export function EventsTable({ events, isLoading, onEdit, onDelete }: EventsTableProps) {
  const [eventIdToDelete, setEventIdToDelete] = useState<string | null>(null);

  const handleDelete = async (eventId: string) => {
    try {
      await onDelete(eventId);
      setEventIdToDelete(null);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-4 text-left">Title</th>
            <th className="p-4 text-left">Sport</th>
            <th className="p-4 text-left">Country</th>
            <th className="p-4 text-left">Created</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={5} className="p-4 text-center">
                Loading events...
              </td>
            </tr>
          ) : events.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center">
                No events found. Try adjusting your search.
              </td>
            </tr>
          ) : (
            events.map((event) => (
              <tr key={event.id} className="border-b">
                <td className="p-4">{event.title}</td>
                <td className="p-4">{event.sport}</td>
                <td className="p-4">{event.country}</td>
                <td className="p-4">{format(new Date(event.created_at), "PPp")}</td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(event)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <AlertDialog 
                      open={eventIdToDelete === event.id}
                      onOpenChange={(open) => {
                        if (!open) setEventIdToDelete(null);
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setEventIdToDelete(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Event</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will delete the event and all its associated matches and questions. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <Button variant="outline" onClick={() => setEventIdToDelete(null)}>
                            Cancel
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={() => event.id && handleDelete(event.id)}
                          >
                            Delete
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
