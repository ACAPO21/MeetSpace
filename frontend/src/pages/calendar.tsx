import { useCallback, useEffect, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import type { View, SlotInfo } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { fr } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { api, getToken } from "../api";

const localizer = dateFnsLocalizer({
  format, parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay, locales: { fr },
});

interface BusySlot { start: string; end: string; }
interface CalEvent { title: string; start: Date; end: Date; }
interface User { id: string; name: string; email: string; }

function myUserId(): string {
  const t = getToken();
  if (!t) return "";
  try {
    const payload = t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload)).sub ?? "";
  } catch { return ""; }
}

export default function RoomCalendar() {
  const { roomId } = useParams<{ roomId: string }>();
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());

  const [pendingSlot, setPendingSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [title, setTitle] = useState("");
  const [invited, setInvited] = useState<string[]>([]);
  const [modalError, setModalError] = useState("");

  // Réservation accessible au clavier : alternative au glisser-déposer souris du calendrier
  const [fDate, setFDate] = useState("");
  const [fStart, setFStart] = useState("");
  const [fEnd, setFEnd] = useState("");
  const [formError, setFormError] = useState("");

  const me = myUserId();
  const others = users.filter((u) => u.id !== me); // tout le monde SAUF moi

  const load = useCallback(async () => {
    if (!roomId) return;
    setError("");
    try {
      const slots: BusySlot[] = await api(`/bookings/room/${roomId}`);
      setEvents(slots.map((s) => ({ title: "Occupé", start: new Date(s.start), end: new Date(s.end) })));
    } catch (err) {
      setError((err as Error).message);
    }
  }, [roomId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { api("/users").then(setUsers).catch(() => setUsers([])); }, []);

  function openModal(slot: SlotInfo) {
    setPendingSlot({ start: new Date(slot.start), end: new Date(slot.end) });
    setTitle(""); setInvited([]); setModalError("");
  }

  // Ouvre la même fenêtre de réservation à partir du formulaire clavier
  function openFromForm(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!fDate || !fStart || !fEnd) {
      setFormError("Date, heure de début et heure de fin obligatoires."); return;
    }
    const start = new Date(`${fDate}T${fStart}`);
    const end = new Date(`${fDate}T${fEnd}`);
    if (end <= start) {
      setFormError("L'heure de fin doit être postérieure à l'heure de début."); return;
    }
    setPendingSlot({ start, end });
    setTitle(""); setInvited([]); setModalError("");
  }

  function toggleInvite(id: string) {
    setInvited((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  async function confirmBooking() {
    if (!pendingSlot || !title.trim()) { setModalError("Titre obligatoire."); return; }
    try {
      await api("/bookings", {
        method: "POST",
        body: JSON.stringify({
          roomId, title, start: pendingSlot.start, end: pendingSlot.end, participantIds: invited,
        }),
      });
      setPendingSlot(null);
      await load();
    } catch (err) {
      setModalError((err as Error).message); // ex : "Créneau déjà réservé"
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "sans-serif" }}>
      <Link to="/rooms">Retour aux salles</Link>
      <h1>Calendrier de la salle</h1>
      <p style={{ color: "#666" }}>
        Choisis un créneau libre directement sur le calendrier (souris) ou à l'aide du formulaire ci-dessous (clavier), puis renseigne la réunion. Les blocs gris sont occupés.
      </p>
      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}

      <form onSubmit={openFromForm} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Réserver un créneau au clavier</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <span style={{ display: "flex", flexDirection: "column" }}>
            <label htmlFor="bk-date">Date</label>
            <input id="bk-date" type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} />
          </span>
          <span style={{ display: "flex", flexDirection: "column" }}>
            <label htmlFor="bk-start">Heure de début</label>
            <input id="bk-start" type="time" value={fStart} onChange={(e) => setFStart(e.target.value)} />
          </span>
          <span style={{ display: "flex", flexDirection: "column" }}>
            <label htmlFor="bk-end">Heure de fin</label>
            <input id="bk-end" type="time" value={fEnd} onChange={(e) => setFEnd(e.target.value)} />
          </span>
          <button type="submit">Continuer</button>
        </div>
        {formError && <p role="alert" style={{ color: "red", margin: "8px 0 0" }}>{formError}</p>}
      </form>

      <div style={{ height: 600 }}>
        <Calendar
          localizer={localizer} culture="fr" events={events}
          startAccessor="start" endAccessor="end"
          selectable onSelectSlot={openModal}
          view={view} onView={setView} date={date} onNavigate={setDate}
          views={[Views.WEEK, Views.DAY]}
          min={new Date(1970, 0, 1, 7, 0)} max={new Date(1970, 0, 1, 21, 0)}
          messages={{
            week: "Semaine", day: "Jour", today: "Aujourd'hui",
            previous: "Précédent", next: "Suivant",
            noEventsInRange: "Aucune réservation sur cette période.",
          }}
        />
      </div>

      {pendingSlot && (
        <div style={overlay}>
          <div style={modalBox}>
            <h2 style={{ marginTop: 0 }}>Nouvelle réservation</h2>
            <p style={{ color: "#666", fontSize: 14 }}>
              {pendingSlot.start.toLocaleString("fr-FR")} → {pendingSlot.end.toLocaleString("fr-FR")}
            </p>

            <label htmlFor="bk-title">Titre</label>
            <input id="bk-title" type="text" value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", margin: "4px 0 12px", padding: 6, boxSizing: "border-box" }} />

            <fieldset style={{ border: "1px solid #ddd", borderRadius: 6, padding: 8 }}>
              <legend>Inviter des collègues</legend>
              <div style={{ maxHeight: 160, overflowY: "auto" }}>
                {others.map((u) => (
                  <label key={u.id} style={{ display: "block", padding: "2px 0" }}>
                    <input type="checkbox" checked={invited.includes(u.id)} onChange={() => toggleInvite(u.id)} />{" "}
                    {u.name} <span style={{ color: "#595959", fontSize: 13 }}>· {u.email}</span>
                  </label>
                ))}
                {others.length === 0 && <span style={{ color: "#595959" }}>Aucun autre utilisateur.</span>}
              </div>
            </fieldset>

            {modalError && <p style={{ color: "red" }}>{modalError}</p>}

            <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setPendingSlot(null)}>Annuler</button>
              <button onClick={confirmBooking}>Réserver</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const overlay: CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
};
const modalBox: CSSProperties = {
  background: "#fff", borderRadius: 8, padding: 20, width: 380, maxWidth: "90vw", fontFamily: "sans-serif",
};