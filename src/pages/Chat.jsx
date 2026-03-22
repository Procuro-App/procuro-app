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
const [cargando, setCargando] = useState(true);
const [enviando, setEnviando] = useState(false);

const proveedorIdParam = searchParams.get("proveedor_id");
const proveedorEmailParam = searchParams.get("proveedor_email");
const proveedorNombreParam = searchParams.get("proveedor_nombre");

const esMovil =
typeof window !== "undefined" ? window.innerWidth <= 768 : false;

useEffect(() => {
iniciar();
}, []);

useEffect(() => {
if (usuario?.email) {
cargarConversaciones();
}
}, [usuario, proveedorEmailParam, proveedorIdParam]);

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

let conversacionesData = data || [];

if (
rolGuardado === "comprador" &&
proveedorEmailParam &&
proveedorIdParam
) {
let conversacionExistente = conversacionesData.find(
(c) =>
c.comprador_email === usuario.email &&
c.proveedor_email === proveedorEmailParam
);

if (!conversacionExistente) {
const { data: nuevaConversacion, error: errorNuevaConversacion } =
await supabase
.from("conversaciones")
.insert([
{
comprador_email: usuario.email,
proveedor_email: proveedorEmailParam,
proveedor_id: proveedorIdParam,
},
])
.select()
.single();

if (errorNuevaConversacion) {
console.error("Error creando conversación:", errorNuevaConversacion);

const { data: reconsulta, error: errorReconsulta } = await supabase
.from("conversaciones")
.select("*")
.eq("comprador_email", usuario.email)
.eq("proveedor_email", proveedorEmailParam)
.maybeSingle();

if (!errorReconsulta && reconsulta) {
conversacionExistente = reconsulta;
}
} else if (nuevaConversacion) {
conversacionesData = [nuevaConversacion, ...conversacionesData];
conversacionExistente = nuevaConversacion;
}
}

const conversacionesEnriquecidas =
await enriquecerConversacionesConNombres(conversacionesData);

setConversaciones(conversacionesEnriquecidas);

if (conversacionExistente) {
const activaEnriquecida =
conversacionesEnriquecidas.find(
(c) => c.id === conversacionExistente.id
) || conversacionExistente;

setConversacionActiva(activaEnriquecida);
await cargarMensajes(conversacionExistente.id);
return;
}
}

const conversacionesEnriquecidas =
await enriquecerConversacionesConNombres(conversacionesData);

setConversaciones(conversacionesEnriquecidas);

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

const enviarMensaje = async () => {
if (!nuevoMensaje.trim() || !conversacionActiva || !usuario?.email) return;

try {
setEnviando(true);

const { error } = await supabase.from("mensajes").insert([
{
conversacion_id: conversacionActiva.id,
remitente_email: usuario.email,
mensaje: nuevoMensaje.trim(),
},
]);

if (error) {
console.error("Error enviando mensaje:", error);
alert("No se pudo enviar el mensaje");
return;
}

setNuevoMensaje("");
await cargarMensajes(conversacionActiva.id);
} catch (error) {
console.error("Error general enviando mensaje:", error);
alert("Ocurrió un error al enviar el mensaje");
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
<p style={{ color: "#6b7280", marginBottom: "16px" }}>
Chat con: <strong>{tituloConversacion}</strong>
</p>

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
<span
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
{msg.mensaje}
</span>
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
</div>
</div>
</div>
);
}

export default Chat;