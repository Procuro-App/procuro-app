import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function PanelProveedor() {
const navigate = useNavigate();

const [usuario, setUsuario] = useState(null);
const [nombreProveedor, setNombreProveedor] = useState("");
const [noLeidas, setNoLeidas] = useState(0);

const isMobile =
typeof window !== "undefined" ? window.innerWidth <= 768 : false;

useEffect(() => {
cargarProveedor();
}, []);

const cargarProveedor = async () => {
const { data, error } = await supabase.auth.getUser();

if (error) {
console.error("Error obteniendo usuario:", error);
return;
}

const user = data?.user || null;
setUsuario(user);

if (!user?.email) {
setNoLeidas(0);
return;
}

await cargarNoLeidas(user.email);


const { data: proveedorData, error: proveedorError } = await supabase
.from("proveedores")
.select("*")
.eq("email", user.email)
.maybeSingle();

if (proveedorError) {
console.error("Error cargando proveedor:", proveedorError);
return;
}

setNombreProveedor(
proveedorData?.nombre || proveedorData?.contacto || user.email
);
};

const cargarNoLeidas = async (emailUsuario) => {
if (!emailUsuario) {
setNoLeidas(0);
return;
}

const { count, error } = await supabase
.from("conversaciones")
.select("*", { count: "exact", head: true })
.eq("proveedor_email", emailUsuario)
.eq("no_leido_proveedor", true);

if (error) {
console.error("Error cargando conversaciones no leídas:", error);
setNoLeidas(0);
return;
}

setNoLeidas(count || 0);
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
marginBottom: "18px",
};

const miniBadge = {
display: "inline-block",
padding: "6px 10px",
borderRadius: "999px",
backgroundColor: "#fed7aa",
color: "#9a3412",
fontSize: "12px",
fontWeight: "700",
marginBottom: "12px",
};

const contadorBadge = {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
minWidth: "26px",
height: "26px",
padding: "0 8px",
borderRadius: "999px",
backgroundColor: "#dc2626",
color: "white",
fontSize: "12px",
fontWeight: "800",
boxShadow: "0 6px 14px rgba(220,38,38,0.22)",
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
width: "100%",
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
width: "100%",
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
width: "100%",
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
Panel proveedor
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
{nombreProveedor ? `Hola, ${nombreProveedor}` : "Panel proveedor"}
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
Gestiona oportunidades, responde requerimientos, envía cotizaciones y
mantén tus conversaciones organizadas desde una sola vista.
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
<span style={miniBadge}>Oportunidades</span>
<h3 style={tituloCard}>Ver oportunidades</h3>
<p style={textoCard}>
Revisa requerimientos abiertos alineados a tu sector y encuentra
nuevas opciones reales de negocio.
</p>
</div>

<button
onClick={() => navigate("/oportunidades")}
style={botonPrincipal}
>
Ver oportunidades
</button>
</div>

<div style={accionCard}>
<div>
<span style={miniBadge}>Seguimiento</span>
<h3 style={tituloCard}>Mis cotizaciones</h3>
<p style={textoCard}>
Consulta el historial de cotizaciones enviadas y da seguimiento a
tus propuestas desde una sola vista.
</p>
</div>

<button
onClick={() => navigate("/cotizaciones")}
style={botonSecundario}
>
Ver mis cotizaciones
</button>
</div>

<div style={accionCard}>
<div>
<div
style={{
display: "flex",
justifyContent: "space-between",
alignItems: "center",
gap: "10px",
marginBottom: "12px",
}}
>
<span style={miniBadge}>Conversación</span>

{noLeidas > 0 && (
<span style={contadorBadge}>
{noLeidas > 9 ? "9+" : noLeidas}
</span>
)}
</div>

<h3 style={tituloCard}>Conversaciones</h3>
<p style={textoCard}>
Gestiona chats abiertos con proveedores por cada requerimiento y
mantén trazabilidad.
</p>
</div>
<button onClick={() => navigate("/chat")} style={botonSecundario}>
{noLeidas > 0
? `Ver mis conversaciones (${noLeidas > 9 ? "9+" : noLeidas})`
: "Ver mis conversaciones"}
</button>
</div>

<div style={accionCard}>
<div>
<span style={miniBadge}>Registro</span>
<h3 style={tituloCard}>Registro proveedor</h3>
<p style={textoCard}>
Accede a tu información registrada para revisar, completar o
actualizar tus datos cuando sea necesario.
</p>
</div>

<button
onClick={() => navigate("/registro-proveedor")}
style={botonSecundario}
>
Ver registro
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
Cierra tu sesión de forma segura cuando termines tu gestión en la
plataforma.
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
Como proveedor, puedes encontrar oportunidades según tu sector,
responder requerimientos y enviar cotizaciones directamente desde la
plataforma.
</p>

<p
style={{
color: "#5b6472",
marginBottom: 0,
lineHeight: 1.65,
fontSize: "15px",
}}
>
Las conversaciones se organizan por requerimiento, lo que te permite
responder con claridad y mantener trazabilidad en cada oportunidad.
</p>
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
Cuenta activa
</h3>

<p
style={{
color: "#5b6472",
marginTop: 0,
marginBottom: "8px",
lineHeight: 1.6,
}}
>
<strong>Email:</strong> {usuario?.email || "No disponible"}
</p>

<p
style={{
color: "#5b6472",
marginBottom: 0,
lineHeight: 1.65,
fontSize: "15px",
}}
>
Mantén actualizado tu registro para mejorar tu visibilidad y ampliar
tu alcance frente a compradores dentro de PROCURO.
</p>
</div>
</div>
);
}

export default PanelProveedor;
