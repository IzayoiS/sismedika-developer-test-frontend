import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiCard from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRegisterForm } from "../hooks/useRegister";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

export default function RegisterPage() {
  const { errors, handleSubmit, isPending, onSubmit, register } =
    useRegisterForm();

  return (
    <>
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            Sign up
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <FormControl error={!!errors.fullname}>
              <FormLabel htmlFor="name">Full name</FormLabel>
              <TextField
                autoComplete="name"
                required
                fullWidth
                id="name"
                placeholder="Jon Snow"
                {...register("fullname")}
              />
              {errors.fullname && (
                <Typography color="error" variant="caption">
                  {errors.fullname.message}
                </Typography>
              )}
            </FormControl>
            <FormControl error={!!errors.email}>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                required
                fullWidth
                id="email"
                placeholder="your@email.com"
                autoComplete="email"
                variant="outlined"
                {...register("email")}
              />
              {errors.email && (
                <Typography color="error" variant="caption">
                  {errors.email.message}
                </Typography>
              )}
            </FormControl>
            <FormControl error={!!errors.password}>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                required
                fullWidth
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="new-password"
                variant="outlined"
                {...register("password")}
              />
              {errors.password && (
                <Typography color="error" variant="caption">
                  {errors.password.message}
                </Typography>
              )}
            </FormControl>
            <FormControl error={!!errors.password_confirmation}>
              <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
              <TextField
                required
                fullWidth
                placeholder="••••••"
                type="password"
                id="confirmPassword"
                autoComplete="confirm-password"
                variant="outlined"
                {...register("password_confirmation")}
              />
              {errors.password_confirmation && (
                <Typography color="error" variant="caption">
                  {errors.password_confirmation.message}
                </Typography>
              )}
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isPending ? true : false}
            >
              {isPending ? (
                <CircularProgress size="25px" color="success" />
              ) : (
                "Sign Up"
              )}
            </Button>
          </Box>
          <Divider>
            <Typography sx={{ color: "text.secondary" }}>or</Typography>
          </Divider>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography sx={{ textAlign: "center" }}>
              Already have an account?{" "}
              <Link href="/login" variant="body2" sx={{ alignSelf: "center" }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
    </>
  );
}
