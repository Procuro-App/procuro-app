import { useLanguage } from "../LanguageContext";
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

if (!requerimientosError) {
setTotalRequerimientos(requerimientosCount || 0);
}

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
"linear-gradient(135deg, rgba(245, 201, 136, 0.98), rgba(242, 230, 213, 0.96))",
padding: isMobile ? "24px 18px" : "34px 36px",
borderRadius: "26px",
marginBottom: "28px",
boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
border: "1px solid rgba(249,115,22,0.14)",
};

const quickCardStyle = {
background: "white",
padding: "20px",
borderRadius: "18px",
boxShadow: "0 10px 20px rgba(0,0,0,0.14)",
border: "1px solid rgba(31,53,82,0.08)",
};

const sectionCardStyle = {
background: "rgba(246, 228, 203, 0.98)",
padding: isMobile ? "22px 18px" : "26px",
borderRadius: "22px",
boxShadow: "0 14px 28px rgba(0,0,0,0.18)",
border: "1px solid rgba(31,53,82,0.10)",
marginBottom: "24px",
};

const featureCardStyle = {
background: "white",
padding: "22px",
borderRadius: "16px",
boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
border: "1px solid #e5e7eb",
};

const accesoCardStyle = {
background: "white",
padding: "22px",
borderRadius: "16px",
boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
border: "1px solid #e5e7eb",
display: "flex",
flexDirection: "column",
justifyContent: "space-between",
minHeight: isMobile ? "unset" : "210px",
};

const btnBase = {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
textDecoration: "none",
color: "white",
padding: "12px 14px",
borderRadius: "10px",
fontWeight: "600",
marginTop: "16px",
boxShadow: "0 8px 16px rgba(0,0,0,0.14)",
};
const { language } = useLanguage();

const textos = {
es: {
badge: "Marketplace B2B",
titulo: "Compras más claras. Proveedores más visibles.",
subtitulo:
"PROCURO conecta compradores con proveedores reales, organizando la búsqueda, la solicitud formal y la comparación de ofertas dentro de un mismo entorno.",

proveedores: "Proveedores",
proveedoresDesc: "Empresas registradas en la plataforma",
requerimientos: "Requerimientos",
requerimientosDesc: "Solicitudes publicadas por compradores",
cotizaciones: "Cotizaciones",
cotizacionesDesc: "Flujo formal ya habilitado",

quePuedesHacer: "¿Qué puedes hacer?",
encontrarProveedores: "Encontrar proveedores",
encontrarProveedoresDesc:
"Filtra y encuentra opciones alineadas a tu necesidad real.",
publicarRequerimientos: "Publicar requerimientos",
publicarRequerimientosDesc:
"Genera solicitudes con contexto, orden y trazabilidad.",
compararCotizaciones: "Comparar cotizaciones",
compararCotizacionesDesc:
"Evalúa propuestas de forma simple, visual y útil para decidir.",

eligeComoEntrar: "Elige cómo quieres entrar",
soyComprador: "Soy comprador",
soyCompradorDesc: "Encuentra y compara proveedores con criterio.",
soyProveedor: "Soy proveedor",
soyProveedorDesc: "Recibe oportunidades reales de negocio.",
explorarProveedores: "Explorar proveedores",
explorarProveedoresDesc:
"Descubre proveedores por sector, cobertura y alcance.",
entrar: "Entrar",
explorar: "Explorar",

soporteTitulo: "Soporte y contacto",
soporteTexto:
"Si necesitas ayuda, tienes alguna sugerencia o deseas solicitar la eliminación de tu cuenta, puedes escribirnos directamente.",
soporteCanal:
"Este canal aplica para soporte técnico, consultas generales, sugerencias y solicitud de eliminación de cuenta.",
},
en: {
badge: "B2B Marketplace",
titulo: "Clearer purchasing. More visible suppliers.",
subtitulo:
"PROCURO connects buyers with real suppliers, organizing search, formal requests, and quotation comparison within a single environment.",

proveedores: "Suppliers",
proveedoresDesc: "Companies registered on the platform",
requerimientos: "Requests",
requerimientosDesc: "Requests published by buyers",
cotizaciones: "Quotations",
cotizacionesDesc: "Formal workflow already enabled",

quePuedesHacer: "What can you do?",
encontrarProveedores: "Find suppliers",
encontrarProveedoresDesc:
"Filter and find options aligned with your real need.",
publicarRequerimientos: "Publish requests",
publicarRequerimientosDesc:
"Create requests with context, order, and traceability.",
compararCotizaciones: "Compare quotations",
compararCotizacionesDesc:
"Evaluate proposals in a simple, visual, and useful way to decide.",

eligeComoEntrar: "Choose how you want to enter",
soyComprador: "I am a buyer",
soyCompradorDesc: "Find and compare suppliers with criteria.",
soyProveedor: "I am a supplier",
soyProveedorDesc: "Receive real business opportunities.",
explorarProveedores: "Explore suppliers",
explorarProveedoresDesc:
"Discover suppliers by sector, coverage, and scope.",
entrar: "Enter",
explorar: "Explore",

soporteTitulo: "Support and contact",
soporteTexto:
"If you need help, have suggestions, or want to request account deletion, you can write to us directly.",
soporteCanal:
"This channel applies to technical support, general inquiries, suggestions, and account deletion requests.",
},
};
return (
<div
style={{
padding: isMobile ? "14px" : "30px",
background: "linear-gradient(135deg, #111827, #1f2937, #1f3552)",
minHeight: "100vh",
}}
>
<div style={heroCardStyle}>
<p
style={{
margin: 0,
color: "#f97316",
fontSize: "12px",
fontWeight: "600",
letterSpacing: "1px",
textTransform: "uppercase",
}}
>
{textos[language].badge}
</p>

<h1
style={{
marginTop: "12px",
marginBottom: "10px",
color: "#1f3552",
fontSize: isMobile ? "22px" : "28px",
lineHeight: 1.4,
fontWeight: "600",
maxWidth: "800px",
}}
>
{textos[language].titulo}
</h1>

<p
style={{
color: "#374151",
fontSize: isMobile ? "14px" : "16px",
lineHeight: 1.6,
maxWidth: "800px",
marginBottom: 0,
}}
>
{textos[language].subtitulo}
</p>
</div>

<div
style={{
display: "grid",
gridTemplateColumns: isMobile
? "1fr"
: "repeat(auto-fit, minmax(200px, 1fr))",
gap: "16px",
marginBottom: "28px",
}}
>
<div style={quickCardStyle}>
<p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
{textos[language].proveedores}
</p>
<h2 style={{ margin: "6px 0", color: "#111827" }}>
{totalProveedores}
</h2>
<p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
{textos[language].proveedoresDesc}
</p>
</div>
<div style={quickCardStyle}>
<p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
{textos[language].requerimientos}
</p>
<h2 style={{ margin: "6px 0", color: "#111827" }}>
{totalRequerimientos}
</h2>
<p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
{textos[language].requerimientosDesc}
</p>
</div>

<div style={quickCardStyle}>
<p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
{textos[language].cotizaciones}
</p>
<h2 style={{ margin: "6px 0", color: "#111827" }}>
{totalCotizaciones}
</h2>
<p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
{textos[language].cotizacionesDesc}
</p>
</div>
</div>

<div style={sectionCardStyle}>
<h2
style={{
fontSize: isMobile ? "20px" : "22px",
fontWeight: "600",
color: "#1f3552",
marginTop: 0,
}}
>
{textos[language].quePuedesHacer}
</h2>
<div
style={{
display: "grid",
gridTemplateColumns: isMobile
? "1fr"
: "repeat(auto-fit, minmax(250px, 1fr))",
gap: "16px",
}}
>
<div style={featureCardStyle}>
<h3
style={{
marginTop: 0,
marginBottom: "8px",
color: "#1f3552",
fontWeight: "600",
}}
>
{textos[language].encontrarProveedores}
</h3>
<p
style={{
margin: 0,
fontSize: "14px",
color: "#6b7280",
lineHeight: 1.6,
}}
>
{textos[language].encontrarProveedoresDesc}
</p>
</div>

<div style={featureCardStyle}>
<h3
style={{
marginTop: 0,
marginBottom: "8px",
color: "#1f3552",
fontWeight: "600",
}}
>
{textos[language].publicarRequerimientos}
</h3>
<p
style={{
margin: 0,
fontSize: "14px",
color: "#6b7280",
lineHeight: 1.6,
}}
>
{textos[language].publicarRequerimientosDesc}
</p>
</div>

<div style={featureCardStyle}>
<h3
style={{
marginTop: 0,
marginBottom: "8px",
color: "#1f3552",
fontWeight: "600",
}}
>
{textos[language].compararCotizaciones}
</h3>
<p
style={{
margin: 0,
fontSize: "14px",
color: "#6b7280",
lineHeight: 1.6,
}}
>
{textos[language].compararCotizacionesDesc}
</p>
</div>
</div>
</div>

<div style={sectionCardStyle}>
<h2
style={{
fontSize: isMobile ? "20px" : "22px",
fontWeight: "600",
color: "#1f3552",
marginTop: 0,
}}
>
{textos[language].eligeComoEntrar}
</h2>

<div
style={{
display: "grid",
gridTemplateColumns: isMobile
? "1fr"
: "repeat(auto-fit, minmax(250px, 1fr))",
gap: "16px",
}}
>
<div style={accesoCardStyle}>
<div>
<h3
style={{
fontWeight: "600",
marginTop: 0,
marginBottom: "8px",
color: "#1f3552",
}}
>
{textos[language].soyComprador}
</h3>
<p
style={{
fontSize: "14px",
color: "#6b7280",
lineHeight: 1.6,
margin: 0,
}}
>
{textos[language].soyCompradorDesc}
</p>
</div>

<a
href="/acceso-comprador"
style={{
...btnBase,
background: "#1f3552",
}}
>
Entrar
</a>
</div>

<div style={accesoCardStyle}>
<div>
<h3
style={{
fontWeight: "600",
marginTop: 0,
marginBottom: "8px",
color: "#1f3552",
}}
>
{textos[language].soyProveedor}
</h3>
<p
style={{
fontSize: "14px",
color: "#6b7280",
lineHeight: 1.6,
margin: 0,
}}
>
{textos[language].soyProveedorDesc}
</p>
</div>

<a
href="/acceso-proveedor"
style={{
...btnBase,
background: "#f97316",
}}
>
{textos[language].entrar}
</a>
</div>

<div style={accesoCardStyle}>
<div>
<h3
style={{
fontWeight: "600",
marginTop: 0,
marginBottom: "8px",
color: "#1f3552",
}}
>
{textos[language].explorarProveedores}
</h3>
<p
style={{
fontSize: "14px",
color: "#6b7280",
lineHeight: 1.6,
margin: 0,
}}
>
{textos[language].explorarProveedoresDesc}
</p>
</div>

<a
href="/proveedores"
style={{
...btnBase,
background: "#2563eb",
}}
>
{textos[language].explorar}
</a>
</div>
</div>
</div>

<div style={sectionCardStyle}>
<h2
style={{
color: "#1f3552",
marginTop: 0,
marginBottom: "10px",
fontSize: isMobile ? "20px" : "22px",
fontWeight: "600",
}}
>
{textos[language].soporteTitulo}
</h2>

<p
style={{
color: "#4b5563",
marginBottom: "12px",
fontSize: isMobile ? "14px" : "16px",
lineHeight: 1.7,
}}
>
{textos[language].soporteTexto}
</p>

<a
href="mailto:soporte.procuroapp@gmail.com"
style={{
display: "inline-block",
color: "#2563eb",
fontWeight: "700",
fontSize: isMobile ? "15px" : "17px",
textDecoration: "none",
marginBottom: "10px",
}}
>
soporte.procuroapp@gmail.com
</a>

<p
style={{
color: "#6b7280",
fontSize: "14px",
lineHeight: 1.6,
marginBottom: 0,
}}
>
{textos[language].soporteCanal}
</p>
</div>
</div>
);
}

export default Home;