import {
  Avatar,
  Box,
  Button,
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
import { Login, Logout, Search } from "@mui/icons-material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "@/store/user";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
}

const searchConfigs: Record<
  string,
  { placeholder: string; icon?: React.ReactNode }
> = {
  "/": { placeholder: "Search tables..." },
  "/tables": { placeholder: "Search tables..." },
  "/foods": { placeholder: "Search foods..." },
  "/orders": { placeholder: "Search orders..." },
};

export default function Navbar({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
}: NavbarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const getSearchConfig = () => {
    const exactMatch = searchConfigs[location.pathname];
    if (exactMatch) return exactMatch;

    const matchingPath = Object.keys(searchConfigs).find(
      (path) => location.pathname.startsWith(path) && path !== "/"
    );

    return matchingPath
      ? searchConfigs[matchingPath]
      : { placeholder: "Search..." };
  };

  const { placeholder } = getSearchConfig();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(searchTerm);
    }
  };

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

  return (
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
            onClick={() => navigate("/")}
          >
            RestaurantPOS
          </Box>

          <form onSubmit={handleSearchSubmit} style={{ margin: 0 }}>
            <TextField
              placeholder={placeholder}
              size="small"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
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
          </form>
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
  );
}
