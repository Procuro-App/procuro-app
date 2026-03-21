import { useEffect, useMemo, useState } from "react";
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

if (!user?.id || !user?.email) {
setCargando(false);
return;
}

const { data: requerimientosData, error: requerimientosError } = await supabase
.from("requerimientos")
.select("*")
.eq("comprador_user_id", user.id)
.order("created_at", { ascending: false });

if (requerimientosError) {
console.error("Error cargando requerimientos:", requerimientosError);
setCargando(false);
return;
}

const nombresRequerimientos = (requerimientosData || []).map(
(r) => r.nombre_requerimiento
);

let cotizacionesData = [];
if (nombresRequerimientos.length > 0) {
const { data, error } = await supabase
.from("cotizaciones")
.select("*")
.in("requerimiento_nombre", nombresRequerimientos)
.order("created_at", { ascending: false });

if (error) {
console.error("Error cargando cotizaciones:", error);
} else {
cotizacionesData = data || [];
}
}

setRequerimientos(requerimientosData || []);
setCotizaciones(cotizacionesData);
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

const requerimientosAbiertos = useMemo(() => {
return requerimientos.filter(
(r) => (r.estado || "").toLowerCase() === "abierto"
).length;
}, [requerimientos]);

const cardStyle = {
backgroundColor: "white",
borderRadius: "16px",
padding: "20px",
boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
};

const accesoStyle = {
display: "inline-block",
backgroundColor: "#1f3552",
color: "white",
textDecoration: "none",
padding: "12px 14px",
borderRadius: "10px",
fontWeight: "bold",
textAlign: "center"
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
<p>Este es tu centro de control como comprador.</p>

<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
gap: "12px",
marginTop: "16px"
}}
>
<Link to="/requerimientos" style={accesoStyle}>
Requerimientos
</Link>

<Link to="/cotizaciones" style={accesoStyle}>
Cotizaciones
</Link>

<Link to="/comparador-cotizaciones" style={accesoStyle}>
Comparativo de cotizaciones
</Link>

<Link to="/mi-perfil-comprador" style={accesoStyle}>
Mi perfil comprador
</Link>

<button
onClick={cerrarSesion}
style={{
backgroundColor: "#8b1e1e",
color: "white",
border: "none",
padding: "12px 14px",
borderRadius: "10px",
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
<h3>Mis requerimientos</h3>
<p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>
{requerimientos.length}
</p>
</div>

<div style={cardStyle}>
<h3>Mis cotizaciones recibidas</h3>
<p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>
{cotizaciones.length}
</p>
</div>

<div style={cardStyle}>
<h3>Mis requerimientos abiertos</h3>
<p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>
{requerimientosAbiertos}
</p>
</div>
</div>

<div style={{ ...cardStyle, marginBottom: "20px" }}>
<h3>Mis últimos requerimientos</h3>

{requerimientos.length > 0 ? (
requerimientos.slice(0, 5).map((r) => (
<div key={r.id} style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
<p style={{ margin: 0, fontWeight: "bold" }}>{r.nombre_requerimiento}</p>
<p style={{ margin: "4px 0" }}>{r.sector} - {r.categoria}</p>
<p style={{ margin: "4px 0", color: "#666" }}>Estado: {r.estado}</p>
</div>
))
) : (
<p>No tienes requerimientos todavía.</p>
)}
</div>

<div style={cardStyle}>
<h3>Mis últimas cotizaciones</h3>

{cotizaciones.length > 0 ? (
cotizaciones.slice(0, 5).map((c) => (
<div key={c.id} style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
<p style={{ margin: 0, fontWeight: "bold" }}>
{c.requerimiento_nombre || "Sin requerimiento"}
</p>
<p style={{ margin: "4px 0" }}>
Proveedor: {c.proveedor_nombre || "No especificado"}
</p>
<p style={{ margin: "4px 0", color: "#666" }}>
Estado: {c.estado}
</p>
</div>
))
) : (
<p>No tienes cotizaciones todavía.</p>
)}
</div>
</div>
);
}

export default PanelComprador;