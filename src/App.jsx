import { Route, Routes, BrowserRouter, Navigate } from "react-router-dom";
import "./App.css";
import NotFound from "./pages/notFound";
import AdminPage from "./pages/admin";
import Login from "./pages/login";

function PrivateRoute({ children }) {
  return localStorage.getItem("logined") === "true" ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" />
  );
}

function App() {
  return (
    <BrowserRouter>
      <div id="app">
        <Routes>
          <Route path="login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}


export default App;
