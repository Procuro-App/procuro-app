import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function PanelProveedor() {
const navigate = useNavigate();

const [usuario, setUsuario] = useState(null);
const [nombreProveedor, setNombreProveedor] = useState("");

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

if (!user?.email) return;

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

const cerrarSesion = async () => {
await supabase.auth.signOut();
localStorage.removeItem("rol");
navigate("/");
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
marginBottom: "16px",
};

const cardAccion = {
...cardSecundaria,
display: "flex",
flexDirection: "column",
justifyContent: "space-between",
minHeight: "235px",
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

const botonSecundario = {
background: "linear-gradient(135deg, #1f3552, #2563eb)",
color: "white",
border: "none",
padding: "12px 16px",
borderRadius: "10px",
cursor: "pointer",
fontWeight: "bold",
fontSize: "14px",
boxShadow: "0 6px 14px rgba(31,53,82,0.24)",
width: "100%",
};

const botonPeligro = {
background: "linear-gradient(135deg, #dc2626, #b91c1c)",
color: "white",
border: "none",
padding: "12px 16px",
borderRadius: "10px",
cursor: "pointer",
fontWeight: "bold",
fontSize: "14px",
boxShadow: "0 6px 14px rgba(220,38,38,0.24)",
width: "100%",
};

const tituloStyle = {
margin: 0,
fontSize: "30px",
color: "#1f3552",
fontWeight: "800",
};

const subtituloStyle = {
marginTop: "8px",
marginBottom: 0,
color: "#5b6472",
lineHeight: 1.5,
};

const tituloCardStyle = {
marginTop: 0,
marginBottom: "8px",
color: "#1f3552",
fontSize: "20px",
};

const textoCardStyle = {
marginTop: 0,
color: "#5b6472",
lineHeight: 1.55,
};

return (
<div>
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
Panel proveedor
</p>

<h1 style={tituloStyle}>
{nombreProveedor ? `Hola, ${nombreProveedor}` : "Panel proveedor"}
</h1>

<p style={subtituloStyle}>
Gestiona oportunidades, responde requerimientos, envía cotizaciones y
mantén tus conversaciones organizadas.
</p>
</div>

<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
gap: "14px",
marginBottom: "18px",
}}
>
<div style={cardAccion}>
<div>
<h3 style={tituloCardStyle}>Oportunidades</h3>
<p style={textoCardStyle}>
Revisa requerimientos abiertos alineados a tu sector y encuentra
nuevas opciones de negocio.
</p>
</div>

<button
onClick={() => navigate("/oportunidades")}
style={botonPrincipal}
>
Ver oportunidades
</button>
</div>

<div style={cardAccion}>
<div>
<h3 style={tituloCardStyle}>Mis cotizaciones</h3>
<p style={textoCardStyle}>
Consulta el historial de cotizaciones enviadas y da seguimiento a
tus propuestas.
</p>
</div>

<button
onClick={() => navigate("/cotizaciones")}
style={botonSecundario}
>
Ver mis cotizaciones
</button>
</div>

<div style={cardAccion}>
<div>
<h3 style={tituloCardStyle}>Conversaciones</h3>
<p style={textoCardStyle}>
Responde chats por requerimiento y mantén cada conversación con su
contexto y archivos.
</p>
</div>

<button onClick={() => navigate("/chat")} style={botonSecundario}>
Ver conversaciones
</button>
</div>

<div style={cardAccion}>
<div>
<h3 style={tituloCardStyle}>Registro proveedor</h3>
<p style={textoCardStyle}>
Accede a tu información registrada para revisar o volver a
completar tus datos cuando sea necesario.
</p>
</div>

<button
onClick={() => navigate("/registro-proveedor")}
style={botonSecundario}
>
Ver registro
</button>
</div>

<div style={cardAccion}>
<div>
<h3 style={tituloCardStyle}>Sesión</h3>
<p style={textoCardStyle}>
Cierra tu sesión de forma segura cuando termines tu gestión en la
plataforma.
</p>
</div>

<button onClick={cerrarSesion} style={botonPeligro}>
Cerrar sesión
</button>
</div>
</div>

<div style={cardSecundaria}>
<h3
style={{
marginTop: 0,
marginBottom: "10px",
color: "#1f3552",
fontSize: "22px",
}}
>
Resumen
</h3>

<p style={{ color: "#5b6472", marginTop: 0 }}>
Como proveedor, puedes encontrar oportunidades según tu sector,
responder requerimientos y enviar cotizaciones directamente desde la
plataforma.
</p>

<p style={{ color: "#5b6472", marginBottom: 0 }}>
Las conversaciones se organizan por requerimiento, lo que te permite
responder con claridad y mantener trazabilidad en cada negocio.
</p>
</div>

<div style={cardSecundaria}>
<h3
style={{
marginTop: 0,
marginBottom: "10px",
color: "#1f3552",
fontSize: "22px",
}}
>
Cuenta activa
</h3>

<p style={{ color: "#5b6472", marginTop: 0, marginBottom: "6px" }}>
<strong>Email:</strong> {usuario?.email || "No disponible"}
</p>

<p style={{ color: "#5b6472", margin: 0 }}>
Mantén actualizado tu registro para aumentar tu visibilidad y mejorar
tu alcance frente a compradores.
</p>
</div>
</div>
);
}

export default PanelProveedor;