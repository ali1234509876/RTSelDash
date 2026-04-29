import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Department {
  id: string;
  name: string;
  name_ar: string | null;
}

export function useDepartments() {
  const [data, setData] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: rows } = await supabase
      .from("departments")
      .select("id, name, name_ar")
      .order("name");
    setData((rows ?? []) as Department[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("departments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "departments" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { data, loading, reload: load };
}

export function departmentLabel(d: Department, lang: "ar" | "en"): string {
  if (lang === "ar") return d.name_ar ?? d.name;
  return d.name;
}
