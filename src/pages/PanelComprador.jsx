import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function PanelComprador() {
const navigate = useNavigate();

const [usuario, setUsuario] = useState(null);
const [nombreComprador, setNombreComprador] = useState("");

const isMobile =
typeof window !== "undefined" ? window.innerWidth <= 768 : false;

useEffect(() => {
cargarComprador();
}, []);

const cargarComprador = async () => {
const { data, error } = await supabase.auth.getUser();

if (error) {
console.error("Error obteniendo usuario:", error);
return;
}

const user = data?.user || null;
setUsuario(user);

if (!user?.email) return;

const { data: compradoresData, error: compradorError } = await supabase
.from("compradores")
.select("*")
.eq("email", user.email)
.maybeSingle();

if (compradorError) {
console.error("Error cargando comprador:", compradorError);
return;
}

setNombreComprador(
compradoresData?.nombre || compradoresData?.empresa || user.email
);
};

const cerrarSesion = async () => {
await supabase.auth.signOut();
localStorage.removeItem("rol");
navigate("/");
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

const accionCard = {
background: "#f8f5ef",
borderRadius: "18px",
padding: "20px",
boxShadow: "0 12px 24px rgba(0,0,0,0.16)",
border: "1px solid rgba(31,53,82,0.10)",
display: "flex",
flexDirection: "column",
justifyContent: "space-between",
minHeight: "220px",
};

const resumenCard = {
background: "#f8f5ef",
borderRadius: "20px",
padding: isMobile ? "20px 16px" : "24px",
boxShadow: "0 12px 26px rgba(0,0,0,0.18)",
border: "1px solid rgba(31,53,82,0.10)",
};

const miniBadge = {
display: "inline-block",
padding: "6px 10px",
borderRadius: "999px",
backgroundColor: "#dbeafe",
color: "#1d4ed8",
fontSize: "12px",
fontWeight: "700",
marginBottom: "12px",
};

const tituloCard = {
marginTop: 0,
marginBottom: "8px",
color: "#1f3552",
fontSize: "20px",
fontWeight: "700",
};

const textoCard = {
marginTop: 0,
color: "#5b6472",
lineHeight: 1.6,
minHeight: "66px",
fontSize: "14px",
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
};

const botonSecundario = {
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

const botonPeligro = {
background: "linear-gradient(135deg, #dc2626, #b91c1c)",
color: "white",
border: "none",
padding: "12px 16px",
borderRadius: "12px",
cursor: "pointer",
fontWeight: "700",
fontSize: "14px",
boxShadow: "0 8px 16px rgba(220,38,38,0.18)",
};

return (
<div style={paginaStyle}>
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
Panel comprador
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
{nombreComprador ? `Hola, ${nombreComprador}` : "Panel comprador"}
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
Administra requerimientos, revisa cotizaciones, compara propuestas y
conversa con proveedores desde una sola vista.
</p>
</div>

<div
style={{
display: "grid",
gridTemplateColumns: isMobile
? "1fr"
: "repeat(auto-fit, minmax(250px, 1fr))",
gap: "16px",
marginBottom: "20px",
}}
>
<div style={accionCard}>
<div>
<span style={miniBadge}>Gestión</span>
<h3 style={tituloCard}>Requerimientos</h3>
<p style={textoCard}>
Crea solicitudes de compra, estructura tus necesidades y encuentra
proveedores por sector.
</p>
</div>
<button
onClick={() => navigate("/requerimientos")}
style={botonPrincipal}
>
Ir a mis requerimientos
</button>
</div>

<div style={accionCard}>
<div>
<span style={miniBadge}>Seguimiento</span>
<h3 style={tituloCard}>Cotizaciones</h3>
<p style={textoCard}>
Revisa respuestas de proveedores, documentos enviados y centraliza
tus propuestas recibidas.
</p>
</div>
<button
onClick={() => navigate("/cotizaciones")}
style={botonSecundario}
>
Ver cotizaciones
</button>
</div>

<div style={accionCard}>
<div>
<span style={miniBadge}>Análisis</span>
<h3 style={tituloCard}>Comparativo</h3>
<p style={textoCard}>
Compara propuestas y visualiza diferencias de precio de forma
rápida y ordenada.
</p>
</div>
<button
onClick={() => navigate("/comparador-cotizaciones")}
style={botonSecundario}
>
Abrir comparativo
</button>
</div>

<div style={accionCard}>
<div>
<span style={miniBadge}>Cuenta</span>
<h3 style={tituloCard}>Mi perfil</h3>
<p style={textoCard}>
Consulta o actualiza la información de tu perfil comprador dentro
de la plataforma.
</p>
</div>
<button
onClick={() => navigate("/mi-perfil-comprador")}
style={botonSecundario}
>
Ir a mi perfil
</button>
</div>

<div style={accionCard}>
<div>
<span style={miniBadge}>Conversación</span>
<h3 style={tituloCard}>Conversaciones</h3>
<p style={textoCard}>
Gestiona chats abiertos con proveedores por cada requerimiento y
mantén trazabilidad.
</p>
</div>
<button onClick={() => navigate("/chat")} style={botonSecundario}>
Ver mis conversaciones
</button>
</div>

<div style={accionCard}>
<div>
<span
style={{
...miniBadge,
backgroundColor: "#fee2e2",
color: "#991b1b",
}}
>
Seguridad
</span>
<h3 style={tituloCard}>Sesión</h3>
<p style={textoCard}>
Cierra tu sesión de forma segura cuando termines tu gestión en
PROCURO.
</p>
</div>
<button onClick={cerrarSesion} style={botonPeligro}>
Cerrar sesión
</button>
</div>
</div>

<div style={resumenCard}>
<h3
style={{
marginTop: 0,
marginBottom: "10px",
color: "#1f3552",
fontSize: isMobile ? "22px" : "24px",
fontWeight: "700",
}}
>
Resumen operativo
</h3>

<p
style={{
color: "#5b6472",
marginTop: 0,
lineHeight: 1.65,
fontSize: "15px",
}}
>
Como comprador, puedes iniciar solicitudes formales y luego abrir
conversaciones con proveedores desde el directorio vinculado a cada
requerimiento.
</p>

<p
style={{
color: "#5b6472",
marginBottom: 0,
lineHeight: 1.65,
fontSize: "15px",
}}
>
El proveedor responderá dentro de flujos separados por requerimiento,
lo que te permite mantener orden, contexto y trazabilidad en cada
proceso.
</p>
</div>
</div>
);
}

export default PanelComprador;