import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Food } from "../types/food";

export const useFoods = (options?: {
  refetchInterval?: number;
  enabled?: boolean;
}) => {
  const { refetchInterval = 5000 } = options || {};

  return useQuery({
    queryKey: ["foods"],
    queryFn: async (): Promise<Food[]> => {
      const response = await api.get("/foods");
      return Array.isArray(response.data.data) ? response.data.data : [];
    },
    refetchInterval,
  });
};

export const useCreateFood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (foodData: Omit<Food, "id">) => {
      const token = localStorage.getItem("token");
      const response = await api.post("/foods", foodData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
    },
  });
};

export const useUpdateFood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...foodData }: Partial<Food> & { id: number }) => {
      const token = localStorage.getItem("token");
      const response = await api.put(`/foods/${id}`, foodData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
    },
  });
};

export const useToggleFoodStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      is_active,
    }: {
      id: number;
      is_active: boolean;
    }) => {
      const token = localStorage.getItem("token");
      const response = await api.put(
        `/foods/${id}/status`,
        { is_active },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["foods"] });

      const previousFoods = queryClient.getQueryData<Food[]>(["foods"]);

      queryClient.setQueryData<Food[]>(
        ["foods"],
        (old) =>
          old?.map((food) =>
            food.id === variables.id
              ? { ...food, is_active: variables.is_active }
              : food
          ) || []
      );

      return { previousFoods };
    },
    onError: (err, variables, context) => {
      if (context?.previousFoods) {
        queryClient.setQueryData(["foods"], context.previousFoods);
      }
    },
  });
};

export const useDeleteFood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("token");
      const response = await api.delete(`/foods/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
    },
  });
};
