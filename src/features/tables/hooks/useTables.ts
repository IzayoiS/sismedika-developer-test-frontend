import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Table } from "../types/table";

export const useTables = (options?: {
  refetchInterval?: number;
  enabled?: boolean;
}) => {
  const { refetchInterval = 5000 } = options || {};

  return useQuery({
    queryKey: ["tables"],
    queryFn: async (): Promise<Table[]> => {
      const response = await api.get("/tables");
      return response.data;
    },
    refetchInterval,
  });
};

export function useUpdateTableStatus() {
  const queryClient = useQueryClient();

  const reserveTable = useMutation({
    mutationFn: async (tableId: number) => {
      const res = await api.post(`/tables/${tableId}/reserve`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });

  const occupyTable = useMutation({
    mutationFn: async (tableId: number) => {
      const res = await api.post(`/orders`, { table_id: tableId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return { reserveTable, occupyTable };
}
