import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Cotizaciones() {
const navigate = useNavigate();

const [usuario, setUsuario] = useState(null);
const [cotizaciones, setCotizaciones] = useState([]);
const [cargando, setCargando] = useState(true);
const [busqueda, setBusqueda] = useState("");

useEffect(() => {
cargarCotizaciones();
}, []);

const rol = localStorage.getItem("rol") || "";

const textoSeguro = (valor) => String(valor || "").trim().toLowerCase();

const cargarCotizaciones = async () => {
try {
setCargando(true);

const { data: userData, error: userError } = await supabase.auth.getUser();

if (userError) {
console.error("Error obteniendo usuario autenticado:", userError);
setCargando(false);
return;
}

const user = userData?.user || null;
setUsuario(user);

if (!user?.email && !user?.id) {
setCotizaciones([]);
setCargando(false);
return;
}

if (rol === "proveedor") {
const { data: proveedorData, error: proveedorError } = await supabase
.from("proveedores")
.select("*")
.eq("email", user.email)
.maybeSingle();

if (proveedorError) {
console.error("Error cargando proveedor:", proveedorError);
setCotizaciones([]);
setCargando(false);
return;
}

const nombreProveedor = proveedorData?.nombre || "";
const contactoProveedor = proveedorData?.contacto || "";
const emailProveedor = proveedorData?.email || user.email || "";

const filtros = [
nombreProveedor ? `proveedor_nombre.eq.${nombreProveedor}` : null,
contactoProveedor ? `contacto.eq.${contactoProveedor}` : null,
emailProveedor ? `email.eq.${emailProveedor}` : null,
]
.filter(Boolean)
.join(",");

if (!filtros) {
setCotizaciones([]);
setCargando(false);
return;
}

const { data: cotizacionesData, error: cotizacionesError } =
await supabase
.from("cotizaciones")
.select("*")
.or(filtros)
.order("created_at", { ascending: false });

if (cotizacionesError) {
console.error("Error cargando cotizaciones proveedor:", cotizacionesError);
setCotizaciones([]);
setCargando(false);
return;
}

setCotizaciones(cotizacionesData || []);
} else {
const { data: requerimientosData, error: requerimientosError } =
await supabase
.from("requerimientos")
.select("id, nombre_requerimiento")
.eq("comprador_user_id", user.id);

if (requerimientosError) {
console.error("Error cargando requerimientos del comprador:", requerimientosError);
setCotizaciones([]);
setCargando(false);
return;
}

const requerimientoIds = (requerimientosData || [])
.map((r) => r.id)
.filter(Boolean);

const requerimientoNombres = (requerimientosData || [])
.map((r) => r.nombre_requerimiento)
.filter(Boolean);

let cotizacionesData = [];

if (requerimientoIds.length > 0) {
const { data, error } = await supabase
.from("cotizaciones")
.select("*")
.in("requerimiento_id", requerimientoIds)
.order("created_at", { ascending: false });

if (!error) {
cotizacionesData = data || [];
}
}

if (cotizacionesData.length === 0 && requerimientoNombres.length > 0) {
const { data, error } = await supabase
.from("cotizaciones")
.select("*")
.in("requerimiento_nombre", requerimientoNombres)
.order("created_at", { ascending: false });

if (error) {
console.error("Error cargando cotizaciones comprador:", error);
setCotizaciones([]);
setCargando(false);
return;
}

cotizacionesData = data || [];
}

setCotizaciones(cotizacionesData || []);
}
} catch (error) {
console.error("Error general cargando cotizaciones:", error);
setCotizaciones([]);
} finally {
setCargando(false);
}
};

const volverSegunRol = () => {
if (rol === "proveedor") {
navigate("/panel-proveedor");
} else {
navigate("/panel-comprador");
}
};

const cotizacionesFiltradas = useMemo(() => {
if (!busqueda.trim()) return cotizaciones;

const q = textoSeguro(busqueda);

return cotizaciones.filter((c) => {
const campos = [
c.requerimiento_nombre,
c.proveedor_nombre,
c.estado,
c.valor_referencial,
c.contacto,
c.email,
c.telefono,
c.mensaje,
]
.map((x) => textoSeguro(x))
.join(" ");

return campos.includes(q);
});
}, [cotizaciones, busqueda]);

const resumen = useMemo(() => {
const total = cotizaciones.length;
const enviadas = cotizaciones.filter(
(c) => textoSeguro(c.estado) === "enviada"
).length;
const conArchivo = cotizaciones.filter((c) => !!c.archivo_url).length;
const conValor = cotizaciones.filter((c) => !!c.valor_referencial).length;

return {
total,
enviadas,
conArchivo,
conValor,
};
}, [cotizaciones]);

const badgeEstado = (estado) => {
const estadoTexto = textoSeguro(estado);

let fondo = "#e5e7eb";
let color = "#374151";
let texto = estado || "Sin estado";

if (estadoTexto === "enviada") {
fondo = "#d1fae5";
color = "#065f46";
texto = "Enviada";
} else if (estadoTexto === "pendiente") {
fondo = "#fef3c7";
color = "#92400e";
texto = "Pendiente";
} else if (estadoTexto === "rechazada") {
fondo = "#fee2e2";
color = "#991b1b";
texto = "Rechazada";
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

const cardPrincipal = {
background: "linear-gradient(135deg, #f8f5ef 0%, #f2ede3 100%)",
borderRadius: "18px",
padding: "24px",
boxShadow: "0 10px 28px rgba(0,0,0,0.18)",
border: "1px solid rgba(249, 115, 22, 0.18)",
marginBottom: "18px",
};

const cardSecundaria = {
background: "#f8f5ef",
borderRadius: "16px",
padding: "20px",
boxShadow: "0 8px 22px rgba(0,0,0,0.14)",
border: "1px solid rgba(31,53,82,0.10)",
};

const miniCard = {
background: "white",
borderRadius: "14px",
padding: "16px",
boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
border: "1px solid #ececec",
};

if (cargando) {
return (
<div style={cardSecundaria}>
<p>Cargando cotizaciones...</p>
</div>
);
}

if (!usuario) {
return (
<div style={cardSecundaria}>
<h2>Cotizaciones</h2>
<p>Debes iniciar sesión para ver tus cotizaciones.</p>

<Link
to={rol === "proveedor" ? "/acceso-proveedor" : "/acceso-comprador"}
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
<button
onClick={volverSegunRol}
style={{
marginBottom: "16px",
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

<div style={cardPrincipal}>
<p
style={{
margin: 0,
color: "#f97316",
fontWeight: "800",
textTransform: "uppercase",
letterSpacing: "0.08em",
fontSize: "12px",
}}
>
{rol === "proveedor" ? "Panel proveedor" : "Panel comprador"}
</p>

<h1
style={{
margin: "8px 0 0 0",
fontSize: "30px",
color: "#1f3552",
fontWeight: "800",
}}
>
{rol === "proveedor" ? "Mis cotizaciones" : "Cotizaciones recibidas"}
</h1>

<p
style={{
marginTop: "8px",
marginBottom: 0,
color: "#5b6472",
lineHeight: 1.5,
}}
>
{rol === "proveedor"
? "Aquí puedes revisar tus cotizaciones enviadas y dar seguimiento a tu historial de ofertas."
: "Aquí puedes revisar todas las cotizaciones recibidas para tus requerimientos y analizarlas antes de comparar."}
</p>
</div>

<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
gap: "12px",
marginBottom: "18px",
}}
>
<div style={miniCard}>
<p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>Total</p>
<p
style={{
margin: "6px 0 0 0",
fontSize: "26px",
fontWeight: "800",
color: "#1f3552",
}}
>
{resumen.total}
</p>
</div>

<div style={miniCard}>
<p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>
Enviadas
</p>
<p
style={{
margin: "6px 0 0 0",
fontSize: "26px",
fontWeight: "800",
color: "#166534",
}}
>
{resumen.enviadas}
</p>
</div>

<div style={miniCard}>
<p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>
Con archivo
</p>
<p
style={{
margin: "6px 0 0 0",
fontSize: "26px",
fontWeight: "800",
color: "#92400e",
}}
>
{resumen.conArchivo}
</p>
</div>

<div style={miniCard}>
<p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>
Con valor
</p>
<p
style={{
margin: "6px 0 0 0",
fontSize: "26px",
fontWeight: "800",
color: "#1d4ed8",
}}
>
{resumen.conValor}
</p>
</div>
</div>

<div style={{ ...cardSecundaria, marginBottom: "18px" }}>
<input
type="text"
placeholder="Buscar por requerimiento, proveedor, estado, valor, email o mensaje"
value={busqueda}
onChange={(e) => setBusqueda(e.target.value)}
style={{
width: "100%",
padding: "12px",
borderRadius: "10px",
border: "1px solid #ccc",
}}
/>
</div>

<div style={cardSecundaria}>
{cotizacionesFiltradas.length > 0 ? (
<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
gap: "14px",
}}
>
{cotizacionesFiltradas.map((c) => (
<div
key={c.id}
style={{
backgroundColor: "white",
border: "1px solid #e5e7eb",
borderRadius: "14px",
padding: "16px",
boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
}}
>
<div
style={{
display: "flex",
justifyContent: "space-between",
gap: "10px",
alignItems: "flex-start",
marginBottom: "12px",
}}
>
<div>
<h3
style={{
margin: 0,
color: "#1f3552",
fontSize: "18px",
}}
>
{c.requerimiento_nombre || "Sin requerimiento"}
</h3>

{rol === "proveedor" ? null : (
<p
style={{
margin: "6px 0 0 0",
color: "#6b7280",
fontSize: "14px",
}}
>
{c.proveedor_nombre || "Proveedor no especificado"}
</p>
)}
</div>

<div>{badgeEstado(c.estado)}</div>
</div>

<div
style={{
display: "grid",
gap: "6px",
marginBottom: "12px",
}}
>
{rol === "proveedor" ? null : (
<p style={{ margin: 0 }}>
<strong>Proveedor:</strong>{" "}
{c.proveedor_nombre || "No especificado"}
</p>
)}

<p style={{ margin: 0 }}>
<strong>Valor referencial:</strong>{" "}
{c.valor_referencial || "No especificado"}
</p>

<p style={{ margin: 0 }}>
<strong>Contacto:</strong> {c.contacto || "No especificado"}
</p>

<p style={{ margin: 0 }}>
<strong>Email:</strong> {c.email || "No especificado"}
</p>

<p style={{ margin: 0 }}>
<strong>Teléfono:</strong> {c.telefono || "No especificado"}
</p>
</div>

<div
style={{
padding: "12px",
borderRadius: "10px",
backgroundColor: "#f9fafb",
border: "1px solid #f0f0f0",
marginBottom: "12px",
}}
>
<p
style={{
margin: "0 0 6px 0",
fontWeight: "bold",
color: "#374151",
}}
>
Mensaje
</p>
<p
style={{
margin: 0,
color: "#4b5563",
whiteSpace: "pre-wrap",
}}
>
{c.mensaje || "Sin mensaje"}
</p>
</div>

<div
style={{
display: "flex",
justifyContent: "space-between",
gap: "10px",
alignItems: "center",
flexWrap: "wrap",
}}
>
<p
style={{
margin: 0,
fontSize: "12px",
color: "#6b7280",
}}
>
{c.created_at
? `Registrada: ${new Date(c.created_at).toLocaleString()}`
: ""}
</p>

{c.archivo_url ? (
<a
href={c.archivo_url}
target="_blank"
rel="noreferrer"
style={{
display: "inline-block",
backgroundColor: "#1f3552",
color: "white",
textDecoration: "none",
padding: "9px 12px",
borderRadius: "8px",
fontWeight: "bold",
fontSize: "13px",
}}
>
Ver archivo adjunto
</a>
) : (
<span
style={{
display: "inline-block",
backgroundColor: "#e5e7eb",
color: "#4b5563",
padding: "9px 12px",
borderRadius: "8px",
fontWeight: "bold",
fontSize: "13px",
}}
>
Sin archivo
</span>
)}
</div>
</div>
))}
</div>
) : (
<div
style={{
backgroundColor: "white",
border: "1px solid #e5e7eb",
borderRadius: "14px",
padding: "18px",
}}
>
<p style={{ margin: 0, fontWeight: "bold" }}>
No hay cotizaciones registradas todavía.
</p>
<p style={{ margin: "6px 0 0 0", color: "#6b7280" }}>
{rol === "proveedor"
? "Cuando envíes cotizaciones formales desde oportunidades, aparecerán aquí."
: "Cuando los proveedores envíen cotizaciones formales para tus requerimientos, aparecerán aquí."}
</p>
</div>
)}
</div>
</div>
);
}

export default Cotizaciones;
