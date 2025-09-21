// pages/OrdersPage.tsx
import Navbar from "@/components/layouts/navBar";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { Restaurant, Visibility } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Table as MuiTable,
  Paper,
  Snackbar,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export default function OrderPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const navigate = useNavigate();

  const {
    data: orders = [],
    isLoading,
    error,
    refetch,
  } = useOrders({
    refetchInterval: 5000,
  });

  const hideSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return { backgroundColor: "#dbeafe", color: "#1e40af" };
      case "closed":
        return { backgroundColor: "#dcfce7", color: "#166534" };
      default:
        return { backgroundColor: "#f3f4f6", color: "#374151" };
    }
  };

  const getStatusCounts = () => {
    const counts = {
      total: orders.length,
      open: orders.filter((o) => o.status.toLowerCase() === "open").length,
      closed: orders.filter((o) => o.status.toLowerCase() === "closed").length,
    };
    return counts;
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toString().includes(searchTerm) ||
      order.table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusCounts = getStatusCounts();

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

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography color="error">Error loading orders</Typography>
        <Button onClick={() => refetch()} variant="contained">
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "white" }}>
      <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Main Content */}
      <Box sx={{ display: "flex" }}>
        {/* Order Management Area */}
        <Box sx={{ flex: 1, p: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", color: "text.primary" }}
            >
              Order Management
            </Typography>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Restaurant />}
                onClick={() => navigate("/foods")}
                sx={{
                  borderColor: "#1f2937",
                  color: "#1f2937",
                  "&:hover": {
                    backgroundColor: "#f9fafb",
                    borderColor: "#374151",
                  },
                }}
              >
                Manage Foods
              </Button>
            </Box>
          </Box>

          {/* Orders Table */}
          <Paper elevation={0} sx={{ border: 1, borderColor: "divider" }}>
            <TableContainer>
              <MuiTable>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "text.primary" }}
                    >
                      Order ID
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "text.primary" }}
                    >
                      Table
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "text.primary" }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "text.primary" }}
                    >
                      Total Price
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "text.primary" }}
                    >
                      Date
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "text.primary",
                        textAlign: "center",
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        sx={{ textAlign: "center", py: 4 }}
                      >
                        <Typography variant="body1" color="text.secondary">
                          {searchTerm
                            ? "No orders found matching your search."
                            : "No orders found."}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "medium", color: "#2563eb" }}
                          >
                            #{order.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "medium" }}
                          >
                            {order.table.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)
                            }
                            size="small"
                            sx={{
                              ...getStatusColor(order.status),
                              fontWeight: "medium",
                              fontSize: "0.75rem",
                              textTransform: "capitalize",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "medium", color: "#059669" }}
                          >
                            {formatPrice(order.total_price)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {order.created_at
                              ? new Date(order.created_at).toLocaleDateString(
                                  "id-ID"
                                )
                              : "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 0.5,
                              justifyContent: "center",
                            }}
                          >
                            <IconButton
                              size="small"
                              component={Link}
                              to={`/orders/${order.id}`}
                              sx={{
                                color: "#2563eb",
                                "&:hover": {
                                  backgroundColor: "#eff6ff",
                                  color: "#1d4ed8",
                                },
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </MuiTable>
            </TableContainer>
          </Paper>
        </Box>

        {/* Quick Stats Sidebar */}
        <Box
          sx={{
            width: 280,
            borderColor: "divider",
            p: 3,
            backgroundColor: "white",
            mt: 1,
          }}
        >
          <Typography variant="h6" sx={{ color: "text.primary", mb: 3 }}>
            Order Statistics
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Total Orders */}
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: "bold",
                  color: "text.primary",
                  fontSize: "2.5rem",
                  lineHeight: 1,
                }}
              >
                {statusCounts.total}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Total Orders
              </Typography>
            </Box>

            {/* Open Orders */}
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: "bold",
                  color: "#1e40af",
                  fontSize: "2.5rem",
                  lineHeight: 1,
                }}
              >
                {statusCounts.open}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Open Orders
              </Typography>
            </Box>

            {/* Closed Orders */}
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: "bold",
                  color: "#166534",
                  fontSize: "2.5rem",
                  lineHeight: 1,
                }}
              >
                {statusCounts.closed}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Closed Orders
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={hideSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
