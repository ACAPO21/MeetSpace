import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, clearToken, getRole } from "../api";

interface Room {
  id: string;
  name: string;
  capacity: number;
  equipments: string[];
  building?: { name: string };
}

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [capacityMin, setCapacityMin] = useState("");
  const [equipment, setEquipment] = useState("");
  const [equipmentOptions, setEquipmentOptions] = useState<string[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function loadRooms() {
    setError("");
    const params = new URLSearchParams();
    if (capacityMin) params.set("capacityMin", capacityMin);
    if (equipment) params.set("equipment", equipment);
    try {
      setRooms(await api(`/rooms?${params.toString()}`));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => { loadRooms(); }, []);

  // récupère la liste des équipements existants (une fois, sans filtre)
  useEffect(() => {
    api("/rooms")
      .then((all: Room[]) => {
        const set = new Set<string>();
        all.forEach((r) => r.equipments.forEach((e) => set.add(e)));
        setEquipmentOptions([...set].sort());
      })
      .catch(() => setEquipmentOptions([]));
  }, []);

  function logout() { clearToken(); navigate("/login"); }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Salles</h1>
        <div>
          <button onClick={() => navigate("/mes-reservations")} style={{ marginRight: 8 }}>
            Mes réservations
          </button>
          {getRole() === "ADMIN" && (
            <button onClick={() => navigate("/admin")} style={{ marginRight: 8 }}>Admin</button>
          )}
          <button onClick={logout}>Déconnexion</button>
        </div>
      </div>

      <div style={{ margin: "16px 0" }}>
        <label htmlFor="cap">Capacité min</label>
        <input id="cap" type="number" value={capacityMin}
          onChange={(e) => setCapacityMin(e.target.value)} style={{ margin: "0 12px", width: 70 }} />
        <label htmlFor="eq">Équipement</label>
        <select id="eq" value={equipment} onChange={(e) => setEquipment(e.target.value)} style={{ margin: "0 12px" }}>
          <option value="">Tous les équipements</option>
          {equipmentOptions.map((eq) => (
            <option key={eq} value={eq}>{eq}</option>
          ))}
        </select>
        <button onClick={loadRooms}>Filtrer</button>
      </div>

      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}

      {rooms.map((room) => <RoomCard key={room.id} room={room} />)}
      {rooms.length === 0 && <p>Aucune salle ne correspond.</p>}
    </div>
  );
}

function RoomCard({ room }: { room: Room }) {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [msg, setMsg] = useState("");

  async function book(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      await api("/bookings", {
        method: "POST",
        body: JSON.stringify({ roomId: room.id, title, start, end }),
      });
      setMsg("Réservation confirmée");
      setTitle(""); setStart(""); setEnd("");
    } catch (err) {
      setMsg((err as Error).message);
    }
  }

  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, marginBottom: 12 }}>
      <strong>{room.name}</strong> — {room.capacity} places
      {room.building && <span> · {room.building.name}</span>}
      <div style={{ fontSize: 14, color: "#666" }}>
        Équipements : {room.equipments.join(", ") || "aucun"}
      </div>

      <div style={{ marginTop: 8 }}>
        <Link to={`/salles/${room.id}/calendrier`}>Voir le calendrier / réserver</Link>
      </div>

      <form onSubmit={book} style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input type="text" placeholder="Titre" aria-label="Titre de la réunion" value={title}
          onChange={(e) => setTitle(e.target.value)} required />
        <input type="datetime-local" aria-label="Début" value={start}
          onChange={(e) => setStart(e.target.value)} required />
        <input type="datetime-local" aria-label="Fin" value={end}
          onChange={(e) => setEnd(e.target.value)} required />
        <button type="submit">Réserver</button>
      </form>
      {msg && <p style={{ margin: "8px 0 0" }}>{msg}</p>}
    </div>
  );
}