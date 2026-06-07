import { a as useQuery, q as queryKeys, j as getProfilesWithRoles, k as getProfile } from "./supabase-data-BRA3oWFj.js";
import { e as useQueryClient } from "./router-C21oMGn1.js";
function useProfilesWithRoles(enabled = true) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.profiles,
    enabled,
    queryFn: () => getProfilesWithRoles()
  });
  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    reload: () => qc.invalidateQueries({ queryKey: queryKeys.profiles })
  };
}
function useProfile(id, period) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: id ? [...queryKeys.profile(id), period ?? "__current__"] : ["profile", "__none__"],
    enabled: !!id,
    queryFn: () => id ? getProfile(id, period) : Promise.resolve(null)
  });
  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    reload: () => id && qc.invalidateQueries({ queryKey: queryKeys.profile(id) })
  };
}
export {
  useProfile as a,
  useProfilesWithRoles as u
};
