import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import { getToken } from "./api";
import Rooms from "./pages/rooms";
import MesReservations from "./pages/reservations";
import Admin from "./pages/admin";
import RoomCalendar from "./pages/calendar";

function RequireAuth({ children }: { children: React.ReactNode }) {
  return getToken() ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/rooms" element={<RequireAuth><Rooms /></RequireAuth>} />
      <Route path="/mes-reservations" element={<RequireAuth><MesReservations /></RequireAuth>} />
      <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
      <Route path="/salles/:roomId/calendrier" element={<RequireAuth><RoomCalendar /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}