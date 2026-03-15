import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { proveedores as proveedoresBase } from "../data/proveedoresData";
import { Link } from "react-router-dom";

function PanelProveedor() {
const [proveedoresSupabase, setProveedoresSupabase] = useState([]);
const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");
const [requerimientos, setRequerimientos] = useState([]);
const [cotizaciones, setCotizaciones] = useState([]);
const [cargando, setCargando] = useState(true);

useEffect(() => {
cargarPanel();
}, []);

const cargarPanel = async () => {
try {
setCargando(true);

const { data: proveedoresData, error: proveedoresError } = await supabase
.from("proveedores")
.select("*")
.eq("estado", "Aprobado")
.order("created_at", { ascending: false });

const { data: requerimientosData, error: requerimientosError } = await supabase
.from("requerimientos")
.select("*")
.eq("estado", "Abierto")
.order("created_at", { ascending: false });

const { data: cotizacionesData, error: cotizacionesError } = await supabase
.from("cotizaciones")
.select("*")
.order("created_at", { ascending: false });

if (proveedoresError) {
console.error("Error cargando proveedores:", proveedoresError);
}

if (requerimientosError) {
console.error("Error cargando requerimientos:", requerimientosError);
}

if (cotizacionesError) {
console.error("Error cargando cotizaciones:", cotizacionesError);
}

setProveedoresSupabase(proveedoresData || []);
setRequerimientos(requerimientosData || []);
setCotizaciones(cotizacionesData || []);
} catch (error) {
console.error("Error general cargando panel:", error);
} finally {
setCargando(false);
}
};

const todosLosProveedores = useMemo(() => {
return [...proveedoresBase, ...proveedoresSupabase];
}, [proveedoresSupabase]);

const proveedorActual = useMemo(() => {
if (!proveedorSeleccionado) return null;

return todosLosProveedores.find(
(p) => p.nombre === proveedorSeleccionado
) || null;
}, [proveedorSeleccionado, todosLosProveedores]);

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
return (
(c.proveedor_nombre || "").toLowerCase() ===
(proveedorActual.nombre || "").toLowerCase() &&
(c.estado || "").toLowerCase() === "solicitada"
);
});
}, [proveedorActual, cotizaciones]);

const cotizacionesProveedor = useMemo(() => {
if (!proveedorActual) return [];

return cotizaciones.filter((c) => {
return (
(c.proveedor_nombre || "").toLowerCase() ===
(proveedorActual.nombre || "").toLowerCase()
);
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

return (
<div>
<div style={{ ...cardStyle, marginBottom: "20px" }}>
<h2>Panel del proveedor</h2>
<p>
Selecciona un proveedor para ver oportunidades relacionadas,
solicitudes directas y cotizaciones enviadas.
</p>

<select
value={proveedorSeleccionado}
onChange={(e) => setProveedorSeleccionado(e.target.value)}
style={{
width: "100%",
padding: "12px",
borderRadius: "10px",
border: "1px solid #ccc",
marginTop: "12px"
}}
>
<option value="">Selecciona un proveedor</option>
{todosLosProveedores.map((p, index) => (
<option key={p.id || `${p.nombre}-${index}`} value={p.nombre}>
{p.nombre}
</option>
))}
</select>
</div>

{!proveedorActual ? (
<div style={cardStyle}>
<p>Selecciona un proveedor para visualizar su panel inteligente.</p>
</div>
) : (
<>
<div style={{ ...cardStyle, marginBottom: "20px" }}>
<h3>{proveedorActual.nombre}</h3>
<p><strong>Tipo:</strong> {proveedorActual.tipo_persona || "No especificado"}</p>
<p><strong>Sector:</strong> {proveedorActual.sector || "No especificado"}</p>
<p><strong>Categoría:</strong> {proveedorActual.categoria || "No especificada"}</p>
<p><strong>Email:</strong> {proveedorActual.email || "No especificado"}</p>
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
<h3>Cotizaciones del proveedor</h3>
<p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>
{cotizacionesProveedor.length}
</p>
<p>Registros asociados al proveedor seleccionado</p>
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
<h3>Últimas cotizaciones del proveedor</h3>

{cotizacionesProveedor.length > 0 ? (
cotizacionesProveedor.slice(0, 5).map((c) => (
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
</>
)}
</div>
);
}

export default PanelProveedor;
