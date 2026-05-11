import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/query-keys";

export interface Department {
  id: string;
  name: string;
  name_ar: string | null;
  head_id: string | null;
  code: string | null;
  is_active: boolean;
}

export function useDepartments() {
  const qc = useQueryClient();
  const query = useQuery<Department[]>({
    queryKey: queryKeys.departments,
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("departments")
        .select("id, name, name_ar, head_id, code, is_active")
        .order("name");
      if (error) throw error;
      return (rows ?? []) as unknown as Department[];
    },
  });

  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error as Error | null,
    reload: () => qc.invalidateQueries({ queryKey: queryKeys.departments }),
  };
}

export function departmentLabel(d: Department, lang: "ar" | "en"): string {
  if (lang === "ar") return d.name_ar ?? d.name;
  return d.name;
}
