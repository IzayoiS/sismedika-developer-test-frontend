import { useFoods } from "@/features/foods/hooks/useFoods";
import type { Food } from "@/features/foods/types/food";
import { useAuthStore } from "@/store/user";
import {
  Add,
  ArrowBack,
  Delete,
  Login,
  Logout,
  Print,
  Remove,
  Search,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Cookies from "js-cookie";
import { useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  useAddOrderItem,
  useCategories,
  useCloseOrder,
  useDownloadReceipt,
  useOrderDetail,
  useTable,
} from "../hooks/useOrderDetail";
import type { OrderItem } from "../types/order";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const {
    data: table,
    isLoading: tableLoading,
    error: tableError,
  } = useTable(orderId);
  const {
    data: foods = [],
    isLoading: foodsLoading,
    error: foodsError,
  } = useFoods();
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();
  const { data: order } = useOrderDetail(orderId);

  const addOrderItemMutation = useAddOrderItem(orderId!);
  const closeOrderMutation = useCloseOrder();
  const downloadReceiptMutation = useDownloadReceipt();

  function onLogout() {
    logout();
    Cookies.remove("token");
    localStorage.removeItem("auth-storage");
    navigate("/login");
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "warning" | "info" = "success"
  ) => setSnackbar({ open: true, message, severity });
  const hideSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const addItemToOrder = async (food: Food) => {
    if (orderId && order?.id) {
      try {
        await addOrderItemMutation.mutateAsync({
          food_id: food.id,
          qty: 1,
        });
        showSnackbar(`${food.name} added to order`);
      } catch (err) {
        console.error("Error adding item:", err);
        showSnackbar("Failed to add item", "error");
      }
    } else {
      setOrderItems((items) => {
        const existing = items.find((i) => i.food_id === food.id);
        if (existing) {
          return items.map((i) =>
            i.food_id === food.id
              ? { ...i, qty: i.qty + 1, subtotal: (i.qty + 1) * i.price }
              : i
          );
        }
        return [
          ...items,
          {
            food_id: food.id,
            food: { name: food.name },
            price: food.price,
            qty: 1,
            subtotal: food.price,
          },
        ];
      });
    }
  };

  const updateItemQuantity = (foodId: number, change: number) => {
    setOrderItems(
      (items) =>
        items
          .map((item) => {
            if (item.food_id === foodId) {
              const newQty = Math.max(0, item.qty + change);
              return newQty === 0
                ? null
                : { ...item, qty: newQty, subtotal: newQty * item.price };
            }
            return item;
          })
          .filter(Boolean) as OrderItem[]
    );
  };

  const removeItem = (foodId: number) => {
    setOrderItems((items) => items.filter((i) => i.food_id !== foodId));
  };

  const handleCloseOrder = async () => {
    if (!order?.id) {
      showSnackbar("No active order to close", "warning");
      return;
    }
    try {
      await closeOrderMutation.mutateAsync(order.id);
      showSnackbar("Order closed successfully!");
    } catch (err) {
      console.error("Error closing order:", err);
      showSnackbar("Failed to close order", "error");
    }
  };

  const handleDownloadReceipt = async () => {
    if (!order?.id) {
      showSnackbar("No order to print receipt", "warning");
      return;
    }
    try {
      await downloadReceiptMutation.mutateAsync(order.id);
      showSnackbar("Receipt downloaded");
    } catch (err) {
      console.error("Error downloading receipt:", err);
      showSnackbar("Failed to download receipt", "error");
    }
  };

  const formatPrice = (price: number): string =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const filteredFoods = foods.filter((food) => {
    const matchesCategory =
      activeCategory === "All" ||
      food.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = food.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isLoading = tableLoading || foodsLoading || categoriesLoading;
  const error = tableError || foodsError || categoriesError;

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
        <Typography color="error">Error loading data</Typography>
        <Button onClick={() => window.location.reload()} variant="contained">
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={() => navigate("/orders")}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 0.5 }}>
                {table?.name || `Table ${orderId}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order ? `Order #${order.id}` : "New Order"}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {user ? (
              <>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                  >
                    {user.fullname?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Tooltip title="Account settings">
                    <IconButton
                      onClick={handleClick}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <Box sx={{ textAlign: "left", mx: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "medium" }}
                        >
                          {user.fullname}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          {user.role}
                        </Typography>
                      </Box>
                    </IconButton>
                  </Tooltip>
                </Box>
                <Menu
                  anchorEl={anchorEl}
                  id="account-menu"
                  open={open}
                  onClose={handleClose}
                >
                  <MenuItem
                    onClick={() => {
                      onLogout();
                      handleClose();
                    }}
                  >
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                size="small"
                startIcon={<Login fontSize="small" />}
              >
                Login
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: "flex", gap: 2, height: "calc(100vh - 100px)" }}>
        {/* Menu Section */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Categories */}
          <Paper sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", p: 1, gap: 1 }}>
              <Button
                key="All"
                variant={activeCategory === "All" ? "contained" : "outlined"}
                onClick={() => setActiveCategory("All")}
                sx={{
                  backgroundColor:
                    activeCategory === "All" ? "#2c3e50" : "transparent",
                  color: activeCategory === "All" ? "white" : "#2c3e50",
                  borderColor: "#2c3e50",
                  "&:hover": {
                    backgroundColor:
                      activeCategory === "All" ? "#34495e" : "#f8f9fa",
                  },
                }}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    activeCategory === category ? "contained" : "outlined"
                  }
                  onClick={() => setActiveCategory(category)}
                  sx={{
                    backgroundColor:
                      activeCategory === category ? "#2c3e50" : "transparent",
                    color: activeCategory === category ? "white" : "#2c3e50",
                    borderColor: "#2c3e50",
                    "&:hover": {
                      backgroundColor:
                        activeCategory === category ? "#34495e" : "#f8f9fa",
                    },
                  }}
                >
                  {category}
                </Button>
              ))}
            </Box>
          </Paper>

          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* Menu Items */}
          <Paper sx={{ flex: 1, p: 2, overflow: "auto" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {filteredFoods.length === 0 ? (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 4 }}
                >
                  No items found
                </Typography>
              ) : (
                filteredFoods.map((food) => (
                  <Card key={food.id} sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", mb: 0.5 }}
                        >
                          {food.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          {food.description}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          {formatPrice(food.price)}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={() => addItemToOrder(food)}
                        sx={{
                          backgroundColor: "#2c3e50",
                          color: "white",
                          "&:hover": { backgroundColor: "#34495e" },
                          width: 48,
                          height: 48,
                        }}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  </Card>
                ))
              )}
            </Box>
          </Paper>
        </Box>

        {/* Order Summary */}
        <Paper sx={{ width: 400, display: "flex", flexDirection: "column" }}>
          <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>
              Current Order
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {table?.name} • {new Date().toLocaleDateString()}
              {order && ` • Order #${order.id}`}
            </Typography>
          </Box>

          {/* Items */}
          <Box sx={{ flex: 1, p: 2, overflow: "auto" }}>
            {!order?.items || order.items.length === 0 ? (
              orderItems.length === 0 ? (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 4 }}
                >
                  No items added
                </Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {orderItems.map((item) => (
                    <Card key={item.food_id} variant="outlined">
                      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 2,
                          }}
                        >
                          <Typography variant="subtitle1">
                            {item.food.name}
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: "bold" }}
                          >
                            {formatPrice(item.subtotal)}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                updateItemQuantity(item.food_id, -1)
                              }
                            >
                              <Remove fontSize="small" />
                            </IconButton>
                            <Typography
                              sx={{ minWidth: 24, textAlign: "center" }}
                            >
                              {item.qty}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() =>
                                updateItemQuantity(item.food_id, 1)
                              }
                            >
                              <Add fontSize="small" />
                            </IconButton>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => removeItem(item.food_id)}
                            sx={{ color: "error.main" }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {order.items.map((item) => (
                  <Card key={item.food_id} variant="outlined">
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 2,
                        }}
                      >
                        <Typography variant="subtitle1">
                          {item.food.name}
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold" }}
                        >
                          {formatPrice(item.subtotal)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Qty: {item.qty}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>

          {/* Total + Actions */}
          <Box sx={{ p: 3, borderTop: 1, borderColor: "divider" }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
            >
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                Total:
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {formatPrice(
                  order
                    ? order.total_price
                    : orderItems.reduce((s, i) => s + i.subtotal, 0)
                )}
              </Typography>
            </Box>

            {order && (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleCloseOrder}
                  disabled={closeOrderMutation.isPending}
                  sx={{ flex: 1 }}
                >
                  {closeOrderMutation.isPending ? "Closing..." : "Close Order"}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<Print />}
                  onClick={handleDownloadReceipt}
                  disabled={downloadReceiptMutation.isPending}
                  sx={{ flex: 1 }}
                >
                  {downloadReceiptMutation.isPending
                    ? "Downloading..."
                    : "Receipt"}
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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
