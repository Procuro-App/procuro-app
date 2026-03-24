import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Chat() {
const [searchParams] = useSearchParams();
const navigate = useNavigate();

const conversacionId = searchParams.get("conversacion_id");

const [usuario, setUsuario] = useState(null);
const [mensajes, setMensajes] = useState([]);
const [mensaje, setMensaje] = useState("");
const [archivo, setArchivo] = useState(null);
const [cargando, setCargando] = useState(true);
const [enviando, setEnviando] = useState(false);

useEffect(() => {
iniciar();
}, []);

const iniciar = async () => {
const { data } = await supabase.auth.getUser();
setUsuario(data?.user || null);
await cargarMensajes();
};

const cargarMensajes = async () => {
try {
setCargando(true);

const { data, error } = await supabase
.from("mensajes")
.select("*")
.eq("conversacion_id", conversacionId)
.order("created_at", { ascending: true });

if (error) {
console.error(error);
return;
}

setMensajes(data || []);
} finally {
setCargando(false);
}
};

const subirArchivo = async (file) => {
if (!file || !usuario?.id) return null;

const extension = file.name.split(".").pop();
const nombre = `${usuario.id}/${Date.now()}-${Math.random()
.toString(36)
.slice(2)}.${extension}`;

const { error } = await supabase.storage
.from("chat-archivos")
.upload(nombre, file, {
cacheControl: "3600",
upsert: true,
});

if (error) {
console.error("Error subiendo archivo:", error);
return null;
}

const { data } = supabase.storage
.from("chat-archivos")
.getPublicUrl(nombre);

return {
url: data.publicUrl,
nombre: file.name,
};
};

const enviarMensaje = async () => {
if (!mensaje && !archivo) return;

try {
setEnviando(true);

let archivoData = null;

if (archivo) {
archivoData = await subirArchivo(archivo);
}

const { error } = await supabase.from("mensajes").insert([
{
conversacion_id: conversacionId,
remitente_email: usuario.email,
mensaje: mensaje || null,
archivo_url: archivoData?.url || null,
archivo_nombre: archivoData?.nombre || null,
},
]);

if (error) {
console.error(error);
return;
}

setMensaje("");
setArchivo(null);

await cargarMensajes();
} finally {
setEnviando(false);
}
};

const formatearFecha = (fecha) => {
return new Date(fecha).toLocaleString();
};

if (cargando) {
return <p>Cargando conversación...</p>;
}

return (
<div style={{ padding: "20px" }}>
<button
onClick={() => navigate(-1)}
style={{
marginBottom: "10px",
backgroundColor: "#e5e7eb",
border: "none",
padding: "8px 12px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold",
}}
>
← Volver
</button>

<h2>Chat</h2>

{/* MENSAJES */}
<div
style={{
border: "1px solid #ddd",
borderRadius: "10px",
padding: "15px",
height: "400px",
overflowY: "auto",
marginBottom: "15px",
backgroundColor: "#fafafa",
}}
>
{mensajes.length > 0 ? (
mensajes.map((m) => (
<div
key={m.id}
style={{
marginBottom: "12px",
textAlign:
m.remitente_email === usuario.email ? "right" : "left",
}}
>
<div
style={{
display: "inline-block",
backgroundColor:
m.remitente_email === usuario.email
? "#2563eb"
: "#e5e7eb",
color:
m.remitente_email === usuario.email ? "white" : "black",
padding: "10px",
borderRadius: "10px",
maxWidth: "70%",
}}
>
{m.mensaje && <p style={{ margin: 0 }}>{m.mensaje}</p>}

{m.archivo_url && (
<a
href={m.archivo_url}
target="_blank"
rel="noreferrer"
style={{
display: "block",
marginTop: "6px",
textDecoration: "underline",
color:
m.remitente_email === usuario.email
? "#dbeafe"
: "#2563eb",
}}
>
📎 {m.archivo_nombre || "Ver archivo"}
</a>
)}
</div>

<div style={{ fontSize: "11px", color: "#666" }}>
{formatearFecha(m.created_at)}
</div>
</div>
))
) : (
<p>No hay mensajes todavía.</p>
)}
</div>

{/* INPUT */}
<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
<textarea
placeholder="Escribe un mensaje..."
value={mensaje}
onChange={(e) => setMensaje(e.target.value)}
style={{
padding: "10px",
borderRadius: "8px",
border: "1px solid #ccc",
}}
/>

<input
type="file"
onChange={(e) => setArchivo(e.target.files?.[0] || null)}
/>

<button
onClick={enviarMensaje}
disabled={enviando}
style={{
backgroundColor: "#1f3552",
color: "white",
border: "none",
padding: "10px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold",
}}
>
{enviando ? "Enviando..." : "Enviar"}
</button>
</div>
</div>
);
}

export default Chat;