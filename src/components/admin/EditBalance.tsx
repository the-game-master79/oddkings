
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface EditBalanceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

export const EditBalance = ({ open, onOpenChange, userId }: EditBalanceProps) => {
  const [amount, setAmount] = useState("");
  const queryClient = useQueryClient();

  const handleUpdateBalance = async () => {
    if (!userId || !amount || isNaN(Number(amount))) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const { error } = await supabase
        .from('user_balances')
        .upsert({
          user_id: userId,
          total_usd_value: Number(amount)
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (error) throw error;

      toast.success("Balance updated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onOpenChange(false);
      setAmount("");
    } catch (error) {
      toast.error("Failed to update balance");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Balance</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              placeholder="Enter new balance amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleUpdateBalance}
          >
            Modify Balance
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
