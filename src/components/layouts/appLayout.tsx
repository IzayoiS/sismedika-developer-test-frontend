import { Outlet, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import api from "@/lib/api";
import { useAuthStore } from "@/store/user";
import { Box, CircularProgress } from "@mui/material";

export default function AppLayout() {
  const { user, setUser, logout } = useAuthStore();

  const { isFetched, isLoading } = useQuery({
    queryKey: ["check-auth"],
    queryFn: async () => {
      try {
        const token = Cookies.get("token");
        const response = await api.post(
          "/auth/check",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(response.data.data);
        return response.data;
      } catch (error) {
        console.error(error);
        Cookies.remove("token");
        logout();
      }
    },
  });

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "white",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isFetched && !user?.fullname) return <Navigate to="/login" />;

  return <Outlet />;
}
