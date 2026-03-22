import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Chat() {
const [searchParams] = useSearchParams();
const navigate = useNavigate();

const [usuario, setUsuario] = useState(null);
const [rol, setRol] = useState("");
const [conversaciones, setConversaciones] = useState([]);
const [conversacionActiva, setConversacionActiva] = useState(null);
const [mensajes, setMensajes] = useState([]);
const [nuevoMensaje, setNuevoMensaje] = useState("");
const [archivoAdjunto, setArchivoAdjunto] = useState(null);
const [cargando, setCargando] = useState(true);
const [enviando, setEnviando] = useState(false);

const proveedorIdParam = searchParams.get("proveedor_id");
const proveedorEmailParam = searchParams.get("proveedor_email");
const proveedorNombreParam = searchParams.get("proveedor_nombre");
const requerimientoIdParam = searchParams.get("requerimiento_id");
const requerimientoNombreParam = searchParams.get("requerimiento_nombre");

const esMovil =
typeof window !== "undefined" ? window.innerWidth <= 768 : false;

useEffect(() => {
iniciar();
}, []);

useEffect(() => {
if (usuario?.email) {
cargarConversaciones();
}
}, [usuario]);

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

setUsuario(data?.user || null);
} catch (error) {
console.error("Error iniciando chat:", error);
} finally {
setCargando(false);
}
};

const enriquecerConversacionesConNombres = async (lista) => {
try {
if (!lista || lista.length === 0) return [];

const proveedorIds = [
...new Set(lista.map((c) => c.proveedor_id).filter(Boolean)),
];

const compradorEmails = [
...new Set(lista.map((c) => c.comprador_email).filter(Boolean)),
];

let mapaProveedores = {};
let mapaCompradores = {};

if (proveedorIds.length > 0) {
const { data: proveedoresData, error: proveedoresError } = await supabase
.from("proveedores")
.select("id, nombre, email, contacto")
.in("id", proveedorIds);

if (proveedoresError) {
console.error("Error cargando nombres de proveedores:", proveedoresError);
} else {
mapaProveedores = (proveedoresData || []).reduce((acc, item) => {
acc[item.id] = item;
return acc;
}, {});
}
}

if (compradorEmails.length > 0) {
const { data: compradoresData, error: compradoresError } = await supabase
.from("compradores")
.select("email, nombre, contacto")
.in("email", compradorEmails);

if (compradoresError) {
console.error("Error cargando nombres de compradores:", compradoresError);
} else {
mapaCompradores = (compradoresData || []).reduce((acc, item) => {
acc[item.email] = item;
return acc;
}, {});
}
}

return lista.map((conv) => {
const proveedorInfo = mapaProveedores[conv.proveedor_id];
const compradorInfo = mapaCompradores[conv.comprador_email];

return {
...conv,
proveedor_nombre:
proveedorInfo?.nombre ||
proveedorInfo?.contacto ||
conv.proveedor_email,
comprador_nombre:
compradorInfo?.nombre ||
compradorInfo?.contacto ||
conv.comprador_email,
};
});
} catch (error) {
console.error("Error enriqueciendo conversaciones:", error);
return lista;
}
};

const cargarConversaciones = async () => {
try {
if (!usuario?.email) return;

const rolGuardado = localStorage.getItem("rol") || "";
setRol(rolGuardado);

let query = supabase
.from("conversaciones")
.select("*")
.order("created_at", { ascending: false });

if (rolGuardado === "proveedor") {
query = query.eq("proveedor_email", usuario.email);
} else {
query = query.eq("comprador_email", usuario.email);
}

const { data, error } = await query;

if (error) {
console.error("Error cargando conversaciones:", error);
return;
}

const conversacionesEnriquecidas = await enriquecerConversacionesConNombres(
data || []
);

setConversaciones(conversacionesEnriquecidas);

if (
rolGuardado === "comprador" &&
proveedorEmailParam &&
proveedorIdParam
) {
const existente = conversacionesEnriquecidas.find(
(c) =>
c.comprador_email === usuario.email &&
c.proveedor_email === proveedorEmailParam
);

if (existente) {
setConversacionActiva(existente);
await cargarMensajes(existente.id);
return;
}

setConversacionActiva({
id: null,
comprador_email: usuario.email,
proveedor_email: proveedorEmailParam,
proveedor_id: proveedorIdParam,
proveedor_nombre: proveedorNombreParam || proveedorEmailParam,
comprador_nombre: usuario.email,
requerimiento_id: requerimientoIdParam || null,
requerimiento_nombre: requerimientoNombreParam || null,
creada_virtualmente: true,
});
setMensajes([]);
return;
}

if (conversacionesEnriquecidas.length > 0) {
setConversacionActiva(conversacionesEnriquecidas[0]);
await cargarMensajes(conversacionesEnriquecidas[0].id);
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

setMensajes(data || []);
} catch (error) {
console.error("Error general cargando mensajes:", error);
}
};

const seleccionarConversacion = async (conversacion) => {
setConversacionActiva(conversacion);
await cargarMensajes(conversacion.id);
};

const crearOReutilizarConversacionSiHaceFalta = async () => {
if (!usuario?.email || !conversacionActiva) return null;

if (conversacionActiva.id) {
return conversacionActiva.id;
}

const { data: existente, error: errorBusqueda } = await supabase
.from("conversaciones")
.select("*")
.eq("comprador_email", usuario.email)
.eq("proveedor_email", conversacionActiva.proveedor_email)
.maybeSingle();

if (errorBusqueda) {
console.error("Error buscando conversación existente:", errorBusqueda);
return null;
}

if (existente) {
const conversacionesActualizadas = await enriquecerConversacionesConNombres(
[existente, ...conversaciones.filter((c) => c.id !== existente.id)]
);

setConversaciones(conversacionesActualizadas);
const activa =
conversacionesActualizadas.find((c) => c.id === existente.id) || existente;
setConversacionActiva(activa);
return existente.id;
}

const { data: nuevaConversacion, error: errorCreacion } = await supabase
.from("conversaciones")
.insert([
{
comprador_email: usuario.email,
proveedor_email: conversacionActiva.proveedor_email,
proveedor_id: conversacionActiva.proveedor_id,
requerimiento_id: conversacionActiva.requerimiento_id || null,
requerimiento_nombre: conversacionActiva.requerimiento_nombre || null,
},
])
.select()
.single();

if (errorCreacion) {
console.error("Error creando conversación:", errorCreacion);

const { data: reconsulta, error: errorReconsulta } = await supabase
.from("conversaciones")
.select("*")
.eq("comprador_email", usuario.email)
.eq("proveedor_email", conversacionActiva.proveedor_email)
.maybeSingle();

if (errorReconsulta || !reconsulta) {
console.error("Error reconsultando conversación:", errorReconsulta);
return null;
}

const conversacionesActualizadas = await enriquecerConversacionesConNombres(
[reconsulta, ...conversaciones.filter((c) => c.id !== reconsulta.id)]
);

setConversaciones(conversacionesActualizadas);
const activa =
conversacionesActualizadas.find((c) => c.id === reconsulta.id) || reconsulta;
setConversacionActiva(activa);
return reconsulta.id;
}

const conversacionesActualizadas = await enriquecerConversacionesConNombres(
[nuevaConversacion, ...conversaciones]
);

setConversaciones(conversacionesActualizadas);
const activa =
conversacionesActualizadas.find((c) => c.id === nuevaConversacion.id) ||
nuevaConversacion;
setConversacionActiva(activa);

return nuevaConversacion.id;
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

const { data } = supabase.storage.from("chat-archivos").getPublicUrl(ruta);

return {
archivo_url: data?.publicUrl || "",
archivo_nombre: archivo.name,
};
};

const enviarMensaje = async () => {
const texto = nuevoMensaje.trim();

if (!texto && !archivoAdjunto) {
return;
}

if (!conversacionActiva || !usuario?.email) return;

try {
setEnviando(true);

const conversacionId = await crearOReutilizarConversacionSiHaceFalta();

if (!conversacionId) {
alert("No se pudo crear o recuperar la conversación");
return;
}

let archivoPayload = {
archivo_url: null,
archivo_nombre: null,
};

if (archivoAdjunto) {
archivoPayload = await subirArchivoChat(archivoAdjunto, conversacionId);
}

const { error } = await supabase.from("mensajes").insert([
{
conversacion_id: conversacionId,
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
await cargarMensajes(conversacionId);
await cargarConversaciones();
} catch (error) {
console.error("Error general enviando mensaje:", error);
alert("Ocurrió un error al enviar el mensaje o archivo");
} finally {
setEnviando(false);
}
};

const volverAlPanel = () => {
if (rol === "proveedor") {
navigate("/panel-proveedor");
return;
}

navigate("/panel-comprador");
};

const textoBotonVolver =
rol === "proveedor"
? "← Volver al panel proveedor"
: "← Volver al panel comprador";

const tituloConversacion = useMemo(() => {
if (!conversacionActiva) return "Sin conversación activa";

if (rol === "proveedor") {
return conversacionActiva.comprador_nombre || conversacionActiva.comprador_email;
}

return (
proveedorNombreParam ||
conversacionActiva.proveedor_nombre ||
conversacionActiva.proveedor_email
);
}, [conversacionActiva, rol, proveedorNombreParam]);

const tituloRequerimiento = useMemo(() => {
if (!conversacionActiva) return "";

return (
conversacionActiva.requerimiento_nombre ||
requerimientoNombreParam ||
""
);
}, [conversacionActiva, requerimientoNombreParam]);

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

if (cargando) {
return (
<div style={cardStyle}>
<button onClick={volverAlPanel} style={volverStyle}>
{textoBotonVolver}
</button>
<p>Cargando chat...</p>
</div>
);
}

if (!usuario) {
return (
<div style={cardStyle}>
<button onClick={volverAlPanel} style={volverStyle}>
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
<button onClick={volverAlPanel} style={volverStyle}>
{textoBotonVolver}
</button>

<div
style={{
display: "grid",
gridTemplateColumns: esMovil ? "1fr" : "300px 1fr",
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
<p style={{ color: "#6b7280", marginBottom: "8px" }}>
Chat con: <strong>{tituloConversacion}</strong>
</p>

{tituloRequerimiento ? (
<p style={{ color: "#2563eb", fontWeight: "600", marginTop: 0, marginBottom: "16px" }}>
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