import { a as useQuery, q as queryKeys } from "./supabase-data-BRA3oWFj.js";
import { e as useQueryClient, s as supabase } from "./router-C21oMGn1.js";
function useDepartments() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.departments,
    queryFn: async () => {
      const { data: rows, error } = await supabase.from("departments").select("id, name, name_ar, head_id, code, is_active").order("name");
      if (error) throw error;
      return rows ?? [];
    }
  });
  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    reload: () => qc.invalidateQueries({ queryKey: queryKeys.departments })
  };
}
function departmentLabel(d, lang) {
  if (lang === "ar") return d.name_ar ?? d.name;
  return d.name;
}
export {
  departmentLabel as d,
  useDepartments as u
};
