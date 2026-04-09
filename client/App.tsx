import { Navigate, Route, Routes } from "react-router-dom";
import { SqlToERPage } from "./pages/SqlToER/SqlToERPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sql-to-er" replace />} />
      <Route path="/sql-to-er" element={<SqlToERPage />} />
    </Routes>
  );
}
