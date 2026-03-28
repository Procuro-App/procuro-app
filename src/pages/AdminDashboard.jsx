import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const ADMIN_EMAILS = ["soporte.procuroapp@gmail.com"];

function AdminDashboard() {
const navigate = useNavigate();

const [autorizado, setAutorizado] = useState(false);
const [usuario, setUsuario] = useState(null);
const [cargando, setCargando] = useState(true);

const [totalProveedores, setTotalProveedores] = useState(0);
const [proveedoresPendientes, setProveedoresPendientes] = useState(0);
const [proveedoresAprobados, setProveedoresAprobados] = useState(0);
const [totalCompradores, setTotalCompradores] = useState(0);
const [totalRequerimientos, setTotalRequerimientos] = useState(0);
const [totalCotizaciones, setTotalCotizaciones] = useState(0);

const isMobile =
typeof window !== "undefined" ? window.innerWidth <= 768 : false;

useEffect(() => {
validarAcceso();
}, []);

const validarAcceso = async () => {
try {
setCargando(true);

const { data, error } = await supabase.auth.getUser();

if (error) {
console.error("Error validando admin:", error);
setAutorizado(false);
setCargando(false);
return;
}

const user = data?.user || null;
setUsuario(user);

const email = String(user?.email || "").trim().toLowerCase();
const admins = ADMIN_EMAILS.map((item) =>
String(item || "").trim().toLowerCase()
);

if (!email || !admins.includes(email)) {
setAutorizado(false);
setCargando(false);
return;
}

setAutorizado(true);
await cargarResumen();
} catch (error) {
console.error("Error general validando acceso admin:", error);
setAutorizado(false);
setCargando(false);
}
};

const cargarResumen = async () => {
try {
const [
proveedoresRes,
pendientesRes,
aprobadosRes,
compradoresRes,
requerimientosRes,
cotizacionesRes,
] = await Promise.all([
supabase.from("proveedores").select("*", { count: "exact", head: true }),
supabase
.from("proveedores")
.select("*", { count: "exact", head: true })
.eq("estado", "Pendiente"),
supabase
.from("proveedores")
.select("*", { count: "exact", head: true })
.eq("estado", "Aprobado"),
supabase.from("compradores").select("*", { count: "exact", head: true }),
supabase
.from("requerimientos")
.select("*", { count: "exact", head: true }),
supabase.from("cotizaciones").select("*", { count: "exact", head: true }),
]);

setTotalProveedores(proveedoresRes.count || 0);
setProveedoresPendientes(pendientesRes.count || 0);
setProveedoresAprobados(aprobadosRes.count || 0);
setTotalCompradores(compradoresRes.count || 0);
setTotalRequerimientos(requerimientosRes.count || 0);
setTotalCotizaciones(cotizacionesRes.count || 0);
} catch (error) {
console.error("Error cargando dashboard admin:", error);
} finally {
setCargando(false);
}
};

const paginaStyle = {
minHeight: "100vh",
background:
"linear-gradient(135deg, #111827 0%, #1f2937 38%, #1f3552 72%, #0f172a 100%)",
padding: isMobile ? "16px" : "30px",
};

const cardPrincipal = {
background:
"linear-gradient(135deg, rgba(245,239,230,0.98), rgba(241,233,221,0.96))",
borderRadius: "24px",
padding: isMobile ? "22px 18px" : "30px 32px",
boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
border: "1px solid rgba(249,115,22,0.16)",
marginBottom: "20px",
position: "relative",
overflow: "hidden",
};

const cardResumen = {
background: "#f8f5ef",
borderRadius: "18px",
padding: "20px",
boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
border: "1px solid rgba(31,53,82,0.10)",
};

const botonVolver = {
marginBottom: "16px",
backgroundColor: "#e5e7eb",
border: "none",
padding: "8px 12px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "700",
};

const botonPrincipal = {
background: "linear-gradient(135deg, #1f3552, #2563eb)",
color: "white",
border: "none",
padding: "12px 16px",
borderRadius: "12px",
cursor: "pointer",
fontWeight: "700",
fontSize: "14px",
boxShadow: "0 8px 16px rgba(37,99,235,0.18)",
};

const botonSecundario = {
background: "linear-gradient(135deg, #f97316, #ea580c)",
color: "white",
border: "none",
padding: "12px 16px",
borderRadius: "12px",
cursor: "pointer",
fontWeight: "700",
fontSize: "14px",
boxShadow: "0 8px 16px rgba(249,115,22,0.20)",
};

if (cargando) {
return (
<div style={paginaStyle}>
<div style={cardResumen}>
<button onClick={() => navigate("/")} style={botonVolver}>
← Volver
</button>
<p>Cargando dashboard admin...</p>
</div>
</div>
);
}

if (!autorizado) {
return (
<div style={paginaStyle}>
<div style={cardResumen}>
<button onClick={() => navigate("/")} style={botonVolver}>
← Volver
</button>
<h2 style={{ marginTop: 0, color: "#1f3552" }}>Acceso restringido</h2>
<p style={{ color: "#5b6472" }}>
No tienes permisos para acceder a esta sección.
</p>
{usuario?.email ? (
<p style={{ color: "#5b6472", marginBottom: 0 }}>
Sesión detectada: <strong>{usuario.email}</strong>
</p>
) : null}
</div>
</div>
);
}

return (
<div style={paginaStyle}>
<button onClick={() => navigate("/")} style={botonVolver}>
← Volver
</button>

<div style={cardPrincipal}>
<div
style={{
position: "absolute",
top: "-30px",
right: "-20px",
width: "150px",
height: "150px",
background:
"radial-gradient(circle, rgba(249,115,22,0.16) 0%, rgba(249,115,22,0) 72%)",
pointerEvents: "none",
}}
/>

<p
style={{
margin: 0,
color: "#f97316",
fontWeight: "800",
textTransform: "uppercase",
letterSpacing: "0.08em",
fontSize: "12px",
position: "relative",
zIndex: 1,
}}
>
Administración
</p>

<h1
style={{
margin: "10px 0 8px 0",
fontSize: isMobile ? "24px" : "30px",
color: "#1f3552",
fontWeight: "700",
lineHeight: 1.25,
position: "relative",
zIndex: 1,
}}
>
Dashboard admin
</h1>

<p
style={{
marginTop: 0,
marginBottom: 0,
color: "#5b6472",
lineHeight: 1.65,
fontSize: isMobile ? "14px" : "16px",
maxWidth: "840px",
position: "relative",
zIndex: 1,
}}
>
Aquí puedes revisar el estado general de PROCuro y acceder
rápidamente a la revisión de proveedores.
</p>
</div>

<div
style={{
display: "grid",
gridTemplateColumns: isMobile
? "1fr"
: "repeat(auto-fit, minmax(220px, 1fr))",
gap: "16px",
marginBottom: "22px",
}}
>
<div style={cardResumen}>
<p style={{ margin: 0, color: "#6b7280", fontWeight: "700" }}>
Proveedores totales
</p>
<h2 style={{ margin: "10px 0 0 0", color: "#111827" }}>
{totalProveedores}
</h2>
</div>

<div style={cardResumen}>
<p style={{ margin: 0, color: "#6b7280", fontWeight: "700" }}>
Pendientes
</p>
<h2 style={{ margin: "10px 0 0 0", color: "#92400e" }}>
{proveedoresPendientes}
</h2>
</div>

<div style={cardResumen}>
<p style={{ margin: 0, color: "#6b7280", fontWeight: "700" }}>
Aprobados
</p>
<h2 style={{ margin: "10px 0 0 0", color: "#166534" }}>
{proveedoresAprobados}
</h2>
</div>

<div style={cardResumen}>
<p style={{ margin: 0, color: "#6b7280", fontWeight: "700" }}>
Compradores
</p>
<h2 style={{ margin: "10px 0 0 0", color: "#1d4ed8" }}>
{totalCompradores}
</h2>
</div>

<div style={cardResumen}>
<p style={{ margin: 0, color: "#6b7280", fontWeight: "700" }}>
Requerimientos
</p>
<h2 style={{ margin: "10px 0 0 0", color: "#1f3552" }}>
{totalRequerimientos}
</h2>
</div>

<div style={cardResumen}>
<p style={{ margin: 0, color: "#6b7280", fontWeight: "700" }}>
Cotizaciones
</p>
<h2 style={{ margin: "10px 0 0 0", color: "#7c3aed" }}>
{totalCotizaciones}
</h2>
</div>
</div>

<div style={cardResumen}>
<h3
style={{
marginTop: 0,
marginBottom: "14px",
color: "#1f3552",
}}
>
Acciones rápidas
</h3>

<div
style={{
display: "flex",
gap: "12px",
flexWrap: "wrap",
}}
>
<button
onClick={() => navigate("/revision-proveedores")}
style={botonPrincipal}
>
Revisar proveedores pendientes
</button>

<button
onClick={() => navigate("/proveedores")}
style={botonSecundario}
>
Ver directorio publicado
</button>
</div>
</div>
</div>
);
}

export default AdminDashboard;