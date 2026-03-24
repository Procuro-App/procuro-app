import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Chat() {
const navigate = useNavigate();
const [searchParams] = useSearchParams();
const mensajesEndRef = useRef(null);

const [usuario, setUsuario] = useState(null);
const [rol, setRol] = useState("");
const [conversaciones, setConversaciones] = useState([]);
const [conversacionActiva, setConversacionActiva] = useState(null);
const [mensajes, setMensajes] = useState([]);
const [nuevoMensaje, setNuevoMensaje] = useState("");
const [archivoAdjunto, setArchivoAdjunto] = useState(null);
const [cargando, setCargando] = useState(true);
const [enviando, setEnviando] = useState(false);

const conversacionIdParam = searchParams.get("conversacion_id") || "";
const requerimientoIdParam = searchParams.get("requerimiento_id") || "";
const requerimientoNombreParam =
searchParams.get("requerimiento_nombre") || "";
const proveedorEmailParam = searchParams.get("proveedor_email") || "";
const proveedorNombreParam = searchParams.get("proveedor_nombre") || "";
const sectorParam = searchParams.get("sector") || "";
const categoriaParam = searchParams.get("categoria") || "";

const esMovil =
typeof window !== "undefined" ? window.innerWidth <= 768 : false;

const normalizar = (valor) => String(valor || "").trim().toLowerCase();
const mismoId = (a, b) => String(a || "") === String(b || "");

useEffect(() => {
iniciar();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchParams.toString()]);

useEffect(() => {
mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [mensajes]);

const iniciar = async () => {
try {
setCargando(true);

const rolGuardado = localStorage.getItem("rol") || "";
setRol(rolGuardado);

const { data, error } = await supabase.auth.getUser();

if (error) {
console.error("Error obteniendo usuario autenticado:", error);
return;
}

const user = data?.user || null;
setUsuario(user);

if (!user?.email) {
setConversaciones([]);
setConversacionActiva(null);
setMensajes([]);
return;
}

const lista = await cargarConversaciones(user, rolGuardado);

if (conversacionIdParam) {
const exacta = (lista || []).find((c) =>
mismoId(c.id, conversacionIdParam)
);

if (exacta) {
setConversacionActiva(exacta);
await cargarMensajes(exacta.id);
return;
}
}

if (lista.length > 0) {
setConversacionActiva(lista[0]);
await cargarMensajes(lista[0].id);
} else {
setConversacionActiva(null);
setMensajes([]);
}
} catch (err) {
console.error("Error iniciando chat:", err);
} finally {
setCargando(false);
}
};

const enriquecerConversaciones = async (lista) => {
try {
if (!lista || lista.length === 0) return [];

const proveedorIds = [
...new Set(lista.map((c) => c.proveedor_id).filter(Boolean)),
];

let mapaProveedores = {};

if (proveedorIds.length > 0) {
const { data, error } = await supabase
.from("proveedores")
.select("id, nombre, contacto, email")
.in("id", proveedorIds);

if (!error) {
mapaProveedores = (data || []).reduce((acc, item) => {
acc[item.id] = item;
return acc;
}, {});
}
}

return lista.map((conv) => ({
...conv,
proveedor_nombre:
conv.proveedor_nombre ||
mapaProveedores[conv.proveedor_id]?.nombre ||
mapaProveedores[conv.proveedor_id]?.contacto ||
conv.proveedor_email,
}));
} catch (error) {
console.error("Error enriqueciendo conversaciones:", error);
return lista;
}
};

const cargarConversaciones = async (user, rolActual) => {
try {
let query = supabase
.from("conversaciones")
.select("*")
.order("created_at", { ascending: false });

if (rolActual === "proveedor") {
query = query.eq("proveedor_email", user.email);
} else {
query = query.eq("comprador_email", user.email);
}

const { data, error } = await query;

if (error) {
console.error("Error cargando conversaciones:", error);
setConversaciones([]);
return [];
}

const enriquecidas = await enriquecerConversaciones(data || []);
setConversaciones(enriquecidas);
return enriquecidas;
} catch (err) {
console.error("Error general cargando conversaciones:", err);
setConversaciones([]);
return [];
}
};

const cargarMensajes = async (conversacionId) => {
if (!conversacionId) {
setMensajes([]);
return;
}

const { data, error } = await supabase
.from("mensajes")
.select("*")
.eq("conversacion_id", conversacionId)
.order("created_at", { ascending: true });

if (error) {
console.error("Error cargando mensajes:", error);
setMensajes([]);
return;
}

setMensajes(data || []);
};

const seleccionarConversacion = async (id) => {
const conv = conversaciones.find((c) => mismoId(c.id, id));
if (!conv) return;

setConversacionActiva(conv);
await cargarMensajes(conv.id);
};

const subirArchivoChat = async (archivo, conversacionId) => {
const extension = archivo.name.includes(".")
? archivo.name.split(".").pop()
: "file";

const nombreSeguro = `${conversacionId}/${Date.now()}-${Math.random()
.toString(36)
.slice(2)}.${extension}`;

const { error } = await supabase.storage
.from("chat-archivos")
.upload(nombreSeguro, archivo, {
cacheControl: "3600",
upsert: false,
});

if (error) {
console.error("Error subiendo archivo del chat:", error);
throw new Error(error.message || "No fue posible subir el archivo");
}

const { data } = supabase.storage
.from("chat-archivos")
.getPublicUrl(nombreSeguro);

return {
archivo_url: data?.publicUrl || "",
archivo_nombre: archivo.name,
};
};

const enviarMensaje = async () => {
const texto = nuevoMensaje.trim();

if (!texto && !archivoAdjunto) return;
if (!conversacionActiva?.id || !usuario?.email) return;

try {
setEnviando(true);

let archivoPayload = {
archivo_url: null,
archivo_nombre: null,
};

if (archivoAdjunto) {
archivoPayload = await subirArchivoChat(
archivoAdjunto,
conversacionActiva.id
);
}

const { error } = await supabase.from("mensajes").insert([
{
conversacion_id: conversacionActiva.id,
remitente_email: usuario.email,
mensaje: texto || (archivoAdjunto ? "Adjunto enviado" : ""),
archivo_url: archivoPayload.archivo_url,
archivo_nombre: archivoPayload.archivo_nombre,
},
]);

if (error) {
console.error("Error enviando mensaje:", error);
alert("No se pudo enviar el mensaje.");
return;
}

setNuevoMensaje("");
setArchivoAdjunto(null);
await cargarMensajes(conversacionActiva.id);
} catch (err) {
console.error("Error general enviando mensaje:", err);
alert(
`Ocurrió un error al enviar el mensaje: ${
err.message || "desconocido"
}`
);
} finally {
setEnviando(false);
}
};

const volverAContexto = () => {
if (rol === "comprador" && requerimientoIdParam) {
const params = new URLSearchParams();
params.set("requerimiento_id", requerimientoIdParam);
if (requerimientoNombreParam) {
params.set("requerimiento_nombre", requerimientoNombreParam);
}
if (sectorParam) {
params.set("sector", sectorParam);
}
if (categoriaParam) {
params.set("categoria", categoriaParam);
}

navigate(`/proveedores?${params.toString()}`);
return;
}

if (rol === "proveedor") {
navigate("/panel-proveedor");
return;
}

navigate("/panel-comprador");
};

const textoBotonVolver =
rol === "comprador" && requerimientoIdParam
? "← Volver a proveedores"
: rol === "proveedor"
? "← Volver al panel proveedor"
: "← Volver al panel comprador";

const tituloConversacion = useMemo(() => {
if (!conversacionActiva) return "Sin conversación activa";

if (rol === "proveedor") {
return conversacionActiva.comprador_email || "Comprador";
}

return (
conversacionActiva.proveedor_nombre ||
proveedorNombreParam ||
conversacionActiva.proveedor_email ||
proveedorEmailParam ||
"Proveedor"
);
}, [conversacionActiva, rol, proveedorNombreParam, proveedorEmailParam]);

const tituloRequerimiento = useMemo(() => {
if (!conversacionActiva) return requerimientoNombreParam || "";
return (
conversacionActiva.requerimiento_nombre || requerimientoNombreParam || ""
);
}, [conversacionActiva, requerimientoNombreParam]);

const cardStyle = {
backgroundColor: "white",
borderRadius: "16px",
padding: esMovil ? "18px" : "24px",
boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
};

if (cargando) {
return (
<div style={cardStyle}>
<button onClick={volverAContexto} style={volverStyle}>
{textoBotonVolver}
</button>
<p>Cargando chat...</p>
</div>
);
}

if (!usuario) {
return (
<div style={cardStyle}>
<button onClick={volverAContexto} style={volverStyle}>
{textoBotonVolver}
</button>
<h2 style={{ marginTop: 0 }}>Chat</h2>
<p>Debes iniciar sesión para acceder a tus conversaciones.</p>
<Link
to="/acceso-comprador"
style={{
display: "inline-block",
marginTop: "12px",
backgroundColor: "#1f3552",
color: "white",
textDecoration: "none",
padding: "10px 14px",
borderRadius: "8px",
fontWeight: "bold",
}}
>
Ir al acceso
</Link>
</div>
);
}

return (
<div>
<button onClick={volverAContexto} style={volverStyle}>
{textoBotonVolver}
</button>

<div
style={{
display: "grid",
gridTemplateColumns: esMovil ? "1fr" : "320px 1fr",
gap: "18px",
}}
>
<div style={cardStyle}>
<h2 style={{ marginTop: 0 }}>Conversaciones</h2>
<p style={{ color: "#6b7280" }}>
{rol === "proveedor"
? "Aquí verás las conversaciones recibidas."
: "Aquí verás las conversaciones iniciadas con proveedores."}
</p>

<div style={{ marginTop: "14px" }}>
{conversaciones.length === 0 ? (
<p style={{ color: "#6b7280" }}>Aún no tienes conversaciones.</p>
) : (
conversaciones.map((conv) => (
<button
key={conv.id}
onClick={() => seleccionarConversacion(conv.id)}
style={{
width: "100%",
textAlign: "left",
padding: "12px",
marginBottom: "10px",
borderRadius: "10px",
border:
conversacionActiva?.id === conv.id
? "2px solid #2563eb"
: "1px solid #d1d5db",
backgroundColor:
conversacionActiva?.id === conv.id ? "#eff6ff" : "white",
cursor: "pointer",
}}
>
<strong style={{ display: "block" }}>
{rol === "proveedor"
? conv.comprador_email || "Comprador"
: conv.proveedor_nombre ||
conv.proveedor_email ||
"Proveedor"}
</strong>

<span
style={{
display: "block",
color: "#2563eb",
fontSize: "13px",
marginTop: "4px",
fontWeight: "600",
}}
>
{conv.requerimiento_nombre || "Sin requerimiento"}
</span>

<span style={{ color: "#6b7280", fontSize: "13px" }}>
{conv.created_at
? new Date(conv.created_at).toLocaleString()
: ""}
</span>
</button>
))
)}
</div>
</div>

<div style={cardStyle}>
<h2 style={{ marginTop: 0 }}>Chat</h2>

{conversaciones.length > 0 ? (
<div style={{ marginBottom: "14px" }}>
<label style={{ fontWeight: "bold" }}>Cambiar conversación</label>

<select
value={conversacionActiva?.id || ""}
onChange={(e) => seleccionarConversacion(e.target.value)}
style={{
width: "100%",
padding: "10px",
borderRadius: "10px",
border: "1px solid #ccc",
marginTop: "6px",
}}
>
{conversaciones.map((c) => (
<option key={c.id} value={c.id}>
{(c.requerimiento_nombre || "Sin requerimiento") +
" - " +
(rol === "proveedor"
? c.comprador_email || "Comprador"
: c.proveedor_nombre ||
c.proveedor_email ||
"Proveedor")}
</option>
))}
</select>
</div>
) : null}

<p style={{ marginBottom: "6px", color: "#6b7280" }}>
Chat con: <strong>{tituloConversacion}</strong>
</p>

{tituloRequerimiento ? (
<p style={{ marginTop: 0, marginBottom: "16px", color: "#2563eb" }}>
Conversación sobre: <strong>{tituloRequerimiento}</strong>
</p>
) : null}

<div
style={{
border: "1px solid #d1d5db",
borderRadius: "12px",
height: esMovil ? "320px" : "420px",
overflowY: "auto",
padding: "12px",
marginBottom: "14px",
backgroundColor: "#f9fafb",
}}
>
{mensajes.length === 0 ? (
<p style={{ color: "#6b7280" }}>
No hay mensajes en esta conversación.
</p>
) : (
mensajes.map((m) => {
const esMio =
normalizar(m.remitente_email) === normalizar(usuario?.email);

return (
<div
key={m.id}
style={{
textAlign: esMio ? "right" : "left",
marginBottom: "10px",
}}
>
<div
style={{
display: "inline-block",
padding: "10px 14px",
borderRadius: "12px",
backgroundColor: esMio ? "#1f3552" : "#e5e7eb",
color: esMio ? "white" : "#111827",
maxWidth: esMovil ? "92%" : "75%",
wordBreak: "break-word",
}}
>
{m.mensaje ? <div>{m.mensaje}</div> : null}

{m.archivo_url ? (
<div style={{ marginTop: "8px" }}>
<a
href={m.archivo_url}
target="_blank"
rel="noreferrer"
style={{
color: esMio ? "white" : "#1d4ed8",
textDecoration: "underline",
fontWeight: "bold",
}}
>
{m.archivo_nombre || "Ver archivo"}
</a>
</div>
) : null}
</div>

<div
style={{
fontSize: "11px",
color: "#6b7280",
marginTop: "4px",
}}
>
{m.created_at
? new Date(m.created_at).toLocaleString()
: ""}
</div>
</div>
);
})
)}
<div ref={mensajesEndRef} />
</div>

<textarea
value={nuevoMensaje}
onChange={(e) => setNuevoMensaje(e.target.value)}
placeholder="Escribe un mensaje..."
style={{
width: "100%",
minHeight: "80px",
padding: "10px",
borderRadius: "10px",
border: "1px solid #ccc",
marginBottom: "10px",
resize: "vertical",
}}
/>

<div style={{ marginBottom: "10px" }}>
<input
type="file"
onChange={(e) => setArchivoAdjunto(e.target.files?.[0] || null)}
disabled={!conversacionActiva}
/>
{archivoAdjunto ? (
<p style={{ margin: "6px 0 0 0", color: "#6b7280" }}>
Archivo seleccionado: <strong>{archivoAdjunto.name}</strong>
</p>
) : null}
</div>

<button
onClick={enviarMensaje}
disabled={enviando || !conversacionActiva}
style={{
backgroundColor: "#1f3552",
color: "white",
border: "none",
padding: "10px 14px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold",
width: "100%",
}}
>
{enviando ? "Enviando..." : "Enviar"}
</button>
</div>
</div>
</div>
);
}

const volverStyle = {
marginBottom: "16px",
backgroundColor: "#e5e7eb",
border: "none",
padding: "8px 12px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold",
};

export default Chat;