import type { Table } from "@/features/tables/types/table";
import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Order } from "../types/order";

export const useTable = (tableId: string | undefined) => {
  return useQuery({
    queryKey: ["table", tableId],
    queryFn: async (): Promise<Table> => {
      const response = await api.get(`/tables/${tableId}`);
      return response.data;
    },
    enabled: !!tableId,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<string[]> => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await api.get("/foods/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (
        response.data.categories &&
        Array.isArray(response.data.categories)
      ) {
        return response.data.categories;
      } else {
        console.warn(
          "Unexpected categories response structure:",
          response.data
        );
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useOrderDetail = (orderId?: string) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async (): Promise<Order> => {
      const token = localStorage.getItem("token");
      const response = await api.get(`/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!orderId,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: {
      table_id: string;
      items: Array<{ food_id: number; qty: number }>;
    }) => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await api.post("/orders", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useAddOrderItem = (orderId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ food_id, qty }: { food_id: number; qty: number }) => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const res = await api.post(
        `/orders/${orderId}/items`,
        { food_id, qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },
  });
};

export const useCloseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: number) => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await api.put(
        `/orders/${orderId}/close`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useDownloadReceipt = () => {
  return useMutation({
    mutationFn: async (orderId: number) => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await api.get(`/orders/${orderId}/receipt`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `receipt-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
    },
  });
};
