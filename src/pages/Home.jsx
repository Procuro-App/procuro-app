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
Marketplace B2B
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
Compras más claras. Proveedores más visibles.
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
PROCURO conecta compradores con proveedores reales, organizando la
búsqueda, la solicitud formal y la comparación de ofertas dentro de un
mismo entorno.
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
Proveedores
</p>
<h2 style={{ margin: "6px 0", color: "#111827" }}>
{totalProveedores}
</h2>
<p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
Empresas registradas en la plataforma
</p>
</div>

<div style={quickCardStyle}>
<p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
Requerimientos
</p>
<h2 style={{ margin: "6px 0", color: "#111827" }}>
{totalRequerimientos}
</h2>
<p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
Solicitudes publicadas por compradores
</p>
</div>

<div style={quickCardStyle}>
<p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
Cotizaciones
</p>
<h2 style={{ margin: "6px 0", color: "#111827" }}>
{totalCotizaciones}
</h2>
<p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
Flujo formal ya habilitado
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
¿Qué puedes hacer?
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
Encontrar proveedores
</h3>
<p
style={{
margin: 0,
fontSize: "14px",
color: "#6b7280",
lineHeight: 1.6,
}}
>
Filtra y encuentra opciones alineadas a tu necesidad real.
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
Publicar requerimientos
</h3>
<p
style={{
margin: 0,
fontSize: "14px",
color: "#6b7280",
lineHeight: 1.6,
}}
>
Genera solicitudes con contexto, orden y trazabilidad.
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
Comparar cotizaciones
</h3>
<p
style={{
margin: 0,
fontSize: "14px",
color: "#6b7280",
lineHeight: 1.6,
}}
>
Evalúa propuestas de forma simple, visual y útil para decidir.
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
Elige cómo quieres entrar
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
Soy comprador
</h3>
<p
style={{
fontSize: "14px",
color: "#6b7280",
lineHeight: 1.6,
margin: 0,
}}
>
Encuentra y compara proveedores con criterio.
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
Soy proveedor
</h3>
<p
style={{
fontSize: "14px",
color: "#6b7280",
lineHeight: 1.6,
margin: 0,
}}
>
Recibe oportunidades reales de negocio.
</p>
</div>

<a
href="/acceso-proveedor"
style={{
...btnBase,
background: "#f97316",
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
Explorar proveedores
</h3>
<p
style={{
fontSize: "14px",
color: "#6b7280",
lineHeight: 1.6,
margin: 0,
}}
>
Descubre proveedores por sector, cobertura y alcance.
</p>
</div>

<a
href="/proveedores"
style={{
...btnBase,
background: "#2563eb",
}}
>
Explorar
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
Soporte y contacto
</h2>

<p
style={{
color: "#4b5563",
marginBottom: "12px",
fontSize: isMobile ? "14px" : "16px",
lineHeight: 1.7,
}}
>
Si necesitas ayuda, tienes alguna sugerencia o deseas solicitar la
eliminación de tu cuenta, puedes escribirnos directamente.
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
Este canal aplica para soporte técnico, consultas generales,
sugerencias y solicitud de eliminación de cuenta.
</p>
</div>
</div>
);
}

export default Home;