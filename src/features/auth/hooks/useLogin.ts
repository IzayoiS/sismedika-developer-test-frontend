import { useForm } from "react-hook-form";
import { LoginSchema, type LoginSchemaDTO } from "@/utils/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toaster } from "@/components/ui/toaster";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import Cookies from "js-cookie";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/store/user";

interface LoginResponse {
  message: string;
  user: {
    fullname: string;
    email: string;
    role: string;
  };
  token: string;
}

export function useLoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginSchemaDTO>({
    mode: "onChange",
    resolver: zodResolver(LoginSchema),
  });

  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const { isPending, mutateAsync: mutateLogin } = useMutation<
    LoginResponse,
    Error,
    LoginSchemaDTO
  >({
    mutationKey: ["login"],
    mutationFn: async (data: LoginSchemaDTO) => {
      const response = await api.post<LoginResponse>("/login", data);
      setUser(response.data.user);
      Cookies.set("token", response.data.token, {
        expires: 1,
      });

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

      navigate({ pathname: "/tables" });
    },
  });

  async function onSubmit(data: LoginSchemaDTO) {
    await mutateLogin(data);
    reset();
  }

  return {
    register,
    handleSubmit,
    errors,
    isPending,
    onSubmit,
  };
}
