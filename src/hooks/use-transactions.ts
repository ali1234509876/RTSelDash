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
      let query = supabase
        .from("transactions")
        .select("*")
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (scope === "self") query = query.eq("sales_rep_id", user.id);

      const { data: rows, error } = await query;
      if (!active) return;
      if (error) {
        console.error("Failed to load transactions:", error);
        setData([]);
        setLoading(false);
        return;
      }

      let merged: Tx[] = (rows ?? []) as Tx[];

      if (scope === "all" && merged.length > 0) {
        const repIds = Array.from(
          new Set(merged.map((r) => r.sales_rep_id).filter((id): id is string => !!id)),
        );
        const { data: profs } = repIds.length
          ? await supabase.from("profiles").select("id, full_name").in("id", repIds)
          : { data: [] as { id: string; full_name: string | null }[] };
        const profMap = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
        merged = merged.map((r) => ({
          ...r,
          profiles: { full_name: r.sales_rep_id ? (profMap.get(r.sales_rep_id) ?? null) : null },
        }));
      }

      setData(merged);
      setLoading(false);
    };

    fetchData();

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
