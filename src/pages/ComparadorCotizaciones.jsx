import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function ComparadorCotizaciones() {
const navigate = useNavigate();

const [usuario, setUsuario] = useState(null);
const [requerimientos, setRequerimientos] = useState([]);
const [cotizaciones, setCotizaciones] = useState([]);
const [requerimientoSeleccionado, setRequerimientoSeleccionado] = useState("");
const [cargando, setCargando] = useState(true);

useEffect(() => {
cargarDatosComprador();
}, []);

const cargarDatosComprador = async () => {
try {
setCargando(true);

const { data: userData, error: userError } = await supabase.auth.getUser();

if (userError) {
console.error("Error obteniendo comprador autenticado:", userError);
setCargando(false);
return;
}

const user = userData?.user || null;
setUsuario(user);

if (!user?.id) {
setCargando(false);
return;
}

const { data: requerimientosData, error: requerimientosError } =
await supabase
.from("requerimientos")
.select("*")
.eq("comprador_user_id", user.id)
.order("created_at", { ascending: false });

if (requerimientosError) {
console.error("Error cargando requerimientos:", requerimientosError);
setCargando(false);
return;
}

const idsRequerimientos = (requerimientosData || [])
.map((r) => r.id)
.filter(Boolean);

const nombresRequerimientos = (requerimientosData || [])
.map((r) => r.nombre_requerimiento)
.filter(Boolean);

let cotizacionesData = [];

if (idsRequerimientos.length > 0) {
const { data, error } = await supabase
.from("cotizaciones")
.select("*")
.in("requerimiento_id", idsRequerimientos)
.order("created_at", { ascending: false });

if (!error) {
cotizacionesData = data || [];
}
}

if (cotizacionesData.length === 0 && nombresRequerimientos.length > 0) {
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
console.error("Error general cargando comparativo:", error);
} finally {
setCargando(false);
}
};

const cotizacionesFiltradas = useMemo(() => {
if (!requerimientoSeleccionado) return [];

return cotizaciones.filter(
(c) => c.requerimiento_nombre === requerimientoSeleccionado
);
}, [cotizaciones, requerimientoSeleccionado]);

const convertirANumero = (valor) => {
if (valor === null || valor === undefined || valor === "") return null;

const limpio = String(valor)
.replace(/[^\d.,]/g, "")
.replace(/,/g, "");

const numero = Number(limpio);

return Number.isNaN(numero) ? null : numero;
};

const cotizacionesConAnalisis = useMemo(() => {
const conValor = cotizacionesFiltradas.map((c) => ({
...c,
valorNumerico: convertirANumero(c.valor_referencial),
}));

const valoresValidos = conValor
.map((c) => c.valorNumerico)
.filter((v) => v !== null)
.sort((a, b) => a - b);

if (valoresValidos.length === 0) return conValor;

const minimo = valoresValidos[0];
const maximo = valoresValidos[valoresValidos.length - 1];

return conValor.map((c) => {
if (c.valorNumerico === null) {
return { ...c, nivelPrecio: "sin-dato" };
}

if (c.valorNumerico === minimo) {
return { ...c, nivelPrecio: "mejor" };
}

if (c.valorNumerico === maximo && maximo !== minimo) {
return { ...c, nivelPrecio: "alto" };
}

return { ...c, nivelPrecio: "medio" };
});
}, [cotizacionesFiltradas]);

const obtenerEstiloNivel = (nivel) => {
if (nivel === "mejor") {
return {
backgroundColor: "#d1fae5",
color: "#065f46",
texto: "🟢 Mejor precio",
};
}

if (nivel === "medio") {
return {
backgroundColor: "#fef3c7",
color: "#92400e",
texto: "🟡 Precio intermedio",
};
}

if (nivel === "alto") {
return {
backgroundColor: "#fee2e2",
color: "#991b1b",
texto: "🔴 Precio más alto",
};
}

return {
backgroundColor: "#e5e7eb",
color: "#374151",
texto: "Sin dato comparable",
};
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
<p>Cargando comparativo de cotizaciones...</p>
</div>
);
}

if (!usuario) {
return (
<div style={cardSecundaria}>
<h2>Comparativo de cotizaciones</h2>
<p>Debes iniciar sesión como comprador para ver tu comparativo.</p>

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
fontWeight: "bold",
}}
>
Ir a acceso comprador
</Link>
</div>
);
}

return (
<div>
<button
onClick={() => navigate("/panel-comprador")}
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
← Volver al dashboard
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
Comparativo
</p>

<h1
style={{
margin: "8px 0 0 0",
fontSize: "30px",
color: "#1f3552",
fontWeight: "800",
}}
>
Comparativo de cotizaciones
</h1>

<p
style={{
marginTop: "8px",
marginBottom: 0,
color: "#5b6472",
lineHeight: 1.5,
}}
>
Selecciona un requerimiento para comparar cotizaciones recibidas y
detectar rápidamente cuál oferta está más alta, más baja o en nivel intermedio.
</p>
</div>

<div style={{ ...cardSecundaria, marginBottom: "18px" }}>
<select
value={requerimientoSeleccionado}
onChange={(e) => setRequerimientoSeleccionado(e.target.value)}
style={{
width: "100%",
padding: "12px",
borderRadius: "10px",
border: "1px solid #ccc",
}}
>
<option value="">Selecciona un requerimiento</option>
{requerimientos.map((r) => (
<option key={r.id} value={r.nombre_requerimiento}>
{r.nombre_requerimiento}
</option>
))}
</select>
</div>

{!requerimientoSeleccionado ? (
<div style={cardSecundaria}>
<p style={{ margin: 0 }}>
Selecciona un requerimiento para visualizar el comparativo.
</p>
</div>
) : (
<>
<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
gap: "12px",
marginBottom: "18px",
}}
>
<div style={miniCard}>
<p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>
Cotizaciones encontradas
</p>
<p
style={{
margin: "6px 0 0 0",
fontSize: "26px",
fontWeight: "800",
color: "#1f3552",
}}
>
{cotizacionesConAnalisis.length}
</p>
</div>

<div style={miniCard}>
<p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>
Mejor precio
</p>
<p
style={{
margin: "6px 0 0 0",
fontSize: "26px",
fontWeight: "800",
color: "#166534",
}}
>
{
cotizacionesConAnalisis.filter((c) => c.nivelPrecio === "mejor")
.length
}
</p>
</div>

<div style={miniCard}>
<p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>
Precios altos
</p>
<p
style={{
margin: "6px 0 0 0",
fontSize: "26px",
fontWeight: "800",
color: "#991b1b",
}}
>
{
cotizacionesConAnalisis.filter((c) => c.nivelPrecio === "alto")
.length
}
</p>
</div>
</div>

<div style={{ ...cardSecundaria, marginBottom: "18px" }}>
{cotizacionesConAnalisis.length > 0 ? (
<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
gap: "14px",
}}
>
{cotizacionesConAnalisis.map((c) => {
const nivel = obtenerEstiloNivel(c.nivelPrecio);

return (
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
{c.proveedor_nombre || "Proveedor no especificado"}
</h3>

<p
style={{
margin: "6px 0 0 0",
color: "#6b7280",
fontSize: "14px",
}}
>
{c.requerimiento_nombre}
</p>
</div>

<span
style={{
backgroundColor: nivel.backgroundColor,
color: nivel.color,
padding: "6px 10px",
borderRadius: "999px",
fontSize: "12px",
fontWeight: "bold",
display: "inline-block",
}}
>
{nivel.texto}
</span>
</div>

<div
style={{
display: "grid",
gap: "6px",
marginBottom: "12px",
}}
>
<p style={{ margin: 0 }}>
<strong>Estado:</strong> {c.estado || "No especificado"}
</p>

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
<strong>Teléfono:</strong>{" "}
{c.telefono || "No especificado"}
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
Ver archivo
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
);
})}
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
No hay cotizaciones para este requerimiento.
</p>
<p style={{ margin: "6px 0 0 0", color: "#6b7280" }}>
Cuando los proveedores envíen ofertas formales, aparecerán aquí
para su análisis comparativo.
</p>
</div>
)}
</div>
</>
)}
</div>
);
}

export default ComparadorCotizaciones;