import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getProfile, getProfilesWithRoles, type ProfileWithRoles } from "@/lib/supabase-data";

export function useProfilesWithRoles(enabled: boolean = true) {
  const qc = useQueryClient();
  const query = useQuery<ProfileWithRoles[]>({
    queryKey: queryKeys.profiles,
    enabled,
    queryFn: () => getProfilesWithRoles(),
  });
  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error as Error | null,
    reload: () => qc.invalidateQueries({ queryKey: queryKeys.profiles }),
  };
}

export function useProfile(id: string | null | undefined, period?: string) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: id ? [...queryKeys.profile(id), period ?? "__current__"] : ["profile", "__none__"],
    enabled: !!id,
    queryFn: () => (id ? getProfile(id, period) : Promise.resolve(null)),
  });
  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error as Error | null,
    reload: () => id && qc.invalidateQueries({ queryKey: queryKeys.profile(id) }),
  };
}
