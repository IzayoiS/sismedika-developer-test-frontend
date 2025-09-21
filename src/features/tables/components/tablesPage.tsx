import Navbar from "@/components/layouts/navBar";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTables, useUpdateTableStatus } from "../hooks/useTables";
import { useNavigate } from "react-router-dom";

type TableStatus = "available" | "occupied" | "reserved" | "inactive";

export default function TablesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState<{
    id: number;
    name: string;
    status: TableStatus;
  } | null>(null);
  const { reserveTable, occupyTable } = useUpdateTableStatus();
  const {
    data: tables = [],
    isLoading,
    error,
    refetch,
  } = useTables({
    refetchInterval: 3000,
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

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography color="error">Error loading tables</Typography>
        <Button onClick={() => refetch()} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  const availableTables = tables.filter((t) => t.status === "available").length;
  const occupiedTables = tables.filter((t) => t.status === "occupied").length;
  const reservedTables = tables.filter(
    (t) => (t.status as TableStatus) === "reserved"
  ).length;
  const inactiveTables = tables.filter(
    (t) => (t.status as TableStatus) === "inactive"
  ).length;

  const handleOpenDialog = (tableNumber: number, status: TableStatus) => {
    setSelectedTable({
      id: tableNumber,
      name: `Table ${tableNumber}`,
      status,
    });
  };

  const handleCloseDialog = () => {
    setSelectedTable(null);
  };

  const handleSetStatus = (status: TableStatus) => {
    if (!selectedTable) return;

    if (status === "reserved") {
      reserveTable.mutate(selectedTable.id);
    } else if (status === "occupied") {
      occupyTable.mutate(selectedTable.id);
    }

    setSelectedTable(null);
  };

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
      <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

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

            <Button
              variant="contained"
              onClick={() => navigate("/orders")}
              sx={{
                backgroundColor: "#1f2937",
                color: "white",
                "&:hover": {
                  backgroundColor: "#374151",
                },
              }}
            >
              View Orders
            </Button>
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
                      cursor:
                        status === "available" ? "pointer" : "not-allowed", // ⬅️ hanya available yg bisa klik
                      transition: "box-shadow 0.2s ease-in-out",
                      borderRadius: 1,
                      "&:hover": {
                        boxShadow: status === "available" ? 4 : 0,
                      },
                    }}
                    onClick={() => {
                      if (status === "available") {
                        handleOpenDialog(tableNumber, status);
                      }
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
            <Dialog open={!!selectedTable} onClose={handleCloseDialog}>
              <DialogTitle>
                {selectedTable ? selectedTable.name : "Select Table"}
              </DialogTitle>
              <DialogContent dividers>
                <Typography>
                  Pilih status untuk {selectedTable?.name || "Table"}:
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog} color="inherit">
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSetStatus("reserved")}
                  variant="outlined"
                  color="secondary"
                >
                  Reserved
                </Button>
                <Button
                  onClick={() => handleSetStatus("occupied")}
                  variant="contained"
                  color="primary"
                >
                  Occupied
                </Button>
              </DialogActions>
            </Dialog>

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
