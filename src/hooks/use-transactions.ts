import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth-context";

export type Tx = Database["public"]["Tables"]["transactions"]["Row"] & {
  profiles?: { full_name: string | null } | null;
};

interface Options {
  scope: "self" | "all";
}

export function useTransactions({ scope }: Options) {
  const { user, primaryRole } = useAuth();
  const [data, setData] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let active = true;

    const fetchData = async () => {
      const includeProfiles = scope === "all";
      let query = supabase
        .from("transactions")
        .select(includeProfiles ? "*, profiles:sales_rep_id(full_name)" : "*")
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (scope === "self") query = query.eq("sales_rep_id", user.id);

      const { data: rows, error } = await query;
      if (!active) return;
      if (error) {
        console.error("Failed to load transactions:", error);
        setData([]);
      } else {
        setData((rows ?? []) as Tx[]);
      }
      setLoading(false);
    };

    fetchData();

    // Realtime subscription
    const channel = supabase
      .channel(`transactions:${scope}:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => {
          fetchData();
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user, scope, primaryRole]);

  return { data, loading };
}
