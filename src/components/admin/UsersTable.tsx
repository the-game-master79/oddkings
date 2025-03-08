import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { EditBalance } from "./EditBalance";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown } from "lucide-react";

type SortField = 'joined_at' | 'balance';
type SortOrder = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export const UsersTable = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortConfig>({
    field: 'joined_at',
    order: 'desc'
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_statistics")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  const getStatus = (user: any) => {
    return { label: "Active", variant: "default" as const };
  };

  const handleSort = (field: SortField) => {
    setSort(current => ({
      field,
      order: current.field === field && current.order === 'desc' ? 'asc' : 'desc'
    }));
  };

  const filteredUsers = users?.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedUsers = filteredUsers?.sort((a, b) => {
    const modifier = sort.order === 'asc' ? 1 : -1;
    
    if (sort.field === 'joined_at') {
      return modifier * (new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime());
    }
    
    if (sort.field === 'balance') {
      const balanceA = a.balance || 0;
      const balanceB = b.balance || 0;
      return modifier * (balanceA - balanceB);
    }
    
    return 0;
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-sm"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('joined_at')}
                  className="flex items-center gap-1 hover:bg-transparent"
                >
                  Date & Time Joined
                  <ArrowUpDown className={`h-4 w-4 ${sort.field === 'joined_at' ? 'text-primary' : ''}`} />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('balance')}
                  className="flex items-center gap-1 hover:bg-transparent ml-auto"
                >
                  User Balance
                  <ArrowUpDown className={`h-4 w-4 ${sort.field === 'balance' ? 'text-primary' : ''}`} />
                </Button>
              </TableHead>
              <TableHead className="text-right">Questions Participated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers?.map((user) => {
              const status = getStatus(user);
              return (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{format(new Date(user.joined_at), "PPpp")}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">${user.balance?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell className="text-right">{user.questions_participated || 0}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      Edit Balance
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <EditBalance
        open={!!selectedUserId}
        onOpenChange={() => setSelectedUserId(null)}
        userId={selectedUserId}
      />
    </>
  );
};
