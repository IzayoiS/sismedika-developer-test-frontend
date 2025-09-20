import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { LockOutlined } from "@mui/icons-material";

export default function Page404() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.palette.grey[50],
        p: 2,
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            backgroundColor: "white",
          }}
        >
          <LockOutlined
            sx={{
              fontSize: 64,
              color: "error.main",
              mb: 3,
            }}
          />

          <Typography
            component="h1"
            variant={isMobile ? "h4" : "h3"}
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "error.main",
              mb: 2,
            }}
          >
            404 - Not Found
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              mb: 4,
              fontSize: isMobile ? "1rem" : "1.125rem",
            }}
          >
            You don't have permission to access this page.
          </Typography>

          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            size="large"
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              px: 4,
              py: 1.5,
              borderRadius: 1,
              fontWeight: "medium",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
