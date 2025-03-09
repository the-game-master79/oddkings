import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CasinoGame {
  id: string;
  title: string;
  is_active: boolean;
  path: string;
}

export default function AdminCasino() {
  const queryClient = useQueryClient();

  const { data: games, isLoading } = useQuery({
    queryKey: ["casino-games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("casino_games")
        .select("*")
        .order("title");

      if (error) throw error;
      return data as CasinoGame[];
    },
  });

  const toggleGameMutation = useMutation({
    mutationFn: async ({ gameId, isActive }: { gameId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("casino_games")
        .update({ is_active: isActive })
        .eq("id", gameId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["casino-games"] });
      toast.success("Game status updated successfully");
    },
    onError: () => {
      toast.error("Failed to update game status");
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Casino Games</h1>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Game Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Path</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games?.map((game) => (
              <TableRow key={game.id}>
                <TableCell className="font-medium">{game.title}</TableCell>
                <TableCell>{game.is_active ? "Active" : "Inactive"}</TableCell>
                <TableCell>{game.path}</TableCell>
                <TableCell className="text-right">
                  <Switch
                    checked={game.is_active}
                    onCheckedChange={(checked) => {
                      toggleGameMutation.mutate({ gameId: game.id, isActive: checked });
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
