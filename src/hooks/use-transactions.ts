import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import type { TransactionRow } from "@/lib/supabase-data";

export type Tx = TransactionRow;

interface Options {
  scope: "self" | "all";
}

export function useTransactions({ scope }: Options) {
  const { user, primaryRole } = useAuth();
  const [data, setData] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      let query = supabase
        .from("transactions")
        .select("id, file_number, amount, status, sales_rep_id, recorded_by, transaction_date, notes, created_at, updated_at, profiles:sales_rep_id(full_name)")
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (scope === "self") query = query.eq("sales_rep_id", user.id);

      const { data: rows } = await query;
      setData((rows ?? []) as unknown as Tx[]);
      setLoading(false);
    };
    load();
  }, [user, scope, primaryRole]);

  return { data, loading };
}
