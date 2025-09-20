import api from "@/lib/api";
import { useAuthStore } from "@/store/user";
import { GridView, Login, Logout, Search, ViewList } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import type { Table } from "../types/table";

type TableStatus = "available" | "occupied" | "reserved" | "inactive";

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"floor" | "list">("floor");
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  function onLogout() {
    logout();
    Cookies.remove("token");
    localStorage.removeItem("auth-storage");
    navigate("/login");
  }

  const fetchTables = async () => {
    const res = await api.get("/tables", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setTables(res.data);
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const availableTables = tables.filter((t) => t.status === "available").length;
  const occupiedTables = tables.filter((t) => t.status === "occupied").length;
  const reservedTables = tables.filter(
    (t) => (t.status as TableStatus) === "reserved"
  ).length;
  const inactiveTables = tables.filter(
    (t) => (t.status as TableStatus) === "inactive"
  ).length;

  const getTableColor = (status: TableStatus) => {
    switch (status) {
      case "available":
        return "#9ca3af";
      case "occupied":
        return "#4b5563";
      case "reserved":
        return "#6b7280";
      case "inactive":
        return "#d1d5db";
      default:
        return "#9ca3af";
    }
  };

  const getStatusConfig = (status: TableStatus) => {
    switch (status) {
      case "available":
        return { color: "#9ca3af", label: "Available" };
      case "occupied":
        return { color: "#374151", label: "Occupied" };
      case "reserved":
        return { color: "#6b7280", label: "Reserved" };
      case "inactive":
        return { color: "#d1d5db", label: "Inactive" };
      default:
        return { color: "#9ca3af", label: "Available" };
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <Paper
        elevation={1}
        sx={{ borderRadius: 0, borderBottom: 1, borderColor: "divider" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                backgroundColor: "#1f2937",
                color: "white",
                px: 2,
                py: 1,
                borderRadius: 1,
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              RestaurantPOS
            </Box>
            <TextField
              placeholder="Search table..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: 250,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#f9fafb",
                  "& fieldset": {
                    borderColor: "#e5e7eb",
                  },
                },
              }}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {user ? (
              <>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "primary.main",
                      fontSize: "0.875rem",
                    }}
                  >
                    {user.fullname?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Tooltip title="Account settings">
                    <IconButton
                      onClick={handleClick}
                      size="small"
                      sx={{ ml: 1 }}
                      aria-controls={open ? "account-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={open ? "true" : undefined}
                    >
                      <Box sx={{ textAlign: "left", mx: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "medium", color: "text.primary" }}
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
                  onClick={handleClose}
                  slotProps={{
                    paper: {
                      elevation: 0,
                      sx: {
                        overflow: "visible",
                        filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                        mt: 1.5,
                        "& .MuiAvatar-root": {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                        "&::before": {
                          content: '""',
                          display: "block",
                          position: "absolute",
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: "background.paper",
                          transform: "translateY(-50%) rotate(45deg)",
                          zIndex: 0,
                        },
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
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
                sx={{
                  backgroundColor: "primary.main",
                  p: 1,
                  px: 2,
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ display: "flex" }}>
        {/* Table Management Area */}
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
              Table Management
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant={viewMode === "floor" ? "contained" : "outlined"}
                startIcon={<GridView />}
                onClick={() => setViewMode("floor")}
                sx={{
                  backgroundColor:
                    viewMode === "floor" ? "#1f2937" : "transparent",
                  color: viewMode === "floor" ? "white" : "#1f2937",
                  borderColor: "#1f2937",
                  "&:hover": {
                    backgroundColor:
                      viewMode === "floor" ? "#374151" : "#f9fafb",
                  },
                }}
              >
                Floor Plan
              </Button>
              <Button
                variant={viewMode === "list" ? "contained" : "outlined"}
                startIcon={<ViewList />}
                onClick={() => setViewMode("list")}
                sx={{
                  backgroundColor:
                    viewMode === "list" ? "#1f2937" : "transparent",
                  color: viewMode === "list" ? "white" : "#1f2937",
                  borderColor: "#1f2937",
                  "&:hover": {
                    backgroundColor:
                      viewMode === "list" ? "#374151" : "#f9fafb",
                  },
                }}
              >
                List View
              </Button>
            </Box>
          </Box>

          {/* Table Status Legend */}
          <Box
            sx={{
              backgroundColor: "white",
              p: 2,
              borderRadius: 2,
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ color: "black", mb: 1 }}>
              Table Status
            </Typography>
            <Box sx={{ display: "flex", gap: 3, mb: 1, flexWrap: "wrap" }}>
              {(
                [
                  "available",
                  "occupied",
                  "reserved",
                  "inactive",
                ] as TableStatus[]
              ).map((status) => {
                const config = getStatusConfig(status);
                return (
                  <Box
                    key={status}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: 0.5,
                        backgroundColor: config.color,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      {config.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Tables Grid */}
          <Paper
            sx={{
              display: "flex",
              backgroundColor: "white",
              p: 3,
              borderRadius: 2,
              gap: 2,
              minHeight: "600px",
            }}
          >
            {/* Grid Tables - left side */}
            <Box
              sx={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: 3,
                height: "fit-content",
              }}
            >
              {Array.from({ length: 24 }, (_, i) => {
                const tableNumber = i + 1;
                const table = tables.find(
                  (t) =>
                    t.name === `Table ${tableNumber}` || t.id === tableNumber
                );
                const status = (table?.status as TableStatus) || "available";

                return (
                  <Card
                    key={tableNumber}
                    sx={{
                      backgroundColor: getTableColor(status),
                      color: "white",
                      width: "100%",
                      height: "100px",
                      cursor: "pointer",
                      transition: "box-shadow 0.2s ease-in-out",
                      borderRadius: 1,
                      "&:hover": {
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => {
                      console.log(`Table ${tableNumber} clicked`);
                    }}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                        p: 0,
                        "&:last-child": { pb: 0 },
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: "bold", color: "white" }}
                      >
                        {tableNumber}
                      </Typography>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>

            {/* Quick Stats - right side */}
            <Box
              sx={{
                width: 280,
                borderColor: "divider",
                pl: 3,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" sx={{ color: "text.primary", mb: 1 }}>
                Quick Stats
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  flex: 1,
                }}
              >
                <Box
                  sx={{
                    textAlign: "left",
                    backgroundColor: "lightgray",
                    p: 1,
                    outline: 1,
                    outlineColor: "whitesmoke",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{ fontSize: "30px", color: "text.primary" }}
                  >
                    {availableTables}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Available Tables
                  </Typography>
                </Box>

                <Box
                  sx={{
                    textAlign: "left",
                    backgroundColor: "lightgray",
                    p: 1,
                    outline: 1,
                    outlineColor: "whitesmoke",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{ fontSize: "30px", color: "text.primary" }}
                  >
                    {occupiedTables}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Occupied Tables
                  </Typography>
                </Box>

                <Box
                  sx={{
                    textAlign: "left",
                    backgroundColor: "lightgray",
                    p: 1,
                    outline: 1,
                    outlineColor: "whitesmoke",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{ fontSize: "30px", color: "text.primary" }}
                  >
                    {reservedTables}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Reserved Tables
                  </Typography>
                </Box>

                <Box
                  sx={{
                    textAlign: "left",
                    backgroundColor: "lightgray",
                    p: 1,
                    outline: 1,
                    outlineColor: "whitesmoke",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{ fontSize: "30px", color: "text.primary" }}
                  >
                    {inactiveTables}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Inactive Tables
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
