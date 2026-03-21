import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";

function Home() {
const [totalProveedores, setTotalProveedores] = useState(0);
const [totalRequerimientos, setTotalRequerimientos] = useState(0);
const [totalCotizaciones, setTotalCotizaciones] = useState(0);

useEffect(() => {
cargarResumen();
}, []);

const cargarResumen = async () => {
try {
const { count: proveedoresCount, error: proveedoresError } = await supabase
.from("proveedores")
.select("*", { count: "exact", head: true });

if (proveedoresError) {
console.error("Error contando proveedores:", proveedoresError);
} else {
setTotalProveedores(proveedoresCount || 0);
}

const { count: requerimientosCount, error: requerimientosError } = await supabase
.from("requerimientos")
.select("*", { count: "exact", head: true });

if (requerimientosError) {
console.error("Error contando requerimientos:", requerimientosError);
} else {
setTotalRequerimientos(requerimientosCount || 0);
}

const { count: cotizacionesCount, error: cotizacionesError } = await supabase
.from("cotizaciones")
.select("*", { count: "exact", head: true });

if (cotizacionesError) {
console.error("Error contando cotizaciones:", cotizacionesError);
} else {
setTotalCotizaciones(cotizacionesCount || 0);
}
} catch (error) {
console.error("Error general cargando resumen del home:", error);
}
};

const infoCardStyle = {
background: "white",
padding: "30px 34px",
borderRadius: "22px",
marginBottom: "28px",
boxShadow: "0 10px 28px rgba(0,0,0,0.08)",
borderLeft: "8px solid #3b82f6",
borderRight: "8px solid #f59e0b"
};

const quickCardStyle = {
background: "white",
padding: "22px",
borderRadius: "18px",
boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
borderTop: "4px solid #3b82f6",
borderRight: "3px solid #f59e0b"
};

const sectionCardStyle = {
background: "white",
padding: "24px",
borderRadius: "18px",
boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
borderRight: "4px solid #f59e0b"
};

const featureCardStyle = {
background: "white",
padding: "24px",
borderRadius: "18px",
boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
border: "1px solid #e5e7eb"
};

return (
<div
style={{
padding: "30px",
background: "linear-gradient(135deg, #f5f7fa, #e6eef8)",
minHeight: "100vh"
}}
>
{/* CARD PRINCIPAL DE TEXTO */}
<div style={infoCardStyle}>
<p
style={{
margin: 0,
color: "#3b82f6",
fontSize: "14px",
fontWeight: "bold",
textTransform: "uppercase",
letterSpacing: "0.6px"
}}
>
Marketplace B2B
</p>

<p
style={{
marginTop: "18px",
marginBottom: "16px",
color: "#1f3552",
fontSize: "24px",
lineHeight: 1.5,
fontWeight: "700",
maxWidth: "980px"
}}
>
Conectamos compradores con proveedores reales, clasificados y listos para cotizar.
</p>

<p
style={{
marginTop: 0,
marginBottom: "14px",
color: "#374151",
fontSize: "18px",
lineHeight: 1.75,
maxWidth: "980px"
}}
>
PROCURO es una plataforma diseñada para encontrar proveedores, publicar requerimientos
y comparar cotizaciones dentro de una estructura pensada desde la lógica de compras.
</p>

<p
style={{
marginTop: 0,
marginBottom: 0,
color: "#4b5563",
fontSize: "17px",
lineHeight: 1.75,
maxWidth: "980px"
}}
>
Nuestro objetivo es ordenar el mercado proveedor, mejorar la visibilidad de empresas
confiables y facilitar decisiones de compra con mayor claridad.
</p>
</div>

{/* RESUMEN */}
<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
gap: "20px",
marginBottom: "28px"
}}
>
<div style={quickCardStyle}>
<h3 style={{ color: "#1f3552", marginTop: 0 }}>Proveedores</h3>
<h2 style={{ margin: "10px 0", color: "#111827", fontSize: "38px" }}>
{totalProveedores}
</h2>
<p style={{ color: "#6b7280", marginBottom: 0 }}>
Base registrada en la plataforma
</p>
</div>

<div style={quickCardStyle}>
<h3 style={{ color: "#1f3552", marginTop: 0 }}>Requerimientos</h3>
<h2 style={{ margin: "10px 0", color: "#111827", fontSize: "38px" }}>
{totalRequerimientos}
</h2>
<p style={{ color: "#6b7280", marginBottom: 0 }}>
Solicitudes publicadas por compradores
</p>
</div>

<div style={quickCardStyle}>
<h3 style={{ color: "#1f3552", marginTop: 0 }}>Cotizaciones</h3>
<h2 style={{ margin: "10px 0", color: "#111827", fontSize: "38px" }}>
{totalCotizaciones}
</h2>
<p style={{ color: "#6b7280", marginBottom: 0 }}>
Flujo de cotización ya probado
</p>
</div>

<div style={quickCardStyle}>
<h3 style={{ color: "#1f3552", marginTop: 0 }}>Estado</h3>
<h2 style={{ margin: "10px 0", color: "#111827", fontSize: "30px" }}>
MVP activo
</h2>
<p style={{ color: "#6b7280", marginBottom: 0 }}>
Estructura lista para seguir escalando
</p>
</div>
</div>

{/* ¿QUÉ PUEDES HACER? */}
<div style={sectionCardStyle}>
<h2 style={{ color: "#1f3552", marginTop: 0 }}>
¿Qué puedes hacer en PROCURO?
</h2>

<p style={{ color: "#4b5563", marginBottom: "22px" }}>
Una plataforma pensada para ordenar la búsqueda, validación y comparación de proveedores
dentro de un mismo entorno.
</p>

<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
gap: "18px"
}}
>
<div style={featureCardStyle}>
<h3 style={{ color: "#1f3552", marginTop: 0 }}>
1. Encontrar proveedores
</h3>
<p style={{ color: "#6b7280", lineHeight: 1.6 }}>
Filtra por cobertura, país, ciudad, sector y categoría para encontrar proveedores
más alineados a tu necesidad.
</p>
</div>

<div style={featureCardStyle}>
<h3 style={{ color: "#1f3552", marginTop: 0 }}>
2. Publicar requerimientos
</h3>
<p style={{ color: "#6b7280", lineHeight: 1.6 }}>
Los compradores pueden cargar requerimientos y abrir oportunidades para recibir
propuestas concretas.
</p>
</div>

<div style={featureCardStyle}>
<h3 style={{ color: "#1f3552", marginTop: 0 }}>
3. Comparar cotizaciones
</h3>
<p style={{ color: "#6b7280", lineHeight: 1.6 }}>
Revisa respuestas, compara precios y analiza proveedores desde un comparativo
simple y visual.
</p>
</div>
</div>
</div>
</div>
);
}

export default Home;