import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import LoginPage from "./features/auth/components/loginPage";
import RegisterPage from "./features/auth/components/registerPage";
import Foods from "./features/foods/components/foodPage";
import Tables from "./features/tables/components/tablesPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/foods" element={<Foods />} />
        <Route path="/tables" element={<Tables />} />
      </Routes>
    </Router>
  );
}
