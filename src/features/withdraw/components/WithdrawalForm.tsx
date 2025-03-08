import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { networkOptions, WithdrawalFormData } from "../types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ShieldAlert } from "lucide-react";

const withdrawalSchema = z.object({
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Amount must be a positive number"),
  token: z.enum(["USDT", "USDC"]),
  network: z.enum(["TRC20", "ERC20", "BEP20"]),
  walletAddress: z.string().min(1, "Wallet address is required"),
});

interface WithdrawalFormProps {
  balance: number;
  onSuccess: () => void;
}

export const WithdrawalForm = ({ balance, onSuccess }: WithdrawalFormProps) => {
  const form = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: "",
      walletAddress: "",
    },
  });

  const onSubmit = async (values: WithdrawalFormData) => {
    const amount = parseFloat(values.amount);
    if (amount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to make a withdrawal");
        return;
      }

      const { error } = await supabase
        .from("withdrawals")
        .insert({
          amount,
          token: values.token,
          network: values.network,
          wallet_address: values.walletAddress,
          user_id: session.user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Withdrawal request submitted successfully");
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
      toast.error("Failed to submit withdrawal request");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  className="w-full"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (value > balance) {
                      form.setError("amount", {
                        message: "Amount exceeds available balance",
                      });
                    } else {
                      form.clearErrors("amount");
                    }
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token/Coin</FormLabel>
              <Select
                onValueChange={(value: "USDT" | "USDC") => {
                  field.onChange(value);
                  form.setValue("network", undefined);
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="network"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Network</FormLabel>
              <Select
                onValueChange={field.onChange}
                disabled={!form.watch("token")}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {form.watch("token") &&
                    networkOptions[form.watch("token")].map((network) => (
                      <SelectItem key={network} value={network}>
                        {network}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="walletAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wallet Address</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter wallet address" className="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">Submit Withdrawal</Button>
      </form>
    </Form>
  );
};
