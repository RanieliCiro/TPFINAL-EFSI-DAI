import { Routes, Route, Outlet } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Library from "./pages/Library.jsx";
import Stats from "./pages/Stats.jsx";
import Profile from "./pages/Profile.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        element={
          <ProtectedRoute>
            <div className="app-layout">
              <Navbar />
              <Outlet />
            </div>
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
