import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Chat() {
const [searchParams] = useSearchParams();
const navigate = useNavigate();

const [usuario, setUsuario] = useState(null);
const [rol, setRol] = useState("");
const [nombreUsuario, setNombreUsuario] = useState("");
const [conversaciones, setConversaciones] = useState([]);
const [conversacionActiva, setConversacionActiva] = useState(null);
const [mensajes, setMensajes] = useState([]);
const [nuevoMensaje, setNuevoMensaje] = useState("");
const [archivoAdjunto, setArchivoAdjunto] = useState(null);
const [cargando, setCargando] = useState(true);
const [enviando, setEnviando] = useState(false);

const proveedorIdParam = searchParams.get("proveedor_id") || "";
const proveedorEmailParam = searchParams.get("proveedor_email") || "";
const proveedorNombreParam = searchParams.get("proveedor_nombre") || "";
const requerimientoIdParam = searchParams.get("requerimiento_id") || "";
const requerimientoNombreParam = searchParams.get("requerimiento_nombre") || "";
const sectorParam = searchParams.get("sector") || "";
const categoriaParam = searchParams.get("categoria") || "";

const esMovil =
typeof window !== "undefined" ? window.innerWidth <= 768 : false;

const normalizarEmail = (valor) =>
String(valor || "").trim().toLowerCase();

const cardStyle = {
backgroundColor: "white",
borderRadius: "18px",
padding: esMovil ? "18px" : "24px",
boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
borderLeft: "6px solid #3b82f6",
borderRight: "6px solid #f59e0b",
};

const volverStyle = {
backgroundColor: "#e5e7eb",
color: "#1f3552",
border: "none",
padding: "10px 14px",
borderRadius: "10px",
fontWeight: "bold",
cursor: "pointer",
marginBottom: "16px",
};

useEffect(() => {
iniciar();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

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

if (!user?.email) return;

const nombre = await obtenerNombreUsuario(user, rolGuardado);
setNombreUsuario(nombre);

if (
rolGuardado === "comprador" &&
proveedorIdParam &&
proveedorEmailParam &&
requerimientoIdParam
) {
await abrirConversacionDesdeRequerimiento(user, nombre);
}

await cargarConversaciones(user, rolGuardado);
} catch (error) {
console.error("Error iniciando chat:", error);
} finally {
setCargando(false);
}
};

const obtenerNombreUsuario = async (user, rolGuardado) => {
try {
if (rolGuardado === "comprador") {
const { data, error } = await supabase
.from("compradores")
.select("auth_user_id, email, nombre");

if (error) {
console.error("Error cargando comprador actual:", error);
return user.email;
}

const compradorActual = (data || []).find(
(item) =>
item.auth_user_id === user.id ||
normalizarEmail(item.email) === normalizarEmail(user.email)
);

return compradorActual?.nombre || user.email;
}

if (rolGuardado === "proveedor") {
const { data, error } = await supabase
.from("proveedores")
.select("id, email, nombre, contacto");

if (error) {
console.error("Error cargando proveedor actual:", error);
return user.email;
}

const proveedorActual = (data || []).find(
(item) => normalizarEmail(item.email) === normalizarEmail(user.email)
);

return proveedorActual?.nombre || proveedorActual?.contacto || user.email;
}

return user.email;
} catch (error) {
console.error("Error obteniendo nombre de usuario:", error);
return user?.email || "";
}
};

const enriquecerConversaciones = async (lista) => {
try {
if (!lista || lista.length === 0) return [];

const proveedorIds = [
...new Set(lista.map((c) => c.proveedor_id).filter(Boolean)),
];
const compradorIds = [
...new Set(lista.map((c) => c.comprador_id).filter(Boolean)),
];

let mapaProveedores = {};
let mapaCompradores = {};

if (proveedorIds.length > 0) {
const { data, error } = await supabase
.from("proveedores")
.select("id, nombre, contacto, email")
.in("id", proveedorIds);

if (error) {
console.error("Error cargando proveedores para chat:", error);
} else {
mapaProveedores = (data || []).reduce((acc, item) => {
acc[item.id] = item;
return acc;
}, {});
}
}

if (compradorIds.length > 0) {
const { data, error } = await supabase
.from("compradores")
.select("auth_user_id, nombre, email")
.in("auth_user_id", compradorIds);

if (error) {
console.error("Error cargando compradores para chat:", error);
} else {
mapaCompradores = (data || []).reduce((acc, item) => {
acc[item.auth_user_id] = item;
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
comprador_nombre:
conv.comprador_nombre ||
mapaCompradores[conv.comprador_id]?.nombre ||
conv.comprador_email,
}));
} catch (error) {
console.error("Error enriqueciendo conversaciones:", error);
return lista;
}
};

const obtenerRequerimientoActual = async (requerimientoId) => {
try {
if (!requerimientoId) return null;

const { data, error } = await supabase
.from("requerimientos")
.select("*")
.eq("id", requerimientoId)
.maybeSingle();

if (error) {
console.error("Error cargando requerimiento:", error);
return null;
}

return data || null;
} catch (error) {
console.error("Error general cargando requerimiento:", error);
return null;
}
};

const cargarConversaciones = async (userParam, rolParam) => {
try {
const user = userParam || usuario;
const rolActual = rolParam || rol;

if (!user?.email) return;

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
return;
}

const enriquecidas = await enriquecerConversaciones(data || []);
setConversaciones(enriquecidas);

if (conversacionActiva?.id) return;

if (enriquecidas.length > 0) {
setConversacionActiva(enriquecidas[0]);
await cargarMensajes(enriquecidas[0].id);
} else {
setConversacionActiva(null);
setMensajes([]);
}
} catch (error) {
console.error("Error general cargando conversaciones:", error);
}
};

const cargarMensajes = async (conversacionId) => {
try {
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
return;
}

setMensajes([...(data || [])]);
} catch (error) {
console.error("Error general cargando mensajes:", error);
}
};

const abrirConversacionDesdeRequerimiento = async (user, nombreComprador) => {
try {
const requerimiento = await obtenerRequerimientoActual(requerimientoIdParam);

const { data: existente, error: errorBusqueda } = await supabase
.from("conversaciones")
.select("*")
.eq("comprador_email", user.email)
.eq("proveedor_email", proveedorEmailParam)
.eq("requerimiento_id", requerimientoIdParam)
.maybeSingle();

let conv = existente;

if (errorBusqueda) {
console.error("Error buscando conversación exacta:", errorBusqueda);
return;
}

if (!conv) {
const { data: nuevaConversacion, error: errorCreacion } = await supabase
.from("conversaciones")
.insert([
{
comprador_id: user.id,
comprador_email: user.email,
comprador_nombre: nombreComprador || user.email,
proveedor_email: proveedorEmailParam,
proveedor_nombre: proveedorNombreParam || proveedorEmailParam,
proveedor_id: proveedorIdParam,
requerimiento_id: requerimientoIdParam,
requerimiento_nombre:
requerimiento?.nombre_requerimiento || requerimientoNombreParam,
},
])
.select()
.single();

if (errorCreacion) {
console.error(
"Error creando conversación desde requerimiento:",
errorCreacion
);
return;
}

conv = nuevaConversacion;

const textoInicial = `Hola, comparto este requerimiento: ${
requerimiento?.nombre_requerimiento ||
requerimientoNombreParam ||
"Requerimiento"
}${
requerimiento?.descripcion
? `\n\nDetalle: ${requerimiento.descripcion}`
: ""
}`;

const { error: errorMensajeInicial } = await supabase
.from("mensajes")
.insert([
{
conversacion_id: conv.id,
remitente_email: user.email,
mensaje: textoInicial,
archivo_url: requerimiento?.archivo_url || null,
archivo_nombre: requerimiento?.archivo_nombre || null,
},
]);

if (errorMensajeInicial) {
console.error("Error creando mensaje inicial:", errorMensajeInicial);
}
}

const enriquecida = await enriquecerConversaciones([conv]);
const conversacionLista = enriquecida[0] || conv;

setConversacionActiva(conversacionLista);
await cargarMensajes(conversacionLista.id);
} catch (error) {
console.error("Error abriendo conversación desde requerimiento:", error);
}
};

const seleccionarConversacion = async (conversacion) => {
setConversacionActiva(conversacion);
setMensajes([]);
await cargarMensajes(conversacion.id);
};

const subirArchivoChat = async (archivo, conversacionId) => {
const extension = archivo.name.split(".").pop();
const nombreSeguro = `${conversacionId}-${Date.now()}-${Math.random()
.toString(36)
.slice(2)}.${extension}`;

const ruta = `conversaciones/${conversacionId}/${nombreSeguro}`;

const { error } = await supabase.storage
.from("chat-archivos")
.upload(ruta, archivo, {
cacheControl: "3600",
upsert: false,
});

if (error) {
console.error("Error subiendo archivo del chat:", error);
throw error;
}

const { data } = supabase.storage
.from("chat-archivos")
.getPublicUrl(ruta);

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
alert("No se pudo enviar el mensaje");
return;
}

setNuevoMensaje("");
setArchivoAdjunto(null);
await cargarMensajes(conversacionActiva.id);
await cargarConversaciones(usuario, rol);
} catch (error) {
console.error("Error general enviando mensaje:", error);
alert("Ocurrió un error al enviar el mensaje o archivo");
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
return (
conversacionActiva.comprador_nombre || conversacionActiva.comprador_email
);
}

return (
conversacionActiva.proveedor_nombre || conversacionActiva.proveedor_email
);
}, [conversacionActiva, rol]);

const tituloRequerimiento = useMemo(() => {
if (!conversacionActiva) return "";
return conversacionActiva.requerimiento_nombre || "";
}, [conversacionActiva]);

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
<h2 style={{ marginTop: 0, color: "#1f3552" }}>Chat</h2>
<p>Debes iniciar sesión para acceder a tus conversaciones.</p>
<Link
to="/acceso-comprador"
style={{
display: "inline-block",
marginTop: "12px",
background: "linear-gradient(135deg, #1f3552, #2563eb)",
color: "white",
textDecoration: "none",
padding: "12px 16px",
borderRadius: "10px",
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
<h2 style={{ marginTop: 0, color: "#1f3552" }}>Conversaciones</h2>
<p style={{ color: "#6b7280" }}>
{rol === "proveedor"
? "Aquí verás únicamente los chats que te hayan abierto compradores."
: "Aquí verás las conversaciones que hayas iniciado con proveedores."}
</p>

<div style={{ marginTop: "16px" }}>
{conversaciones.length === 0 ? (
<p style={{ color: "#6b7280" }}>Aún no tienes conversaciones.</p>
) : (
conversaciones.map((conv) => (
<button
key={conv.id}
onClick={() => seleccionarConversacion(conv)}
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
<strong style={{ display: "block", color: "#1f3552" }}>
{rol === "proveedor"
? conv.comprador_nombre || conv.comprador_email
: conv.proveedor_nombre || conv.proveedor_email}
</strong>

{conv.requerimiento_nombre ? (
<span
style={{
display: "block",
color: "#2563eb",
fontSize: "13px",
marginTop: "4px",
fontWeight: "600",
}}
>
Sobre: {conv.requerimiento_nombre}
</span>
) : null}

<span style={{ color: "#6b7280", fontSize: "13px" }}>
{new Date(conv.created_at).toLocaleString()}
</span>
</button>
))
)}
</div>
</div>

<div style={cardStyle}>
<h2 style={{ marginTop: 0, color: "#1f3552" }}>Chat</h2>

{conversaciones.length >= 1 && (
<div style={{ marginBottom: "14px" }}>
<label style={{ fontWeight: "bold", color: "#1f3552" }}>
Cambiar conversación
</label>

<select
value={conversacionActiva?.id || ""}
onChange={(e) => {
const conv = conversaciones.find(
(c) => String(c.id) === String(e.target.value)
);
if (conv) seleccionarConversacion(conv);
}}
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
? c.comprador_nombre || c.comprador_email
: c.proveedor_nombre || c.proveedor_email)}
</option>
))}
</select>
</div>
)}

<p style={{ color: "#6b7280", marginBottom: "8px" }}>
Chat con: <strong>{tituloConversacion}</strong>
</p>

{tituloRequerimiento ? (
<p
style={{
color: "#2563eb",
fontWeight: "600",
marginTop: 0,
marginBottom: "16px",
}}
>
Conversación sobre: {tituloRequerimiento}
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
{!conversacionActiva ? (
<p style={{ color: "#6b7280" }}>
Selecciona o inicia una conversación para empezar.
</p>
) : mensajes.length === 0 ? (
<p style={{ color: "#6b7280" }}>
Aún no hay mensajes en esta conversación.
</p>
) : (
mensajes.map((msg) => {
const esMio = msg.remitente_email === usuario.email;

return (
<div
key={msg.id}
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
background: esMio
? "linear-gradient(135deg, #1f3552, #2563eb)"
: "#e5e7eb",
color: esMio ? "white" : "#111827",
maxWidth: esMovil ? "90%" : "75%",
wordBreak: "break-word",
}}
>
{msg.mensaje ? <div>{msg.mensaje}</div> : null}

{msg.archivo_url ? (
<div style={{ marginTop: msg.mensaje ? "8px" : 0 }}>
<a
href={msg.archivo_url}
target="_blank"
rel="noreferrer"
style={{
color: esMio ? "white" : "#1d4ed8",
fontWeight: "bold",
textDecoration: "underline",
}}
>
{msg.archivo_nombre || "Ver archivo"}
</a>
</div>
) : null}
</div>
</div>
);
})
)}
</div>

<div
style={{
display: "flex",
flexDirection: esMovil ? "column" : "row",
gap: "10px",
marginBottom: "10px",
}}
>
<input
type="text"
value={nuevoMensaje}
onChange={(e) => setNuevoMensaje(e.target.value)}
placeholder="Escribe un mensaje..."
disabled={!conversacionActiva}
style={{
flex: 1,
minWidth: 0,
padding: "12px",
borderRadius: "10px",
border: "1px solid #d1d5db",
}}
/>

<button
onClick={enviarMensaje}
disabled={!conversacionActiva || enviando}
style={{
background: "linear-gradient(135deg, #1f3552, #2563eb)",
color: "white",
border: "none",
padding: "12px 18px",
borderRadius: "10px",
fontWeight: "bold",
cursor: "pointer",
opacity: !conversacionActiva || enviando ? 0.7 : 1,
}}
>
{enviando ? "Enviando..." : "Enviar"}
</button>
</div>

<div>
<input
type="file"
onChange={(e) => setArchivoAdjunto(e.target.files?.[0] || null)}
disabled={!conversacionActiva}
style={{ marginBottom: "8px" }}
/>

{archivoAdjunto ? (
<p style={{ margin: 0, color: "#6b7280" }}>
Archivo seleccionado: <strong>{archivoAdjunto.name}</strong>
</p>
) : null}
</div>
</div>
</div>
</div>
);
}

export default Chat;