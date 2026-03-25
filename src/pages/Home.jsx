import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";

function Home() {
const [totalProveedores, setTotalProveedores] = useState(0);
const [totalRequerimientos, setTotalRequerimientos] = useState(0);
const [totalCotizaciones, setTotalCotizaciones] = useState(0);

const isMobile =
typeof window !== "undefined" ? window.innerWidth <= 768 : false;

useEffect(() => {
cargarResumen();
}, []);

const cargarResumen = async () => {
try {
const { count: proveedoresCount, error: proveedoresError } = await supabase
.from("proveedores")
.select("*", { count: "exact", head: true });

if (!proveedoresError) setTotalProveedores(proveedoresCount || 0);

const { count: requerimientosCount, error: requerimientosError } =
await supabase
.from("requerimientos")
.select("*", { count: "exact", head: true });

if (!requerimientosError)
setTotalRequerimientos(requerimientosCount || 0);

const { count: cotizacionesCount, error: cotizacionesError } =
await supabase
.from("cotizaciones")
.select("*", { count: "exact", head: true });

if (!cotizacionesError) setTotalCotizaciones(cotizacionesCount || 0);
} catch (error) {
console.error("Error general cargando resumen del home:", error);
}
};

const heroCardStyle = {
background:
"linear-gradient(135deg, rgba(245, 192, 112, 0.98), rgba(241,233,221,0.96))",
padding: isMobile ? "24px 18px" : "36px 40px",
borderRadius: "26px",
marginBottom: "28px",
boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
border: "1px solid rgba(249,115,22,0.16)",
position: "relative",
overflow: "hidden",
};

const quickCardStyle = {
background: "rgba(247, 241, 231, 0.98)",
padding: isMobile ? "18px" : "22px",
borderRadius: "20px",
boxShadow: "0 10px 20px rgba(0,0,0,0.14)",
border: "1px solid rgba(31,53,82,0.08)",
};

const sectionCardStyle = {
background: "rgba(244, 209, 157, 0.98)",
padding: isMobile ? "22px 18px" : "28px",
borderRadius: "22px",
boxShadow: "0 14px 28px rgba(0,0,0,0.18)",
border: "1px solid rgba(31,53,82,0.10)",
marginBottom: "24px",
};

const featureCardStyle = {
background: "white",
padding: isMobile ? "18px" : "24px",
borderRadius: "18px",
boxShadow: "0 8px 22px rgba(0,0,0,0.10)",
border: "1px solid #e5e7eb",
};

const accesoCardStyle = {
background: "white",
padding: isMobile ? "18px" : "22px",
borderRadius: "18px",
boxShadow: "0 8px 22px rgba(0,0,0,0.10)",
border: "1px solid #e5e7eb",
display: "flex",
flexDirection: "column",
justifyContent: "space-between",
minHeight: "220px",
};

const btnBase = {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
textDecoration: "none",
color: "white",
padding: "12px 16px",
borderRadius: "12px",
fontWeight: "bold",
marginTop: "14px",
boxShadow: "0 8px 16px rgba(0,0,0,0.14)",
};

return (
<div
style={{
padding: isMobile ? "14px" : "30px",
background:
"linear-gradient(135deg, #111827 0%, #1f2937 38%, #1f3552 72%, #0f172a 100%)",
minHeight: "100vh",
}}
>
<div style={heroCardStyle}>
<div
style={{
position: "absolute",
top: "-40px",
right: "-30px",
width: "190px",
height: "190px",
background:
"radial-gradient(circle, rgba(249,115,22,0.18) 0%, rgba(249,115,22,0) 72%)",
pointerEvents: "none",
}}
/>

<div
style={{
position: "absolute",
left: "-30px",
bottom: "-40px",
width: "190px",
height: "190px",
background:
"radial-gradient(circle, rgba(37,99,235,0.14) 0%, rgba(37,99,235,0) 72%)",
pointerEvents: "none",
}}
/>

<p
style={{
margin: 0,
color: "#f97316",
fontSize: isMobile ? "12px" : "14px",
fontWeight: "800",
textTransform: "uppercase",
letterSpacing: "0.8px",
position: "relative",
zIndex: 1,
}}
>
Marketplace B2B
</p>

<h1
style={{
marginTop: "14px",
marginBottom: "14px",
color: "#1f3552",
fontSize: isMobile ? "15px" : "25px",
lineHeight: 1.12,
fontWeight: "800",
maxWidth: "980px",
position: "relative",
zIndex: 1,
}}
>
Compras más claras. Proveedores más visibles. Decisiones mejor conectadas.
</h1>

<p
style={{
marginTop: 0,
marginBottom: "12px",
color: "#374151",
fontSize: isMobile ? "15px" : "19px",
lineHeight: 1.7,
maxWidth: "980px",
position: "relative",
zIndex: 1,
}}
>
PROCURO es una plataforma pensada para que compradores encuentren
proveedores reales, clasificados y listos para cotizar dentro de una
estructura diseñada desde la lógica de compras.
</p>

<p
style={{
marginTop: 0,
marginBottom: 0,
color: "#4b5563",
fontSize: isMobile ? "14px" : "17px",
lineHeight: 1.7,
maxWidth: "980px",
position: "relative",
zIndex: 1,
}}
>
Aquí la búsqueda no empieza por improvisación ni termina solo en precio:
empieza por orden, visibilidad, comparación y criterio.
</p>
</div>

<div
style={{
display: "grid",
gridTemplateColumns: isMobile
? "1fr"
: "repeat(auto-fit, minmax(220px, 1fr))",
gap: "20px",
marginBottom: "28px",
}}
>
<div style={quickCardStyle}>
<p
style={{
margin: 0,
color: "#6b7280",
fontWeight: "bold",
fontSize: "13px",
textTransform: "uppercase",
}}
>
Proveedores
</p>
<h2
style={{
margin: "10px 0",
color: "#111827",
fontSize: isMobile ? "32px" : "38px",
}}
>
{totalProveedores}
</h2>
<p style={{ color: "#6b7280", marginBottom: 0 }}>
Empresas registradas en la plataforma
</p>
</div>

<div style={quickCardStyle}>
<p
style={{
margin: 0,
color: "#6b7280",
fontWeight: "bold",
fontSize: "13px",
textTransform: "uppercase",
}}
>
Requerimientos
</p>
<h2
style={{
margin: "10px 0",
color: "#111827",
fontSize: isMobile ? "32px" : "38px",
}}
>
{totalRequerimientos}
</h2>
<p style={{ color: "#6b7280", marginBottom: 0 }}>
Solicitudes publicadas por compradores
</p>
</div>

<div style={quickCardStyle}>
<p
style={{
margin: 0,
color: "#6b7280",
fontWeight: "bold",
fontSize: "13px",
textTransform: "uppercase",
}}
>
Cotizaciones
</p>
<h2
style={{
margin: "10px 0",
color: "#111827",
fontSize: isMobile ? "32px" : "38px",
}}
>
{totalCotizaciones}
</h2>
<p style={{ color: "#6b7280", marginBottom: 0 }}>
Flujo formal ya habilitado
</p>
</div>

<div style={quickCardStyle}>
<p
style={{
margin: 0,
color: "#6b7280",
fontWeight: "bold",
fontSize: "13px",
textTransform: "uppercase",
}}
>
Estado
</p>
<h2
style={{
margin: "10px 0",
color: "#111827",
fontSize: isMobile ? "26px" : "30px",
}}
>
MVP activo
</h2>
<p style={{ color: "#6b7280", marginBottom: 0 }}>
Estructura lista para seguir creciendo
</p>
</div>
</div>

<div style={sectionCardStyle}>
<h2
style={{
color: "#1f3552",
marginTop: 0,
fontSize: isMobile ? "24px" : "32px",
}}
>
¿Qué puedes hacer en PROCURO?
</h2>

<p
style={{
color: "#4b5563",
marginBottom: "22px",
fontSize: isMobile ? "14px" : "16px",
lineHeight: 1.7,
}}
>
Una experiencia pensada para ordenar la búsqueda, la solicitud formal y
la comparación de ofertas dentro de un mismo entorno.
</p>

<div
style={{
display: "grid",
gridTemplateColumns: isMobile
? "1fr"
: "repeat(auto-fit, minmax(250px, 1fr))",
gap: "18px",
}}
>
<div style={featureCardStyle}>
<h3 style={{ color: "#1f3552", marginTop: 0 }}>
1. Encontrar proveedores
</h3>
<p style={{ color: "#6b7280", lineHeight: 1.65 }}>
Filtra por cobertura, país, ciudad, sector y alcance para
encontrar opciones mejor alineadas a tu necesidad real.
</p>
</div>

<div style={featureCardStyle}>
<h3 style={{ color: "#1f3552", marginTop: 0 }}>
2. Publicar requerimientos
</h3>
<p style={{ color: "#6b7280", lineHeight: 1.65 }}>
Los compradores pueden cargar requerimientos y abrir oportunidades
con contexto, orden y trazabilidad.
</p>
</div>

<div style={featureCardStyle}>
<h3 style={{ color: "#1f3552", marginTop: 0 }}>
3. Comparar cotizaciones
</h3>
<p style={{ color: "#6b7280", lineHeight: 1.65 }}>
Revisa respuestas, compara precios y analiza ofertas desde un
comparativo simple, visual y útil para decidir.
</p>
</div>
</div>
</div>

<div style={sectionCardStyle}>
<h2
style={{
color: "#1f3552",
marginTop: 0,
fontSize: isMobile ? "24px" : "30px",
}}
>
Elige cómo quieres entrar
</h2>

<p
style={{
color: "#4b5563",
marginBottom: "22px",
fontSize: isMobile ? "14px" : "16px",
lineHeight: 1.7,
}}
>
PROCURO está hecho para que tanto compradores como proveedores encuentren
un espacio más claro, ordenado y útil para trabajar mejor.
</p>

<div
style={{
display: "grid",
gridTemplateColumns: isMobile
? "1fr"
: "repeat(auto-fit, minmax(250px, 1fr))",
gap: "18px",
}}
>
<div style={accesoCardStyle}>
<div>
<h3 style={{ color: "#1f3552", marginTop: 0 }}>
Soy comprador
</h3>
<p style={{ color: "#6b7280", lineHeight: 1.65 }}>
Encuentra proveedores con más criterio, menos improvisación y mejor
capacidad para comparar opciones.
</p>
</div>

<a
href="/acceso-comprador"
style={{
...btnBase,
background: "linear-gradient(135deg, #1f3552, #2563eb)",
}}
>
Entrar como comprador
</a>
</div>

<div style={accesoCardStyle}>
<div>
<h3 style={{ color: "#1f3552", marginTop: 0 }}>
Soy proveedor
</h3>
<p style={{ color: "#6b7280", lineHeight: 1.65 }}>
Haz visible tu oferta donde realmente nacen las oportunidades y
responde requerimientos con estructura.
</p>
</div>

<a
href="/acceso-proveedor"
style={{
...btnBase,
background: "linear-gradient(135deg, #f97316, #ea580c)",
}}
>
Entrar como proveedor
</a>
</div>

<div style={accesoCardStyle}>
<div>
<h3 style={{ color: "#1f3552", marginTop: 0 }}>
Explorar proveedores
</h3>
<p style={{ color: "#6b7280", lineHeight: 1.65 }}>
Descubre proveedores por sector, cobertura y alcance para empezar
a construir mejores decisiones de compra.
</p>
</div>

<a
href="/proveedores"
style={{
...btnBase,
background: "linear-gradient(135deg, #1f3552, #2563eb)",
}}
>
Explorar directorio
</a>
</div>
</div>
</div>
</div>
);
}

export default Home;