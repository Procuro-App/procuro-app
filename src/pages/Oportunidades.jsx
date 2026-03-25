import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Oportunidades() {
const navigate = useNavigate();

const [usuario, setUsuario] = useState(null);
const [proveedor, setProveedor] = useState(null);
const [requerimientos, setRequerimientos] = useState([]);
const [cotizacionesEnviadas, setCotizacionesEnviadas] = useState([]);
const [busqueda, setBusqueda] = useState("");
const [cargando, setCargando] = useState(true);

const isMobile =
typeof window !== "undefined" ? window.innerWidth <= 768 : false;

useEffect(() => {
cargarDatos();
}, []);

const textoSeguro = (valor) => String(valor || "").trim().toLowerCase();

const cargarDatos = async () => {
try {
setCargando(true);

const { data: userData, error: userError } = await supabase.auth.getUser();

if (userError) {
console.error("Error obteniendo usuario autenticado:", userError);
return;
}

const user = userData?.user || null;
setUsuario(user);

if (!user?.email) {
setProveedor(null);
setRequerimientos([]);
setCotizacionesEnviadas([]);
return;
}

const { data: proveedorData, error: proveedorError } = await supabase
.from("proveedores")
.select("*")
.eq("email", user.email)
.maybeSingle();

if (proveedorError) {
console.error("Error cargando proveedor:", proveedorError);
return;
}

setProveedor(proveedorData || null);

if (!proveedorData?.sector) {
setRequerimientos([]);
setCotizacionesEnviadas([]);
return;
}

const { data: requerimientosData, error: requerimientosError } =
await supabase
.from("requerimientos")
.select("*")
.eq("sector", proveedorData.sector)
.order("created_at", { ascending: false });

if (requerimientosError) {
console.error("Error cargando requerimientos:", requerimientosError);
return;
}

setRequerimientos(requerimientosData || []);

const { data: cotizacionesData, error: cotizacionesError } =
await supabase
.from("cotizaciones")
.select("*")
.eq("email", user.email)
.order("created_at", { ascending: false });

if (cotizacionesError) {
console.error("Error cargando cotizaciones del proveedor:", cotizacionesError);
setCotizacionesEnviadas([]);
} else {
setCotizacionesEnviadas(cotizacionesData || []);
}
} catch (error) {
console.error("Error general cargando oportunidades:", error);
} finally {
setCargando(false);
}
};

const yaFueCotizado = (req) => {
return cotizacionesEnviadas.some((c) => {
const coincidePorId =
String(c.requerimiento_id || "") === String(req.id || "");
const coincidePorNombre =
textoSeguro(c.requerimiento_nombre) ===
textoSeguro(req.nombre_requerimiento);

return coincidePorId || coincidePorNombre;
});
};

const requerimientosFiltrados = useMemo(() => {
let lista = [...requerimientos];

if (busqueda.trim()) {
const q = textoSeguro(busqueda);

lista = lista.filter((r) => {
const campos = [
r.nombre_requerimiento,
r.descripcion,
r.sector,
r.categoria,
r.cobertura,
r.pais,
r.provincia,
r.ciudad,
]
.map((x) => textoSeguro(x))
.join(" ");

return campos.includes(q);
});
}

return lista;
}, [requerimientos, busqueda]);

const abrirFormularioCotizacion = (req) => {
navigate(`/enviar-cotizacion/${req.id}`, {
state: {
requerimiento: req,
},
});
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
border: "1px solid rgba(249, 115, 22, 0.16)",
marginBottom: "20px",
position: "relative",
overflow: "hidden",
};

const cardSecundaria = {
background: "#f8f5ef",
borderRadius: "20px",
padding: isMobile ? "20px 16px" : "24px",
boxShadow: "0 12px 26px rgba(0,0,0,0.18)",
border: "1px solid rgba(31,53,82,0.10)",
};

const cardItem = {
background: "white",
border: "1px solid #e5e7eb",
borderRadius: "16px",
padding: "18px",
boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
display: "flex",
flexDirection: "column",
justifyContent: "space-between",
minHeight: "330px",
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
background: "linear-gradient(135deg, #f97316, #ea580c)",
color: "white",
border: "none",
padding: "12px 16px",
borderRadius: "12px",
cursor: "pointer",
fontWeight: "700",
fontSize: "14px",
boxShadow: "0 8px 16px rgba(249,115,22,0.20)",
width: "100%",
};

const botonDeshabilitado = {
background: "#d1d5db",
color: "#4b5563",
border: "none",
padding: "12px 16px",
borderRadius: "12px",
cursor: "not-allowed",
fontWeight: "700",
fontSize: "14px",
width: "100%",
};

const inputStyle = {
width: "100%",
padding: "13px 14px",
borderRadius: "12px",
border: "1px solid #d1d5db",
boxSizing: "border-box",
fontSize: "14px",
backgroundColor: "white",
color: "#111827",
};

const badgeEnviada = {
display: "inline-block",
padding: "6px 10px",
borderRadius: "999px",
backgroundColor: "#d1fae5",
color: "#065f46",
fontSize: "12px",
fontWeight: "700",
};

if (cargando) {
return (
<div style={cardSecundaria}>
<button onClick={() => navigate("/panel-proveedor")} style={botonVolver}>
← Volver al panel proveedor
</button>
<p>Cargando oportunidades...</p>
</div>
);
}

if (!usuario) {
return (
<div style={cardSecundaria}>
<button onClick={() => navigate("/panel-proveedor")} style={botonVolver}>
← Volver al panel proveedor
</button>
<h2 style={{ marginTop: 0 }}>Oportunidades</h2>
<p>Debes iniciar sesión como proveedor para ver oportunidades.</p>
</div>
);
}

return (
<div style={paginaStyle}>
<button onClick={() => navigate("/panel-proveedor")} style={botonVolver}>
← Volver al panel proveedor
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
"radial-gradient(circle, rgba(249,115,22,0.18) 0%, rgba(249,115,22,0) 72%)",
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
Oportunidades
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
Requerimientos disponibles para tu sector
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
Aquí ves requerimientos alineados a tu sector principal. Desde aquí
puedes enviar tu cotización formal para alimentar el comparativo del comprador.
</p>

<div
style={{
marginTop: "14px",
display: "flex",
flexWrap: "wrap",
gap: "10px",
}}
>
<span
style={{
padding: "6px 10px",
borderRadius: "999px",
backgroundColor: "#dbeafe",
color: "#1d4ed8",
fontSize: "12px",
fontWeight: "700",
}}
>
Sector del proveedor: {proveedor?.sector || "No definido"}
</span>
</div>
</div>

<div style={{ ...cardSecundaria, marginBottom: "18px" }}>
<input
type="text"
placeholder="Buscar por nombre del requerimiento, sector, categoría o descripción"
value={busqueda}
onChange={(e) => setBusqueda(e.target.value)}
style={inputStyle}
/>
</div>

{requerimientosFiltrados.length > 0 ? (
<div
style={{
display: "grid",
gridTemplateColumns: isMobile
? "1fr"
: "repeat(auto-fit, minmax(300px, 1fr))",
gap: "14px",
}}
>
{requerimientosFiltrados.map((r) => {
const enviada = yaFueCotizado(r);

return (
<div key={r.id} style={cardItem}>
<div>
<div
style={{
display: "flex",
justifyContent: "space-between",
alignItems: "flex-start",
gap: "10px",
marginBottom: "10px",
}}
>
<h3
style={{
margin: 0,
color: "#1f3552",
fontSize: "20px",
fontWeight: "700",
}}
>
{r.nombre_requerimiento || "Requerimiento sin nombre"}
</h3>

{enviada ? <span style={badgeEnviada}>Cotización enviada</span> : null}
</div>

<p style={{ margin: "0 0 8px 0", color: "#5b6472" }}>
<strong>Sector:</strong> {r.sector || "No definido"}
</p>

<p style={{ margin: "0 0 8px 0", color: "#5b6472" }}>
<strong>Categoría:</strong> {r.categoria || "No definida"}
</p>

<p style={{ margin: "0 0 8px 0", color: "#5b6472" }}>
<strong>Cobertura:</strong> {r.cobertura || "No definida"}
</p>

<p style={{ margin: "0 0 8px 0", color: "#5b6472" }}>
<strong>Ubicación:</strong>{" "}
{[r.pais, r.provincia, r.ciudad].filter(Boolean).join(" | ") ||
"No definida"}
</p>

{r.descripcion ? (
<p
style={{
margin: "10px 0 0 0",
color: "#5b6472",
lineHeight: 1.6,
}}
>
<strong>Detalle:</strong> {r.descripcion}
</p>
) : null}

{r.archivo_nombre ? (
<p style={{ margin: "10px 0 0 0", color: "#5b6472" }}>
<strong>Archivo:</strong>{" "}
{r.archivo_url ? (
<a href={r.archivo_url} target="_blank" rel="noreferrer">
{r.archivo_nombre}
</a>
) : (
r.archivo_nombre
)}
</p>
) : null}
</div>

<div style={{ marginTop: "16px" }}>
<p
style={{
margin: "0 0 10px 0",
fontSize: "12px",
color: "#6b7280",
}}
>
{r.created_at
? `Publicado: ${new Date(r.created_at).toLocaleString()}`
: ""}
</p>

{enviada ? (
<button disabled style={botonDeshabilitado}>
Cotización ya enviada
</button>
) : (
<button
onClick={() => abrirFormularioCotizacion(r)}
style={botonPrincipal}
>
Enviar cotización
</button>
)}
</div>
</div>
);
})}
</div>
) : (
<div style={cardSecundaria}>
<p style={{ margin: 0, fontWeight: "700" }}>
No hay oportunidades disponibles para este criterio.
</p>
<p style={{ margin: "6px 0 0 0", color: "#6b7280" }}>
Puede que todavía no existan requerimientos abiertos en tu sector o que tu búsqueda no tenga coincidencias.
</p>
</div>
)}
</div>
);
}

export default Oportunidades;