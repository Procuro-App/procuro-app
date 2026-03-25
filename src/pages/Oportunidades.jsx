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

const botonVolver = {
marginBottom: "16px",
backgroundColor: "#e5e7eb",
border: "none",
padding: "8px 12px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold",
};

const botonPrincipal = {
background: "linear-gradient(135deg, #f97316, #ea580c)",
color: "white",
border: "none",
padding: "12px 16px",
borderRadius: "10px",
cursor: "pointer",
fontWeight: "bold",
fontSize: "14px",
boxShadow: "0 6px 14px rgba(249,115,22,0.28)",
width: "100%",
};

const botonDeshabilitado = {
background: "#d1d5db",
color: "#4b5563",
border: "none",
padding: "12px 16px",
borderRadius: "10px",
cursor: "not-allowed",
fontWeight: "bold",
fontSize: "14px",
width: "100%",
};

const badgeEnviada = {
display: "inline-block",
padding: "6px 10px",
borderRadius: "999px",
backgroundColor: "#d1fae5",
color: "#065f46",
fontSize: "12px",
fontWeight: "bold",
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
<div>
<button onClick={() => navigate("/panel-proveedor")} style={botonVolver}>
← Volver al panel proveedor
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
Oportunidades
</p>

<h1
style={{
margin: "8px 0 0 0",
fontSize: "30px",
color: "#1f3552",
fontWeight: "800",
}}
>
Requerimientos disponibles para tu sector
</h1>

<p
style={{
marginTop: "8px",
marginBottom: 0,
color: "#5b6472",
lineHeight: 1.5,
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
fontWeight: "bold",
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
style={{
width: "100%",
padding: "12px",
borderRadius: "10px",
border: "1px solid #ccc",
}}
/>
</div>

{requerimientosFiltrados.length > 0 ? (
<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
gap: "14px",
}}
>
{requerimientosFiltrados.map((r) => {
const enviada = yaFueCotizado(r);

return (
<div
key={r.id}
style={{
...cardSecundaria,
display: "flex",
flexDirection: "column",
justifyContent: "space-between",
minHeight: "320px",
}}
>
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
<p style={{ margin: "10px 0 0 0", color: "#5b6472", lineHeight: 1.55 }}>
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
<p style={{ margin: 0, fontWeight: "bold" }}>
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
