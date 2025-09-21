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
      const token = localStorage.getItem("token");
      const response = await api.get("/tables", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    refetchInterval,
  });
};

export const useCreateTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tableData: Omit<Table, "id">) => {
      const token = localStorage.getItem("token");
      const response = await api.post("/tables", tableData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
};

export const useUpdateTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...tableData
    }: Partial<Table> & { id: number }) => {
      const token = localStorage.getItem("token");
      const response = await api.put(`/tables/${id}`, tableData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
};

export const useDeleteTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("token");
      const response = await api.delete(`/tables/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
};
