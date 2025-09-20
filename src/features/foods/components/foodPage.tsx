import Navbar from "@/components/layouts/navBar";
import {
  useFoods,
  useToggleFoodStatus,
  useDeleteFood,
  useCreateFood,
  useUpdateFood,
} from "../hooks/useFoods";
import { Add, Delete, Edit, ToggleOff, ToggleOn } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table as MuiTable,
  Paper,
  Snackbar,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useState } from "react";
import type { Food, FormData, FormErrors } from "../types/food";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function FoodsPage() {
  const [open, setOpen] = useState<boolean>(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const [form, setForm] = useState<FormData>({
    name: "",
    price: 0,
    description: "",
    category: "",
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const {
    data: foods = [],
    isLoading,
    error,
    refetch,
  } = useFoods({
    refetchInterval: 5000,
  });

  const createFoodMutation = useCreateFood();
  const updateFoodMutation = useUpdateFood();
  const toggleFoodStatusMutation = useToggleFoodStatus();
  const deleteFoodMutation = useDeleteFood();

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const hideSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!form.name.trim()) {
      errors.name = "Name is required";
    }

    if (form.price <= 0) {
      errors.price = "Price must be greater than 0";
    }

    if (!form.category.trim()) {
      errors.category = "Category is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (editingFood) {
        await updateFoodMutation.mutateAsync({ id: editingFood.id, ...form });
        showSnackbar("Food updated successfully!");
      } else {
        await createFoodMutation.mutateAsync(form);
        showSnackbar("Food created successfully!");
      }

      handleCloseDialog();
    } catch (error) {
      console.error("Error saving food:", error);
      const err = error as ApiError;
      showSnackbar(
        err.response?.data?.message || err.message || "Failed to save food",
        "error"
      );
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await deleteFoodMutation.mutateAsync(id);
      showSnackbar("Food deleted successfully!");
    } catch (error) {
      console.error("Error deleting food:", error);
      const err = error as ApiError;
      showSnackbar(
        err.response?.data?.message || err.message || "Failed to delete food",
        "error"
      );
    }
  };

  const handleToggleStatus = async (food: Food) => {
    try {
      await toggleFoodStatusMutation.mutateAsync({
        id: food.id,
        is_active: !food.is_active,
      });
      showSnackbar(
        `Food ${!food.is_active ? "activated" : "deactivated"} successfully!`
      );
    } catch (error) {
      console.error("Error toggling food status:", error);
      const err = error as ApiError;
      showSnackbar(
        err.response?.data?.message ||
          err.message ||
          "Failed to update food status",
        "error"
      );
    }
  };

  const handleOpenDialog = (food?: Food) => {
    if (food) {
      setEditingFood(food);
      setForm({
        name: food.name,
        price: food.price,
        description: food.description || "",
        category: food.category || "",
        is_active: food.is_active,
      });
    } else {
      setEditingFood(null);
      setForm({
        name: "",
        price: 0,
        description: "",
        category: "",
        is_active: true,
      });
    }
    setFormErrors({});
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingFood(null);
    setForm({
      name: "",
      price: 0,
      description: "",
      category: "",
      is_active: true,
    });
    setFormErrors({});
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredFoods = foods.filter(
    (food) =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (food.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          minHeight: "100vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography color="error">Error loading foods</Typography>
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
        {/* Food Management Area */}
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
              Master Makanan
            </Typography>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{
                backgroundColor: "#1f2937",
                "&:hover": {
                  backgroundColor: "#374151",
                },
              }}
            >
              Add Food
            </Button>
          </Box>

          {/* Foods Table */}
          <Paper elevation={0} sx={{ border: 1, borderColor: "divider" }}>
            <TableContainer>
              <MuiTable>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "text.primary" }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "text.primary" }}
                    >
                      Name
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "text.primary" }}
                    >
                      Price
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "text.primary" }}
                    >
                      Category
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "text.primary" }}
                    >
                      Description
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
                  {filteredFoods.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        sx={{ textAlign: "center", py: 4 }}
                      >
                        <Typography variant="body1" color="text.secondary">
                          {searchTerm
                            ? "No foods found matching your search."
                            : "No foods found. Click 'Add Food' to create your first menu item."}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFoods.map((food) => (
                      <TableRow key={food.id} hover>
                        <TableCell>
                          <Chip
                            icon={food.is_active ? <ToggleOn /> : <ToggleOff />}
                            label={food.is_active ? "Active" : "Inactive"}
                            size="small"
                            color={food.is_active ? "success" : "error"}
                            variant={food.is_active ? "filled" : "outlined"}
                            sx={{ fontWeight: "medium" }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "medium" }}
                          >
                            {food.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "medium", color: "#059669" }}
                          >
                            {formatPrice(food.price)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={food.category || "Uncategorized"}
                            size="small"
                            sx={{
                              backgroundColor: "#e5e7eb",
                              color: "#374151",
                              fontWeight: "medium",
                              fontSize: "0.75rem",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              maxWidth: "200px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {food.description || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              justifyContent: "center",
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleToggleStatus(food)}
                              sx={{
                                color: food.is_active ? "#ef4444" : "#10b981",
                                "&:hover": {
                                  backgroundColor: food.is_active
                                    ? "#fef2f2"
                                    : "#f0fdf4",
                                },
                              }}
                              title={food.is_active ? "Deactivate" : "Activate"}
                            >
                              {food.is_active ? <ToggleOff /> : <ToggleOn />}
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(food)}
                              sx={{
                                color: "#6b7280",
                                "&:hover": {
                                  backgroundColor: "#f3f4f6",
                                  color: "#374151",
                                },
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(food.id, food.name)}
                              sx={{
                                color: "#ef4444",
                                "&:hover": {
                                  backgroundColor: "#fef2f2",
                                  color: "#dc2626",
                                },
                              }}
                            >
                              <Delete fontSize="small" />
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
            mt: 1,
            p: 3,
            backgroundColor: "white",
          }}
        >
          <Typography variant="h6" sx={{ color: "text.primary", mb: 3 }}>
            Quick Stats
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: "bold",
                  color: "text.primary",
                  fontSize: "3rem",
                  lineHeight: 1,
                }}
              >
                {foods.length}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Total Foods
              </Typography>
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: "bold",
                  color: "text.primary",
                  fontSize: "3rem",
                  lineHeight: 1,
                }}
              >
                {foods.filter((f) => f.is_active).length}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Active Foods
              </Typography>
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: "bold",
                  color: "text.primary",
                  fontSize: "3rem",
                  lineHeight: 1,
                }}
              >
                {new Set(foods.map((f) => f.category || "Uncategorized")).size}{" "}
                {/* Handle undefined category */}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Categories
              </Typography>
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: "bold",
                  color: "text.primary",
                  fontSize: "3rem",
                  lineHeight: 1,
                }}
              >
                {filteredFoods.length}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Filtered Results
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingFood ? "Edit Food" : "Add New Food"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            margin="normal"
            label="Food Name"
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              if (formErrors.name) {
                setFormErrors({ ...formErrors, name: undefined });
              }
            }}
            error={!!formErrors.name}
            helperText={formErrors.name}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Price (IDR)"
            type="number"
            value={form.price === 0 ? "" : form.price}
            onChange={(e) => {
              const value =
                e.target.value === "" ? 0 : parseFloat(e.target.value);
              setForm({ ...form, price: isNaN(value) ? 0 : value });
              if (formErrors.price) {
                setFormErrors({ ...formErrors, price: undefined });
              }
            }}
            error={!!formErrors.price}
            helperText={formErrors.price}
            inputProps={{ min: 0, step: 1000 }}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Category"
            value={form.category}
            onChange={(e) => {
              setForm({ ...form, category: e.target.value });
              if (formErrors.category) {
                setFormErrors({ ...formErrors, category: undefined });
              }
            }}
            error={!!formErrors.category}
            helperText={formErrors.category}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Description"
            multiline
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional description about the food..."
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
                color="success"
              />
            }
            label="Active"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseDialog}
            disabled={
              createFoodMutation.isPending || updateFoodMutation.isPending
            }
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={
              createFoodMutation.isPending || updateFoodMutation.isPending
            }
            startIcon={
              createFoodMutation.isPending || updateFoodMutation.isPending ? (
                <CircularProgress size={16} />
              ) : null
            }
            sx={{
              backgroundColor: "#1f2937",
              "&:hover": {
                backgroundColor: "#374151",
              },
            }}
          >
            {createFoodMutation.isPending || updateFoodMutation.isPending
              ? "Saving..."
              : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

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
