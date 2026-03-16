import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";

function PanelProveedor() {
const navigate = useNavigate();

const [usuario, setUsuario] = useState(null);
const [proveedorActual, setProveedorActual] = useState(null);
const [requerimientos, setRequerimientos] = useState([]);
const [cotizaciones, setCotizaciones] = useState([]);
const [cargando, setCargando] = useState(true);

useEffect(() => {
cargarPanelPrivado();
}, []);

const cargarPanelPrivado = async () => {
try {
setCargando(true);

const { data: userData } = await supabase.auth.getUser();
const user = userData?.user || null;
setUsuario(user);

if (!user?.email) {
setCargando(false);
return;
}

const { data: proveedorData, error: proveedorError } = await supabase
.from("proveedores")
.select("*")
.eq("email", user.email)
.single();

if (proveedorError) {
console.error("Error cargando proveedor actual:", proveedorError);
setCargando(false);
return;
}

setProveedorActual(proveedorData);

const { data: requerimientosData, error: requerimientosError } = await supabase
.from("requerimientos")
.select("*")
.eq("estado", "Abierto")
.order("created_at", { ascending: false });

const { data: cotizacionesData, error: cotizacionesError } = await supabase
.from("cotizaciones")
.select("*")
.eq("proveedor_nombre", proveedorData.nombre)
.order("created_at", { ascending: false });

if (requerimientosError) {
console.error("Error cargando requerimientos:", requerimientosError);
}

if (cotizacionesError) {
console.error("Error cargando cotizaciones:", cotizacionesError);
}

setRequerimientos(requerimientosData || []);
setCotizaciones(cotizacionesData || []);
} catch (error) {
console.error("Error general cargando panel:", error);
} finally {
setCargando(false);
}
};

const cerrarSesion = async () => {
const { error } = await supabase.auth.signOut();

if (error) {
console.error("Error cerrando sesión proveedor:", error);
alert("No fue posible cerrar sesión");
return;
}

alert("Sesión cerrada");
navigate("/acceso-proveedor");
};

const oportunidadesRelacionadas = useMemo(() => {
if (!proveedorActual) return [];

return requerimientos.filter((r) => {
const mismaCategoria =
(r.categoria || "").toLowerCase() ===
(proveedorActual.categoria || "").toLowerCase();

const mismoSector =
(r.sector || "").toLowerCase() ===
(proveedorActual.sector || "").toLowerCase();

return mismaCategoria || mismoSector;
});
}, [proveedorActual, requerimientos]);

const solicitudesDirigidas = useMemo(() => {
if (!proveedorActual) return [];

return cotizaciones.filter((c) => {
return (c.estado || "").toLowerCase() === "solicitada";
});
}, [proveedorActual, cotizaciones]);

const cardStyle = {
backgroundColor: "white",
borderRadius: "16px",
padding: "20px",
boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
};

if (cargando) {
return (
<div style={cardStyle}>
<p>Cargando panel del proveedor...</p>
</div>
);
}

if (!usuario) {
return (
<div style={cardStyle}>
<h2>Acceso restringido</h2>
<p>Primero debes iniciar sesión como proveedor para ver tu panel privado.</p>

<Link
to="/acceso-proveedor"
style={{
display: "inline-block",
marginTop: "12px",
backgroundColor: "#1f3552",
color: "white",
textDecoration: "none",
padding: "10px 14px",
borderRadius: "8px",
fontWeight: "bold"
}}
>
Ir a acceso proveedor
</Link>
</div>
);
}

if (!proveedorActual) {
return (
<div style={cardStyle}>
<h2>Proveedor no vinculado</h2>
<p>
Tu correo inició sesión, pero todavía no encontramos un proveedor aprobado con ese email.
</p>
<p>
Para esta primera versión, el correo del login debe coincidir con el correo del proveedor registrado en PROCURO.
</p>
</div>
);
}

return (
<div>
<div style={{ ...cardStyle, marginBottom: "20px" }}>
<h2>Panel del proveedor</h2>
<p><strong>Proveedor activo:</strong> {proveedorActual.nombre}</p>
<p><strong>Email:</strong> {usuario.email}</p>
<p>
Este panel ya muestra solo la información del proveedor autenticado.
</p>

<div
style={{
display: "flex",
gap: "10px",
flexWrap: "wrap",
marginTop: "14px"
}}
>
<button
onClick={cerrarSesion}
style={{
backgroundColor: "#8b1e1e",
color: "white",
border: "none",
padding: "10px 14px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold"
}}
>
Cerrar sesión
</button>
</div>
</div>

<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
gap: "16px",
marginBottom: "20px"
}}
>
<div style={cardStyle}>
<h3>Oportunidades relacionadas</h3>
<p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>
{oportunidadesRelacionadas.length}
</p>
<p>Coinciden por sector o categoría</p>
</div>

<div style={cardStyle}>
<h3>Solicitudes dirigidas</h3>
<p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>
{solicitudesDirigidas.length}
</p>
<p>Solicitudes directas desde el directorio</p>
</div>

<div style={cardStyle}>
<h3>Mis cotizaciones</h3>
<p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>
{cotizaciones.length}
</p>
<p>Registros asociados a este proveedor</p>
</div>
</div>

<div style={{ ...cardStyle, marginBottom: "20px" }}>
<h3>Últimas oportunidades relacionadas</h3>

{oportunidadesRelacionadas.length > 0 ? (
oportunidadesRelacionadas.slice(0, 5).map((o) => (
<div
key={o.id}
style={{
borderBottom: "1px solid #eee",
padding: "12px 0"
}}
>
<p style={{ margin: 0, fontWeight: "bold" }}>
{o.nombre_requerimiento}
</p>
<p style={{ margin: "4px 0" }}>
{o.sector} - {o.categoria}
</p>
<p style={{ margin: "4px 0", color: "#666" }}>
Estado: {o.estado}
</p>

<Link
to={`/enviar-cotizacion/${o.id}`}
style={{
display: "inline-block",
marginTop: "8px",
backgroundColor: "#1f3552",
color: "white",
textDecoration: "none",
padding: "8px 12px",
borderRadius: "8px"
}}
>
Enviar cotización
</Link>
</div>
))
) : (
<p>No hay oportunidades relacionadas para este proveedor.</p>
)}
</div>

<div style={{ ...cardStyle, marginBottom: "20px" }}>
<h3>Solicitudes dirigidas</h3>

{solicitudesDirigidas.length > 0 ? (
solicitudesDirigidas.slice(0, 5).map((c) => (
<div
key={c.id}
style={{
borderBottom: "1px solid #eee",
padding: "12px 0"
}}
>
<p style={{ margin: 0, fontWeight: "bold" }}>
{c.requerimiento_nombre || "Sin requerimiento"}
</p>
<p style={{ margin: "4px 0" }}>
Estado: {c.estado}
</p>
{c.valor_referencial ? (
<p style={{ margin: "4px 0" }}>
Valor referencial: {c.valor_referencial}
</p>
) : null}
{c.mensaje ? (
<p style={{ margin: "4px 0", color: "#666" }}>
{c.mensaje}
</p>
) : null}
</div>
))
) : (
<p>No hay solicitudes directas para este proveedor.</p>
)}
</div>

<div style={cardStyle}>
<h3>Mis últimas cotizaciones</h3>

{cotizaciones.length > 0 ? (
cotizaciones.slice(0, 5).map((c) => (
<div
key={c.id}
style={{
borderBottom: "1px solid #eee",
padding: "12px 0"
}}
>
<p style={{ margin: 0, fontWeight: "bold" }}>
{c.requerimiento_nombre || "Sin requerimiento"}
</p>
<p style={{ margin: "4px 0" }}>
Estado: {c.estado}
</p>
{c.valor_referencial ? (
<p style={{ margin: "4px 0" }}>
Valor referencial: {c.valor_referencial}
</p>
) : null}
{c.archivo_url ? (
<p style={{ margin: "4px 0" }}>
<a href={c.archivo_url} target="_blank" rel="noreferrer">
Ver archivo adjunto
</a>
</p>
) : null}
</div>
))
) : (
<p>No hay cotizaciones registradas para este proveedor.</p>
)}
</div>
</div>
);
}

export default PanelProveedor;