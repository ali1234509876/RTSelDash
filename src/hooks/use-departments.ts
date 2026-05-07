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
  const [error, setError] = useState<Error | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: rows, error: err } = await supabase.from("departments").select("id, name, name_ar").order("name");
    setError(err);
    setData(rows ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return { data, loading, error, reload: load };
}

export function departmentLabel(d: Department, lang: "ar" | "en"): string {
  if (lang === "ar") return d.name_ar ?? d.name;
  return d.name;
}
