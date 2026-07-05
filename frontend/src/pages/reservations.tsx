import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getToken } from "../api";

interface Participant { id: string; name: string; }
interface Booking {
  id: string; title: string; start: string; end: string;
  userId: string; room?: { name: string }; participants?: Participant[];
}

function myUserId(): string {
  const t = getToken();
  if (!t) return "";
  try {
    const payload = t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload)).sub ?? "";
  } catch { return ""; }
}

export default function MesReservations() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const me = myUserId();

  async function load() {
    setError("");
    try { setBookings(await api("/bookings/mine")); }
    catch (err) { setError((err as Error).message); }
  }

  useEffect(() => { load(); }, []);

  async function cancel(id: string) {
    try { await api(`/bookings/${id}`, { method: "DELETE" }); load(); }
    catch (err) { setError((err as Error).message); }
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Mes réservations</h1>
        <button onClick={() => navigate("/rooms")}>Retour aux salles</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {bookings.length === 0 && <p>Aucune réservation.</p>}

      {bookings.map((b) => {
        const owner = b.userId === me;
        return (
          <div key={b.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, marginBottom: 12,
            display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{b.title}</strong>{b.room && <span> · {b.room.name}</span>}
              {!owner && <span style={{ marginLeft: 8, fontSize: 12, color: "#fff",
                background: "#7c3aed", borderRadius: 4, padding: "2px 6px" }}>Invité</span>}
              <div style={{ fontSize: 14, color: "#666" }}>
                {new Date(b.start).toLocaleString("fr-FR")} → {new Date(b.end).toLocaleString("fr-FR")}
              </div>
              {b.participants && b.participants.length > 0 && (
                <div style={{ fontSize: 13, color: "#444", marginTop: 4 }}>
                  Invités : {b.participants.map((p) => p.name).join(", ")}
                </div>
              )}
            </div>
            {owner && <button onClick={() => cancel(b.id)}>Annuler</button>}
          </div>
        );
      })}
    </div>
  );
}