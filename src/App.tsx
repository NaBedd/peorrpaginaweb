import { useCallback, useEffect, useRef, useState } from "react";
import thiefImg from "./assets/thief.png";
import evilCursorImg from "./assets/evil-cursor.png";
import fondoImg from "./assets/fondo.png";

/* ------------------------------------------------------------------ */
/* Datos                                                               */
/* ------------------------------------------------------------------ */

const COUNTRIES_BY_GDP = [
  "Estados Unidos", "China", "Alemania", "Japón", "India", "Reino Unido",
  "Francia", "Italia", "Brasil", "Canadá", "Rusia", "México", "Australia",
  "Corea del Sur", "España", "Indonesia", "Países Bajos", "Turquía",
  "Arabia Saudita", "Suiza", "Polonia", "Taiwán", "Bélgica", "Argentina",
  "Suecia", "Irlanda", "Noruega", "Austria", "Israel", "Tailandia",
  "Singapur", "Emiratos Árabes Unidos", "Filipinas", "Vietnam", "Bangladesh",
  "Malasia", "Dinamarca", "Sudáfrica", "Hong Kong", "Egipto", "Colombia",
  "Chile", "Finlandia", "Rumanía", "República Checa", "Portugal", "Perú",
  "Nueva Zelanda", "Grecia", "Kazajistán",
];

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const LETTERS = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/* ------------------------------------------------------------------ */
/* Estilos corporativos aburridos                                      */
/* ------------------------------------------------------------------ */

const LABEL: React.CSSProperties = {
  color: "#A9A9A9",
  fontSize: 12,
  display: "block",
  marginBottom: 4,
};
const PANEL: React.CSSProperties = {
  background: "#F5F5F5",
  border: "1px solid #D9D9D9",
  padding: 18,
  marginBottom: 14,
};
const INPUT: React.CSSProperties = {
  border: "1px solid #B8B8B8",
  background: "#FAFAFA",
  padding: "6px 8px",
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: 13,
  color: "#333",
  width: "100%",
};
const H2: React.CSSProperties = {
  fontSize: 15,
  color: "#3B5570",
  borderBottom: "2px solid #3B5570",
  paddingBottom: 4,
  marginBottom: 14,
  fontWeight: "bold",
};

/* ------------------------------------------------------------------ */
/* Sección 6: Música de ascensor                                       */
/* ------------------------------------------------------------------ */

function useElevatorMusic(muted: boolean) {
  const startedRef = useRef(false);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext;
      const ctx = new Ctx();
      const gain = ctx.createGain();
      gain.gain.value = 0.07;
      gain.connect(ctx.destination);
      gainRef.current = gain;

      const melody = [523.25, 587.33, 659.25, 587.33, 523.25, 440, 493.88, 523.25];
      let i = 0;
      const playNote = () => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = melody[i % melody.length]!;
        g.gain.setValueAtTime(0.0001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
        osc.connect(g);
        g.connect(gain);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
        i++;
      };
      playNote();
      const id = window.setInterval(playNote, 620);
      (window as unknown as { __elevatorId?: number }).__elevatorId = id;
    };

    window.addEventListener("pointerdown", start);
    window.addEventListener("keydown", start);
    window.addEventListener("mousemove", start);
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
      window.removeEventListener("mousemove", start);
    };
  }, []);

  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = muted ? 0 : 0.07;
  }, [muted]);
}

/* ------------------------------------------------------------------ */
/* Sección 7: Enjambre de cursores malvados                            */
/* ------------------------------------------------------------------ */

type Evil = { x: number; y: number };

function EvilSwarm({ mouse }: { mouse: React.RefObject<{ x: number; y: number }> }) {
  const [, force] = useState(0);
  const evils = useRef<Evil[]>([{ x: 40, y: 40 }]);
  const nodes = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const m = mouse.current!;
      const list = evils.current;
      const spawned: Evil[] = [];
      for (const e of list) {
        const dx = m.x - e.x;
        const dy = m.y - e.y;
        const d = Math.hypot(dx, dy) || 1;
        // Velocidad dinámica: el cursor cubre el 5% de la distancia total en cada fotograma
        e.x += dx * 0.05;
        e.y += dy * 0.05;
          if (d < 5 && (list.length + spawned.length) < 15) {
          spawned.push({ x: e.x + (Math.random() * 40 - 20), y: e.y + (Math.random() * 40 - 20) });
        }
      }
      if (spawned.length) list.push(...spawned);
      const container = nodes.current;
      if (container) {
        while (container.childElementCount < list.length) {
          const el = document.createElement("div");
          el.style.cssText =
              "position:fixed;top:0;left:0;width:28px;height:28px;pointer-events:none;z-index:9998;background-size:contain;background-repeat:no-repeat;";
          el.style.backgroundImage = `url(${evilCursorImg})`;
          container.appendChild(el);
        }
        for (let i = 0; i < list.length; i++) {
          const el = container.children[i] as HTMLElement;
          el.style.transform = `translate(${list[i]!.x}px, ${list[i]!.y}px)`;
        }
      }
      if (spawned.length) force((n) => n + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mouse]);

  return (
      <>
        <div ref={nodes} />
        <div
            style={{
              position: "fixed",
              bottom: 8,
              left: 8,
              zIndex: 9999,
              background: "#8B0000",
              color: "#fff",
              fontSize: 11,
              padding: "3px 7px",
            }}
        >
          Cursores enemigos activos: {evils.current.length}
        </div>
      </>
  );
}

/* ------------------------------------------------------------------ */
/* Sección 6: Botón de silencio robado por el ladrón                   */
/* ------------------------------------------------------------------ */

function MuteThief({
                     muted,
                     setMuted,
                     mouse,
                   }: {
  muted: boolean;
  setMuted: (v: boolean) => void;
  mouse: React.RefObject<{ x: number; y: number }>;
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [fleeing, setFleeing] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPos({ x: window.innerWidth - 170, y: 16 });
  }, []);

  useEffect(() => {
    const check = () => {
      if (fleeing) return;
      const el = boxRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = Math.max(r.left, Math.min(mouse.current!.x, r.right));
      const cy = Math.max(r.top, Math.min(mouse.current!.y, r.bottom));
      const d = Math.hypot(mouse.current!.x - cx, mouse.current!.y - cy);
      if (d < 50) {
        setFleeing(true);
        window.setTimeout(() => {
          setPos({
            x: Math.random() * Math.max(50, window.innerWidth - 220),
            y: Math.random() * Math.max(50, window.innerHeight - 120),
          });
          window.setTimeout(() => setFleeing(false), 350);
        }, 120);
      }
    };
    const id = window.setInterval(check, 40);
    return () => clearInterval(id);
  }, [fleeing, mouse]);

  return (
      <div
          ref={boxRef}
          style={{
            position: "fixed",
            left: pos.x,
            top: pos.y,
            zIndex: 9997,
            display: "flex",
            alignItems: "center",
            gap: 4,
            transition: fleeing ? "left 0.25s linear, top 0.25s linear" : "none",
          }}
      >
        <img
            src={thiefImg}
            alt="ladrón"
            width={44}
            height={44}
            loading="lazy"
            style={{ width: 44, height: 44, opacity: fleeing ? 1 : 0 }}
        />
        <button
            type="button"
            onClick={() => setMuted(!muted)}
            style={{
              background: "#1F6FB2",
              color: "#FFFFFF",
              border: "2px solid #14456F",
              padding: "10px 16px",
              fontSize: 15,
              fontWeight: "bold",
              cursor: "pointer",
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
        >
          🔊 {muted ? "Activar" : "Silenciar"}
        </button>
      </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sección 2: Datepicker hostil                                        */
/* ------------------------------------------------------------------ */

function HostileDatePicker({
                             value,
                             onChange,
                           }: {
  value: string;
  onChange: (v: string) => void;
}) {
  const now = new Date();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const [day, setDay] = useState(daysInMonth);

  const prevMonth = () => {
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    setMonth(m);
    setYear(y);
    setDay(new Date(y, m + 1, 0).getDate());
  };

  return (
      <div>
        <input
            readOnly
            value={value}
            placeholder="Seleccione con el calendario"
            onKeyDown={(e) => e.preventDefault()}
            onClick={() => setOpen((o) => !o)}
            style={{ ...INPUT, cursor: "pointer" }}
        />
        {open && (
            <div style={{ border: "1px solid #B8B8B8", background: "#FFF", padding: 10, marginTop: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <button type="button" onClick={prevMonth} style={{ ...INPUT, width: 34, cursor: "pointer" }}>
                  {"<"}
                </button>
                <span style={{ fontSize: 13, color: "#333" }}>
              {MONTHS[month]} {year}
            </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                    type="button"
                    onClick={() => setDay((d) => (d > 1 ? d - 1 : 1))}
                    style={{ ...INPUT, width: 34, cursor: "pointer" }}
                >
                  {"<"}
                </button>
                <button
                    type="button"
                    onClick={() => {
                      onChange(`${String(day).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}/${year}`);
                      setOpen(false);
                    }}
                    style={{ ...INPUT, width: 60, cursor: "pointer", textAlign: "center" }}
                >
                  {day}
                </button>
              </div>
              <p style={{ fontSize: 10, color: "#A9A9A9", marginTop: 8 }}>
                Use "&lt;" para retroceder mes a mes y día a día. Haga clic en el número para confirmar.
              </p>
            </div>
        )}
      </div>
  );
}

/* ------------------------------------------------------------------ */
/* Portal                                                              */
/* ------------------------------------------------------------------ */

function AntiUXPortal() {
  const mouse = useRef({ x: 0, y: 0 });
  const [muted, setMuted] = useState(false);
  useElevatorMusic(muted);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Sección 1
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  const startFakeUpload = useCallback(() => {
    if (uploading) return;
    setUploading(true);
    setDone(false);
    setProgress(0);
    const t0 = Date.now();
    const id = window.setInterval(() => {
      const p = Math.min(100, ((Date.now() - t0) / 8000) * 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(id);
        setUploading(false);
        setDone(true);
      }
    }, 80);
  }, [uploading]);

  // Sección 2
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("000-000-0000");

  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    if (next.length > phone.length) {
      // todo lo nuevo se agrega SIEMPRE al final
      const added = next.length - phone.length;
      let typed = "";
      for (let i = 0; i < next.length; i++) {
        if (phone[i] !== next[i]) {
          typed = next.slice(i, i + added);
          break;
        }
      }
      setPhone(phone + typed);
    } else {
      setPhone(next);
    }
  };

  // Sección 3
  const [skillDraft, setSkillDraft] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [keys, setKeys] = useState(LETTERS);

  // Sección 4
  const [letter, setLetter] = useState("");
  const handleLetter = (v: string) => {
    let t = v;
    while (t.length > 50) t = t.slice(1);
    setLetter(t);
  };

  const clearAll = () => {
    setName("");
    setBirth("");
    setCountry("");
    setPhone("000-000-0000");
    setSkillDraft("");
    setSkills([]);
    setLetter("");
    setProgress(0);
    setDone(false);
  };

  return (
      <div
          style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              backgroundImage: `url(${fondoImg})`,
              backgroundRepeat: "repeat", // Hace que la imagen se repita
              backgroundSize: "auto", // Mantiene el tamaño original de la imagen
              backgroundAttachment: "fixed",
              minHeight: "100vh",
              color: "#444",
          }}
      >
        <MuteThief muted={muted} setMuted={setMuted} mouse={mouse} />
        <EvilSwarm mouse={mouse} />

        <header style={{ background: "#3B5570", color: "#D7DDE4", padding: "14px 20px" }}>
          <div style={{ fontSize: 18, fontWeight: "bold" }}>GlobalCorp Solutions S.A.</div>
          <div style={{ fontSize: 11, color: "#9FB0C2" }}>
            Portal Corporativo de Reclutamiento y Selección — Formulario 27-B/6
          </div>
        </header>

        <main style={{ maxWidth: 780, margin: "0 auto", padding: 20 }}>
          {/* Sección 1 */}
          <section style={PANEL}>
            <h2 style={H2}>1. Carga de Currículum</h2>
            <label htmlFor="cv" style={LABEL}>
              Adjunte su CV (formato PDF, máx. 2MB)
            </label>
            <input id="cv" type="file" style={{ display: "none" }} onChange={startFakeUpload} />
            <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("cv") as HTMLInputElement | null;
                  el?.click();
                  startFakeUpload();
                }}
                style={{
                  width: "100%",
                  padding: "34px 0",
                  fontSize: 22,
                  fontWeight: "bold",
                  background: "#1F6FB2",
                  color: "#fff",
                  border: "2px solid #14456F",
                  cursor: "pointer",
                }}
            >
              SUBIR CV EN PDF
            </button>

            {(uploading || done) && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ height: 18, background: "#E2E2E2", border: "1px solid #C0C0C0" }}>
                    <div style={{ height: "100%", width: `${progress}%`, background: "#1F6FB2" }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#A9A9A9", marginTop: 4 }}>
                    {Math.floor(progress)}% — Analizando documento con inteligencia artificial…
                  </div>
                </div>
            )}

            {done && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ color: "#2E7D32", fontSize: 14, fontWeight: "bold" }}>
                    ✔ CV procesado con IA
                  </div>
                  <div style={{ color: "#C62828", fontSize: 13, marginTop: 10 }}>
                    Error procesando el PDF. Por favor, ingrese toda su historia laboral manualmente.
                  </div>
                  <textarea
                      rows={6}
                      placeholder=""
                      style={{ ...INPUT, marginTop: 8, resize: "none" }}
                  />
                </div>
            )}
          </section>

          {/* Sección 2 */}
          <section style={PANEL}>
            <h2 style={H2}>2. Datos Personales</h2>

            <div style={{ marginBottom: 12 }}>
              <label style={LABEL}>Nombre completo</label>
              <input style={INPUT} value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={LABEL}>Fecha de nacimiento</label>
              <HostileDatePicker value={birth} onChange={setBirth} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={LABEL}>País de residencia (ordenado por PIB)</label>
              <select style={INPUT} value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="">-- Seleccione --</option>
                {COUNTRIES_BY_GDP.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                ))}
              </select>
            </div>

            <div>
              <label style={LABEL}>Teléfono de contacto</label>
              <input
                  style={INPUT}
                  value={phone}
                  onChange={handlePhone}
                  onClick={(e) => {
                    const el = e.currentTarget;
                    el.setSelectionRange(el.value.length, el.value.length);
                  }}
                  onFocus={(e) => {
                    const el = e.currentTarget;
                    el.setSelectionRange(el.value.length, el.value.length);
                  }}
              />
            </div>
          </section>

          {/* Sección 3 */}
          <section style={PANEL}>
            <h2 style={H2}>3. Habilidades</h2>
            <label style={LABEL}>Añadir habilidad</label>
            <input
                style={INPUT}
                value={skillDraft}
                onKeyDown={(e) => e.preventDefault()}
                onChange={() => undefined}
            />
            <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 4,
                  marginTop: 10,
                  background: "#EDEDED",
                  padding: 8,
                  border: "1px solid #D0D0D0",
                }}
            >
              {keys.map((k) => (
                  <button
                      key={k}
                      type="button"
                      onClick={() => {
                        setSkillDraft((s) => s + k);
                        setKeys((prev) => shuffle(prev));
                      }}
                      style={{
                        width: 34,
                        height: 30,
                        fontSize: 13,
                        background: "#FAFAFA",
                        border: "1px solid #B8B8B8",
                        cursor: "pointer",
                      }}
                  >
                    {k}
                  </button>
              ))}
              <button
                  type="button"
                  onClick={() => {
                    setSkillDraft((s) => s + " ");
                    setKeys((prev) => shuffle(prev));
                  }}
                  style={{ width: 70, height: 30, fontSize: 11, background: "#FAFAFA", border: "1px solid #B8B8B8", cursor: "pointer" }}
              >
                ESPACIO
              </button>
              <button
                  type="button"
                  onClick={() => {
                    setSkillDraft((s) => s.slice(0, -1));
                    setKeys((prev) => shuffle(prev));
                  }}
                  style={{ width: 70, height: 30, fontSize: 11, background: "#FAFAFA", border: "1px solid #B8B8B8", cursor: "pointer" }}
              >
                BORRAR
              </button>
              <button
                  type="button"
                  onClick={() => {
                    if (skillDraft.trim()) setSkills((s) => [...s, skillDraft.trim()]);
                    setSkillDraft("");
                    setKeys((prev) => shuffle(prev));
                  }}
                  style={{ width: 80, height: 30, fontSize: 11, background: "#FAFAFA", border: "1px solid #B8B8B8", cursor: "pointer" }}
              >
                AÑADIR
              </button>
            </div>
            {skills.length > 0 && (
                <ul style={{ fontSize: 12, color: "#555", marginTop: 8, paddingLeft: 18 }}>
                  {skills.map((s, i) => (
                      <li key={i}>{s}</li>
                  ))}
                </ul>
            )}
          </section>

          {/* Sección 4 */}
          <section style={PANEL}>
            <h2 style={H2}>4. Carta de Presentación</h2>
            <label style={LABEL}>Cuéntenos por qué desea trabajar con nosotros (máx. 50 caracteres)</label>
            <textarea
                rows={2}
                value={letter}
                onChange={(e) => handleLetter(e.target.value)}
                style={{
                  ...INPUT,
                  whiteSpace: "nowrap",
                  overflowX: "scroll",
                  overflowY: "hidden",
                  resize: "none",
                }}
            />
            <div style={{ fontSize: 11, color: "#A9A9A9", marginTop: 4 }}>
              {letter.length}/50 caracteres
            </div>
          </section>

          {/* Sección 5 */}
          <section style={{ ...PANEL, display: "flex", alignItems: "center", gap: 18 }}>
            <button
                type="button"
                onClick={clearAll}
                style={{
                  background: "#22C55E",
                  color: "#FFFFFF",
                  border: "3px solid #16A34A",
                  fontSize: 20,
                  fontWeight: "bold",
                  padding: "18px 28px",
                  cursor: "pointer",
                }}
            >
              Borrar todo el formulario
            </button>
            <button
                type="button"
                onClick={() => window.alert("Su solicitud ha sido enviada al vacío.")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#BFBFBF",
                  fontSize: 10,
                  cursor: "pointer",
                  padding: 0,
                }}
            >
              Enviar aplicación
            </button>
          </section>

          <footer style={{ fontSize: 10, color: "#BFBFBF", padding: "20px 0" }}>
            © GlobalCorp Solutions S.A. — Todos los derechos reservados. Formulario 27-B/6 rev. 14.
          </footer>
        </main>
      </div>
  );
}
export default AntiUXPortal;