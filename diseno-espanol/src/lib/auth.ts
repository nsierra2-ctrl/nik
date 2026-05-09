import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useGetAdminMe,
  getGetAdminMeQueryKey,
  useAdminLogin,
  useAdminLogout,
} from "@workspace/api-client-react";

export function useAdminSession() {
  return useGetAdminMe({
    query: {
      retry: false,
      staleTime: 30_000,
    },
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useAdminLogin({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetAdminMeQueryKey() });
      },
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useAdminLogout({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetAdminMeQueryKey() });
      },
    },
  });
}

export { useQuery, useMutation };
