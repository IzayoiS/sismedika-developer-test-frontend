import {
  RegisterSchema,
  type RegisterSchemaDTO,
} from "@/utils/schemas/auth.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import api from "@/lib/api";
import { toaster } from "@/components/ui/toaster";

interface RegisterResponse {
  message: string;
  user: {
    fullname: string;
    email: string;
  };
}

export function useRegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterSchemaDTO>({
    mode: "onChange",
    resolver: zodResolver(RegisterSchema),
  });

  const navigate = useNavigate();

  const { isPending, mutateAsync } = useMutation<
    RegisterResponse,
    Error,
    RegisterSchemaDTO
  >({
    mutationKey: ["register"],
    mutationFn: async (data: RegisterSchemaDTO) => {
      const response = await api.post<RegisterResponse>("/register", data);
      return response.data;
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        return toaster.create({
          title: error.response?.data.message,
          type: "error",
        });
      }

      toaster.create({
        title: "Something went wrong!",
        type: "error",
      });
    },
    onSuccess: async (data) => {
      toaster.create({
        title: data.message,
        type: "success",
      });
      navigate({ pathname: "/login" });
    },
  });

  async function onSubmit(data: RegisterSchemaDTO) {
    await mutateAsync(data);
    reset();
  }

  return {
    onSubmit,
    isPending,
    handleSubmit,
    register,
    errors,
  };
}
