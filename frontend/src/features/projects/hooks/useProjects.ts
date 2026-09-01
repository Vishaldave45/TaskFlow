import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "@/api/projects";
import { queryKeys } from "@/lib/queryKeys";

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: projectsApi.list,
  });
}