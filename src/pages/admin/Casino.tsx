import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CasinoGame {
  id: string;
  title: string;
  is_active: boolean;
  path: string;
  image_url: string;
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

  const updateGameMutation = useMutation({
    mutationFn: async ({ gameId, updates }: { gameId: string; updates: Partial<CasinoGame> }) => {
      const { error } = await supabase
        .from("casino_games")
        .update(updates)
        .eq("id", gameId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["casino-games"] });
      toast.success("Game updated successfully");
    },
    onError: () => {
      toast.error("Failed to update game");
    },
  });

  const handleImageUrlUpdate = (gameId: string, imageUrl: string) => {
    updateGameMutation.mutate({ 
      gameId, 
      updates: { image_url: imageUrl }
    });
  };

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
              <TableHead>Image URL</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games?.map((game) => (
              <TableRow key={game.id}>
                <TableCell className="font-medium">{game.title}</TableCell>
                <TableCell>{game.is_active ? "Active" : "Inactive"}</TableCell>
                <TableCell>{game.path}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Input
                      defaultValue={game.image_url}
                      placeholder="Enter image URL"
                      className="w-[300px]"
                      onBlur={(e) => {
                        if (e.target.value !== game.image_url) {
                          handleImageUrlUpdate(game.id, e.target.value);
                        }
                      }}
                    />
                    {game.image_url && (
                      <img 
                        src={game.image_url} 
                        alt={game.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Switch
                    checked={game.is_active}
                    onCheckedChange={(checked) => {
                      updateGameMutation.mutate({ 
                        gameId: game.id, 
                        updates: { is_active: checked } 
                      });
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
