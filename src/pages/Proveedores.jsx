import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Proveedores() {
const navigate = useNavigate();
const location = useLocation();
const [searchParams] = useSearchParams();

const [proveedores, setProveedores] = useState([]);
const [cotizacionesRecibidas, setCotizacionesRecibidas] = useState([]);
const [cargando, setCargando] = useState(true);
const [busqueda, setBusqueda] = useState("");
const [abriendoChatId, setAbriendoChatId] = useState("");
const [solicitandoCotizacionId, setSolicitandoCotizacionId] = useState("");

const requerimientoId = searchParams.get("requerimiento_id") || "";
const requerimientoNombre = searchParams.get("requerimiento_nombre") || "";
const sectorDesdeRequerimiento = searchParams.get("sector") || "";
const categoriaDesdeRequerimiento = searchParams.get("categoria") || "";

useEffect(() => {
cargarTodo();
}, [requerimientoId]);

const cargarTodo = async () => {
try {
setCargando(true);
await Promise.all([cargarProveedores(), cargarCotizacionesRecibidas()]);
} finally {
setCargando(false);
}
};

const cargarProveedores = async () => {
try {
const { data, error } = await supabase
.from("proveedores")
.select("*")
.order("created_at", { ascending: false });

if (error) {
console.error("Error cargando proveedores:", error);
setProveedores([]);
return;
}

setProveedores(data || []);
} catch (error) {
console.error("Error general cargando proveedores:", error);
setProveedores([]);
}
};

const cargarCotizacionesRecibidas = async () => {
try {
if (!requerimientoId) {
setCotizacionesRecibidas([]);
return;
}

const { data, error } = await supabase
.from("cotizaciones")
.select("*")
.eq("requerimiento_id", requerimientoId)
.order("created_at", { ascending: false });

if (error) {
console.error("Error cargando cotizaciones recibidas:", error);
setCotizacionesRecibidas([]);
return;
}

setCotizacionesRecibidas(data || []);
} catch (error) {
console.error("Error general cargando cotizaciones:", error);
setCotizacionesRecibidas([]);
}
};

const textoSeguro = (valor) => String(valor || "").trim().toLowerCase();

const obtenerTextoPlan = (plan) => {
const planTexto = textoSeguro(plan);

if (planTexto === "premium") {
return "Alta visibilidad y prioridad en resultados.";
}

if (planTexto === "pro") {
return "Mejor posicionamiento frente a proveedores gratuitos.";
}

return "Visibilidad básica dentro del directorio.";
};

const cotizacionYaRecibida = (proveedor) => {
return cotizacionesRecibidas.some((c) => {
const mismoProveedorPorNombre =
textoSeguro(c.proveedor_nombre) === textoSeguro(proveedor.nombre);

const mismoProveedorPorEmail =
textoSeguro(c.email) === textoSeguro(proveedor.email);

return mismoProveedorPorNombre || mismoProveedorPorEmail;
});
};

const proveedoresFiltrados = useMemo(() => {
let lista = [...proveedores];

lista = lista.filter((p) => {
const estado = textoSeguro(p.estado);
const verificado = p.verificado;

if (!p.estado && verificado === undefined) return true;
if (estado && estado !== "aprobado") return false;
if (verificado === false) return false;

return true;
});

if (sectorDesdeRequerimiento) {
lista = lista.filter(
(p) => textoSeguro(p.sector) === textoSeguro(sectorDesdeRequerimiento)
);
}

if (busqueda.trim()) {
const q = textoSeguro(busqueda);

lista = lista.filter((p) => {
const campos = [
p.nombre,
p.descripcion,
p.sector,
p.categoria,
p.cobertura,
p.pais,
p.provincia,
p.ciudad,
p.contacto,
p.email,
p.telefono,
]
.map((x) => textoSeguro(x))
.join(" ");

return campos.includes(q);
});
}

const prioridadPlan = {
premium: 1,
pro: 2,
gratis: 3,
free: 3,
};

lista.sort((a, b) => {
const planA = prioridadPlan[textoSeguro(a.plan)] || 99;
const planB = prioridadPlan[textoSeguro(b.plan)] || 99;

if (planA !== planB) return planA - planB;

const fechaA = new Date(a.created_at || 0).getTime();
const fechaB = new Date(b.created_at || 0).getTime();

return fechaB - fechaA;
});

return lista;
}, [proveedores, busqueda, sectorDesdeRequerimiento]);

const obtenerUsuarioComprador = async () => {
const { data: userData, error: userError } = await supabase.auth.getUser();

if (userError) {
throw new Error(userError.message || "Error obteniendo usuario autenticado");
}

const user = userData?.user || null;

if (!user?.email) {
throw new Error("Debes iniciar sesión como comprador.");
}

return user;
};

const obtenerRequerimientoActual = async () => {
const { data: reqData, error: reqError } = await supabase
.from("requerimientos")
.select("*")
.eq("id", requerimientoId)
.maybeSingle();

if (reqError) {
throw new Error(reqError.message || "Error leyendo requerimiento");
}

if (!reqData) {
throw new Error("No se encontró el requerimiento actual.");
}

return reqData;
};

const asegurarConversacionBase = async (proveedor, user, reqData) => {
let { data: conversacionExacta, error: errorBusqueda } = await supabase
.from("conversaciones")
.select("*")
.eq("comprador_email", user.email)
.eq("proveedor_email", proveedor.email)
.eq("requerimiento_id", requerimientoId)
.maybeSingle();

if (errorBusqueda) {
throw new Error(errorBusqueda.message || "Error buscando conversación");
}

if (!conversacionExacta) {
const payload = {
comprador_email: user.email,
proveedor_email: proveedor.email,
proveedor_nombre:
proveedor.nombre || proveedor.contacto || proveedor.email,
proveedor_id: proveedor.id || null,
requerimiento_id: requerimientoId,
requerimiento_nombre:
reqData.nombre_requerimiento || requerimientoNombre,
no_leido_proveedor: false,
no_leido_comprador: false,
ultimo_mensaje_at: null,
};

const { data: creada, error: errorCreacion } = await supabase
.from("conversaciones")
.insert([payload])
.select()
.single();

if (errorCreacion) {
throw new Error(errorCreacion.message || "Error creando conversación");
}

conversacionExacta = creada;
}

if (!conversacionExacta?.id) {
throw new Error("La conversación se creó vacía o sin id.");
}

return conversacionExacta;
};

const abrirChatConProveedor = async (proveedor) => {
if (!requerimientoId || !requerimientoNombre) {
alert(
"Para iniciar un chat, primero debes entrar desde un requerimiento."
);
return;
}

try {
setAbriendoChatId(proveedor.id || "cargando");

const user = await obtenerUsuarioComprador();
const reqData = await obtenerRequerimientoActual();
const conversacionExacta = await asegurarConversacionBase(
proveedor,
user,
reqData
);

const { data: mensajesExistentes, error: mensajesError } = await supabase
.from("mensajes")
.select("id")
.eq("conversacion_id", conversacionExacta.id);

if (mensajesError) {
throw new Error(
mensajesError.message || "Error revisando mensajes existentes"
);
}

if (!mensajesExistentes || mensajesExistentes.length === 0) {
const textoInicial = `Hola, comparto este requerimiento: ${
reqData.nombre_requerimiento || requerimientoNombre
}${reqData.descripcion ? `\n\nDetalle: ${reqData.descripcion}` : ""}`;

const { error: errorMensajeInicial } = await supabase
.from("mensajes")
.insert([
{
conversacion_id: conversacionExacta.id,
remitente_email: user.email,
mensaje: textoInicial,
archivo_url: reqData.archivo_url || null,
archivo_nombre: reqData.archivo_nombre || null,
},
]);

if (errorMensajeInicial) {
throw new Error(
errorMensajeInicial.message || "Error creando mensaje inicial"
);
}

const { error: errorUpdateConversacion } = await supabase
.from("conversaciones")
.update({
no_leido_proveedor: true,
no_leido_comprador: false,
ultimo_mensaje_at: new Date().toISOString(),
})
.eq("id", conversacionExacta.id);

if (errorUpdateConversacion) {
throw new Error(
errorUpdateConversacion.message ||
"Error actualizando notificación de conversación"
);
}
}


const params = new URLSearchParams();
params.set("conversacion_id", conversacionExacta.id);
params.set("requerimiento_id", requerimientoId);
params.set(
"requerimiento_nombre",
reqData.nombre_requerimiento || requerimientoNombre
);
params.set("proveedor_email", proveedor.email || "");
params.set(
"proveedor_nombre",
proveedor.nombre || proveedor.contacto || proveedor.email || "Proveedor"
);
params.set("proveedor_id", proveedor.id || "");
if (sectorDesdeRequerimiento) params.set("sector", sectorDesdeRequerimiento);
if (categoriaDesdeRequerimiento) {
params.set("categoria", categoriaDesdeRequerimiento);
}

navigate(`/chat?${params.toString()}`);
} catch (error) {
alert(`Error: ${error.message || "desconocido"}`);
} finally {
setAbriendoChatId("");
}
};

const solicitarCotizacionAProveedor = async (proveedor) => {
if (!requerimientoId || !requerimientoNombre) {
alert(
"Para solicitar cotización, primero debes entrar desde un requerimiento."
);
return;
}

try {
setSolicitandoCotizacionId(proveedor.id || "cargando");

const user = await obtenerUsuarioComprador();
const reqData = await obtenerRequerimientoActual();
const conversacionExacta = await asegurarConversacionBase(
proveedor,
user,
reqData
);

const textoSolicitud = `Hola, te solicito una cotización formal para el requerimiento: ${
reqData.nombre_requerimiento || requerimientoNombre
}${
reqData.descripcion ? `\n\nDetalle del requerimiento: ${reqData.descripcion}` : ""
}\n\nPor favor, envía tu propuesta económica para alimentar el comparativo de ofertas.`;

const { error: errorSolicitud } = await supabase
.from("mensajes")
.insert([
{
conversacion_id: conversacionExacta.id,
remitente_email: user.email,
mensaje: textoSolicitud,
archivo_url: reqData.archivo_url || null,
archivo_nombre: reqData.archivo_nombre || null,
},
]);

if (errorSolicitud) {
throw new Error(
errorSolicitud.message || "Error enviando solicitud de cotización"
);
}

alert(
"Solicitud de cotización enviada correctamente. El proveedor ya podrá responderte con su oferta formal."
);

await cargarCotizacionesRecibidas();
} catch (error) {
alert(`Error: ${error.message || "desconocido"}`);
} finally {
setSolicitandoCotizacionId("");
}
};

const volverARequerimientos = () => {
navigate("/requerimientos");
};

const verPerfilProveedor = (proveedor) => {
const rutaActual = `${location.pathname}${location.search}`;

navigate(`/proveedor/${proveedor.id}`, {
state: {
proveedor,
volverA: rutaActual,
},
});
};

const badgePlan = (plan) => {
const planTexto = textoSeguro(plan);

let fondo = "#e5e7eb";
let color = "#374151";
let texto = plan || "Gratis";

if (planTexto === "premium") {
fondo = "#fef3c7";
color = "#92400e";
texto = "Premium";
} else if (planTexto === "pro") {
fondo = "#dbeafe";
color = "#1d4ed8";
texto = "Pro";
} else if (planTexto === "gratis" || planTexto === "free" || !planTexto) {
fondo = "#e5e7eb";
color = "#374151";
texto = "Gratis";
}

return (
<span
style={{
display: "inline-block",
padding: "6px 10px",
borderRadius: "999px",
backgroundColor: fondo,
color,
fontSize: "12px",
fontWeight: "bold",
}}
>
{texto}
</span>
);
};

const badgeCotizacionRecibida = (
<span
style={{
display: "inline-block",
padding: "6px 10px",
borderRadius: "999px",
backgroundColor: "#dcfce7",
color: "#166534",
fontSize: "12px",
fontWeight: "bold",
}}
>
Cotización recibida
</span>
);

return (
<div
style={{
backgroundColor: "white",
borderRadius: "16px",
padding: "24px",
boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
}}
>
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

<h2 style={{ marginTop: 0 }}>Proveedores</h2>

{requerimientoId && requerimientoNombre ? (
<div
style={{
marginBottom: "18px",
padding: "16px",
borderRadius: "12px",
background: "#eff6ff",
borderLeft: "6px solid #2563eb",
borderRight: "6px solid #f59e0b",
}}
>
<p style={{ margin: 0, color: "#1f3552", fontWeight: "bold" }}>
Estás buscando proveedores para este requerimiento:
</p>

<p
style={{
margin: "8px 0 0 0",
fontSize: "18px",
fontWeight: "bold",
color: "#111827",
}}
>
{requerimientoNombre}
</p>

<div
style={{
marginTop: "10px",
display: "flex",
gap: "10px",
flexWrap: "wrap",
}}
>
{sectorDesdeRequerimiento ? (
<span
style={{
padding: "6px 10px",
borderRadius: "999px",
backgroundColor: "#dbeafe",
color: "#1d4ed8",
fontSize: "12px",
fontWeight: "bold",
}}
>
Sector: {sectorDesdeRequerimiento}
</span>
) : null}

{categoriaDesdeRequerimiento ? (
<span
style={{
padding: "6px 10px",
borderRadius: "999px",
backgroundColor: "#dcfce7",
color: "#166534",
fontSize: "12px",
fontWeight: "bold",
}}
>
Categoría: {categoriaDesdeRequerimiento}
</span>
) : null}
</div>

<button
onClick={volverARequerimientos}
style={{
marginTop: "12px",
backgroundColor: "#1f3552",
color: "white",
border: "none",
padding: "10px 14px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold",
}}
>
Volver a mis requerimientos
</button>
</div>
) : (
<div
style={{
marginBottom: "18px",
padding: "14px",
borderRadius: "12px",
backgroundColor: "#fff7ed",
borderLeft: "6px solid #f59e0b",
}}
>
<p style={{ margin: 0, color: "#92400e", fontWeight: "bold" }}>
Vista general de proveedores
</p>
<p style={{ margin: "6px 0 0 0", color: "#7c2d12" }}>
Puedes explorar proveedores, pero para interactuar con contexto debes
entrar desde un requerimiento.
</p>
</div>
)}

<input
type="text"
placeholder="Buscar por nombre, sector, categoría, ciudad o descripción"
value={busqueda}
onChange={(e) => setBusqueda(e.target.value)}
style={{
width: "100%",
padding: "12px",
marginBottom: "18px",
borderRadius: "10px",
border: "1px solid #ccc",
}}
/>

{cargando ? (
<p>Cargando proveedores...</p>
) : proveedoresFiltrados.length === 0 ? (
<div
style={{
border: "1px solid #e5e7eb",
borderRadius: "12px",
padding: "18px",
backgroundColor: "#fafafa",
}}
>
<p style={{ margin: 0, fontWeight: "bold" }}>
No encontramos proveedores para este criterio.
</p>
<p style={{ margin: "6px 0 0 0", color: "#6b7280" }}>
Puedes volver al requerimiento o cambiar el filtro de búsqueda.
</p>
</div>
) : (
<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
gap: "14px",
}}
>
{proveedoresFiltrados.map((p) => {
const yaCotizo = cotizacionYaRecibida(p);

return (
<div
key={p.id}
style={{
border: "1px solid #dcdcdc",
borderRadius: "14px",
padding: "16px",
backgroundColor: "white",
boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
}}
>
<div
style={{
display: "flex",
justifyContent: "space-between",
alignItems: "flex-start",
gap: "10px",
marginBottom: "10px",
}}
>
<div>
<h3
style={{
margin: 0,
fontSize: "18px",
color: "#111827",
}}
>
{p.nombre || p.contacto || "Proveedor sin nombre"}
</h3>

<p
style={{
margin: "6px 0 0 0",
color: "#6b7280",
fontSize: "14px",
}}
>
{p.sector || "Sin sector"} | {p.categoria || "Sin categoría"}
</p>
</div>

<div
style={{
display: "flex",
flexDirection: "column",
gap: "8px",
alignItems: "flex-end",
}}
>
{badgePlan(p.plan)}
{yaCotizo ? badgeCotizacionRecibida : null}
</div>
</div>

<p
style={{
margin: "0 0 10px 0",
fontSize: "13px",
color: "#6b7280",
lineHeight: 1.4,
}}
>
{obtenerTextoPlan(p.plan)}
</p>

{p.descripcion ? (
<p style={{ margin: "10px 0", color: "#374151" }}>
{p.descripcion}
</p>
) : null}

<p style={{ margin: "6px 0" }}>
<strong>Cobertura:</strong> {p.cobertura || "No definida"}
</p>

<p style={{ margin: "6px 0" }}>
<strong>Ubicación:</strong>{" "}
{[p.pais, p.provincia, p.ciudad].filter(Boolean).join(" | ") ||
"No definida"}
</p>

<p style={{ margin: "6px 0" }}>
<strong>RUC / RUT / Tax ID:</strong> {p.ruc_rut || "No definido"}
</p>

<p style={{ margin: "6px 0" }}>
<strong>Contacto:</strong> {p.contacto || "No definido"}
</p>

<p style={{ margin: "6px 0" }}>
<strong>Email:</strong> {p.email || "No definido"}
</p>

{p.telefono ? (
<p style={{ margin: "6px 0" }}>
<strong>Teléfono:</strong> {p.telefono}
</p>
) : null}

<div
style={{
marginTop: "16px",
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
gap: "10px",
}}
>
<div
style={{
borderRadius: "14px",
padding: "14px",
background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
border: "1px solid #e5e7eb",
display: "flex",
flexDirection: "column",
justifyContent: "space-between",
minHeight: "165px",
}}
>
<div>
<p
style={{
margin: 0,
fontWeight: "bold",
color: "#1f3552",
fontSize: "14px",
}}
>
Ver perfil
</p>

<p
style={{
margin: "8px 0 0 0",
fontSize: "12px",
color: "#4b5563",
lineHeight: 1.45,
}}
>
Aquí conocerás el alcance exacto de los servicios del proveedor.
</p>
</div>

<button
onClick={() => verPerfilProveedor(p)}
style={{
marginTop: "12px",
width: "100%",
backgroundColor: "#ffffff",
color: "#1f3552",
border: "1px solid #d1d5db",
padding: "10px 14px",
borderRadius: "10px",
cursor: "pointer",
fontWeight: "bold",
}}
>
Ver perfil
</button>
</div>

<div
style={{
borderRadius: "14px",
padding: "14px",
background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
boxShadow: "0 6px 14px rgba(37,99,235,0.12)",
border: "1px solid #93c5fd",
display: "flex",
flexDirection: "column",
justifyContent: "space-between",
minHeight: "165px",
}}
>
<div>
<p
style={{
margin: 0,
fontWeight: "bold",
color: "#1d4ed8",
fontSize: "14px",
}}
>
Chatear
</p>

<p
style={{
margin: "8px 0 0 0",
fontSize: "12px",
color: "#1e40af",
lineHeight: 1.45,
}}
>
Úsalo cuando ya necesites conversar o negociar directamente.
</p>
</div>

{requerimientoId && requerimientoNombre ? (
<button
onClick={() => abrirChatConProveedor(p)}
disabled={abriendoChatId === p.id}
style={{
marginTop: "12px",
width: "100%",
backgroundColor: "#2563eb",
color: "white",
border: "none",
padding: "10px 12px",
borderRadius: "10px",
cursor: "pointer",
fontWeight: "bold",
opacity: abriendoChatId === p.id ? 0.7 : 1,
}}
>
{abriendoChatId === p.id ? "Abriendo..." : "Chatear"}
</button>
) : (
<button
onClick={() =>
alert(
"Para chatear con este proveedor, primero abre un requerimiento y entra desde ahí."
)
}
style={{
marginTop: "12px",
width: "100%",
backgroundColor: "#9ca3af",
color: "white",
border: "none",
padding: "10px 12px",
borderRadius: "10px",
cursor: "pointer",
fontWeight: "bold",
}}
>
Abrir desde requerimiento
</button>
)}
</div>

<div
style={{
borderRadius: "14px",
padding: "14px",
background: "linear-gradient(135deg, #fde68a, #fcd34d)",
boxShadow: "0 6px 14px rgba(245,158,11,0.14)",
border: "1px solid #f59e0b",
display: "flex",
flexDirection: "column",
justifyContent: "space-between",
minHeight: "165px",
}}
>
<div>
<p
style={{
margin: 0,
fontWeight: "bold",
color: "#92400e",
fontSize: "14px",
}}
>
Solicitar cotización
</p>

<p
style={{
margin: "8px 0 0 0",
fontSize: "12px",
color: "#92400e",
lineHeight: 1.45,
}}
>
Este es el paso formal. No abre chat directo; primero solicita
la cotización y luego, si hace falta, puedes negociar por chat.
</p>
</div>

{requerimientoId && requerimientoNombre ? (
<button
onClick={() => solicitarCotizacionAProveedor(p)}
disabled={solicitandoCotizacionId === p.id || yaCotizo}
style={{
marginTop: "12px",
width: "100%",
backgroundColor: yaCotizo ? "#9ca3af" : "#f97316",
color: "white",
border: "none",
padding: "10px 12px",
borderRadius: "10px",
cursor: yaCotizo ? "not-allowed" : "pointer",
fontWeight: "bold",
opacity:
solicitandoCotizacionId === p.id || yaCotizo ? 0.8 : 1,
}}
>
{yaCotizo
? "Cotización recibida"
: solicitandoCotizacionId === p.id
? "Solicitando..."
: "Solicitar"}
</button>
) : (
<button
onClick={() =>
alert(
"Para solicitar cotización, primero abre un requerimiento y entra desde ahí."
)
}
style={{
marginTop: "12px",
width: "100%",
backgroundColor: "#9ca3af",
color: "white",
border: "none",
padding: "10px 12px",
borderRadius: "10px",
cursor: "pointer",
fontWeight: "bold",
}}
>
Abrir desde requerimiento
</button>
)}
</div>
</div>
</div>
);
})}
</div>
)}
</div>
);
}

export default Proveedores;
