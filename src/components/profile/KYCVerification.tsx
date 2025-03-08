import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Level1Form } from "./Level1Form";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VerificationStatus } from "./verification/VerificationStatus";
import { VerificationBenefits } from "./verification/VerificationBenefits";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// This component will be hidden for now
export const KYCVerification = () => {
  return null; // Return null to hide the component
};
