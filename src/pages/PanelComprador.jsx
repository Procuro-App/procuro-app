import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function PanelComprador() {
const navigate = useNavigate();

const [usuario, setUsuario] = useState(null);
const [requerimientos, setRequerimientos] = useState([]);
const [cotizaciones, setCotizaciones] = useState([]);
const [cargando, setCargando] = useState(true);

useEffect(() => {
cargarPanelComprador();
}, []);

const cargarPanelComprador = async () => {
try {
setCargando(true);

const { data: userData } = await supabase.auth.getUser();
const user = userData?.user || null;
setUsuario(user);

if (!user?.email) {
setCargando(false);
return;
}

const { data: requerimientosData, error: requerimientosError } = await supabase
.from("requerimientos")
.select("*")
.order("created_at", { ascending: false });

const { data: cotizacionesData, error: cotizacionesError } = await supabase
.from("cotizaciones")
.select("*")
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
console.error("Error general cargando panel comprador:", error);
} finally {
setCargando(false);
}
};

const cerrarSesion = async () => {
const { error } = await supabase.auth.signOut();

if (error) {
console.error("Error cerrando sesión comprador:", error);
alert("No fue posible cerrar sesión");
return;
}

alert("Sesión cerrada");
navigate("/acceso-comprador");
};

const cardStyle = {
backgroundColor: "white",
borderRadius: "16px",
padding: "20px",
boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
};

if (cargando) {
return (
<div style={cardStyle}>
<p>Cargando dashboard del comprador...</p>
</div>
);
}

if (!usuario) {
return (
<div style={cardStyle}>
<h2>Acceso restringido</h2>
<p>Primero debes iniciar sesión como comprador para ver tu dashboard privado.</p>

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
fontWeight: "bold"
}}
>
Ir a acceso comprador
</Link>
</div>
);
}

return (
<div>
<div style={{ ...cardStyle, marginBottom: "20px" }}>
<h2>Dashboard comprador</h2>
<p><strong>Comprador activo:</strong> {usuario.email}</p>
<p>
Este dashboard ya es privado para la sesión del comprador autenticado.
</p>

<div
style={{
display: "flex",
gap: "10px",
flexWrap: "wrap",
marginTop: "14px"
}}
>
<Link
to="/requerimientos"
style={{
display: "inline-block",
backgroundColor: "#1f3552",
color: "white",
textDecoration: "none",
padding: "10px 14px",
borderRadius: "8px",
fontWeight: "bold"
}}
>
Publicar requerimiento
</Link>

<Link
to="/proveedores"
style={{
display: "inline-block",
backgroundColor: "#e5e7eb",
color: "#111827",
textDecoration: "none",
padding: "10px 14px",
borderRadius: "8px",
fontWeight: "bold"
}}
>
Buscar proveedores
</Link>

<Link
to="/cotizaciones"
style={{
display: "inline-block",
backgroundColor: "#dbeafe",
color: "#1d4ed8",
textDecoration: "none",
padding: "10px 14px",
borderRadius: "8px",
fontWeight: "bold"
}}
>
Ver cotizaciones
</Link>

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
<h3>Requerimientos</h3>
<p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>
{requerimientos.length}
</p>
<p>Registros publicados en la plataforma</p>
</div>

<div style={cardStyle}>
<h3>Cotizaciones recibidas</h3>
<p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>
{cotizaciones.length}
</p>
<p>Respuestas generadas por proveedores</p>
</div>

<div style={cardStyle}>
<h3>Requerimientos abiertos</h3>
<p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>
{requerimientos.filter((r) => (r.estado || "").toLowerCase() === "abierto").length}
</p>
<p>Oportunidades activas publicadas</p>
</div>
</div>

<div style={{ ...cardStyle, marginBottom: "20px" }}>
<h3>Últimos requerimientos</h3>

{requerimientos.length > 0 ? (
requerimientos.slice(0, 5).map((r) => (
<div
key={r.id}
style={{
borderBottom: "1px solid #eee",
padding: "12px 0"
}}
>
<p style={{ margin: 0, fontWeight: "bold" }}>
{r.nombre_requerimiento}
</p>
<p style={{ margin: "4px 0" }}>
{r.sector} - {r.categoria}
</p>
<p style={{ margin: "4px 0", color: "#666" }}>
Estado: {r.estado}
</p>
</div>
))
) : (
<p>No hay requerimientos publicados todavía.</p>
)}
</div>

<div style={cardStyle}>
<h3>Últimas cotizaciones</h3>

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
Proveedor: {c.proveedor_nombre || "No especificado"}
</p>
<p style={{ margin: "4px 0", color: "#666" }}>
Estado: {c.estado}
</p>
{c.valor_referencial ? (
<p style={{ margin: "4px 0" }}>
Valor referencial: {c.valor_referencial}
</p>
) : null}
</div>
))
) : (
<p>No hay cotizaciones registradas todavía.</p>
)}
</div>
</div>
);
}

export default PanelComprador;