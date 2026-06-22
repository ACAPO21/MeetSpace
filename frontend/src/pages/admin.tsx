import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

interface Building { id: string; name: string; }
interface Room { id: string; name: string; capacity: number; building?: { name: string }; }

export default function Admin() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const [bName, setBName] = useState(""); const [bAddress, setBAddress] = useState("");
  const [rName, setRName] = useState(""); const [rCapacity, setRCapacity] = useState("");
  const [rEquipments, setREquipments] = useState(""); const [rBuildingId, setRBuildingId] = useState("");

  async function load() {
    try { setBuildings(await api("/buildings")); setRooms(await api("/rooms")); }
    catch (err) { setMsg("❌ " + (err as Error).message); }
  }
  useEffect(() => { load(); }, []);

  async function createBuilding(e: React.FormEvent) {
    e.preventDefault(); setMsg("");
    try {
      await api("/buildings", { method: "POST", body: JSON.stringify({ name: bName, address: bAddress }) });
      setMsg("✅ Bâtiment créé"); setBName(""); setBAddress(""); load();
    } catch (err) { setMsg("❌ " + (err as Error).message); }
  }

  async function createRoom(e: React.FormEvent) {
    e.preventDefault(); setMsg("");
    try {
      await api("/rooms", { method: "POST", body: JSON.stringify({
        name: rName, capacity: Number(rCapacity),
        equipments: rEquipments.split(",").map(s => s.trim()).filter(Boolean),
        buildingId: rBuildingId,
      }) });
      setMsg("✅ Salle créée"); setRName(""); setRCapacity(""); setREquipments(""); load();
    } catch (err) { setMsg("❌ " + (err as Error).message); }
  }

  async function deleteRoom(id: string) {
    try { await api(`/rooms/${id}`, { method: "DELETE" }); load(); }
    catch (err) { setMsg("❌ " + (err as Error).message); }
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Administration</h1>
        <button onClick={() => navigate("/rooms")}>← Retour aux salles</button>
      </div>
      {msg && <p>{msg}</p>}

      <h2>Créer un bâtiment</h2>
      <form onSubmit={createBuilding} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input placeholder="Nom" value={bName} onChange={e => setBName(e.target.value)} required />
        <input placeholder="Adresse" value={bAddress} onChange={e => setBAddress(e.target.value)} required />
        <button type="submit">Créer</button>
      </form>

      <h2>Créer une salle</h2>
      <form onSubmit={createRoom} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        <input placeholder="Nom" value={rName} onChange={e => setRName(e.target.value)} required />
        <input type="number" placeholder="Capacité" value={rCapacity} onChange={e => setRCapacity(e.target.value)} required style={{ width: 90 }} />
        <input placeholder="Équipements (séparés par ,)" value={rEquipments} onChange={e => setREquipments(e.target.value)} />
        <select value={rBuildingId} onChange={e => setRBuildingId(e.target.value)} required>
          <option value="">— Bâtiment —</option>
          {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <button type="submit">Créer</button>
      </form>

      <h2>Salles existantes</h2>
      {rooms.map(r => (
        <div key={r.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12, marginBottom: 8,
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{r.name} — {r.capacity} places{r.building && ` · ${r.building.name}`}</span>
          <button onClick={() => deleteRoom(r.id)}>Supprimer</button>
        </div>
      ))}
    </div>
  );
}