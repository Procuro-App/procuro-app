import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function PanelComprador() {
const navigate = useNavigate();

const cerrarSesion = async () => {
const { error } = await supabase.auth.signOut();

if (error) {
console.error("Error cerrando sesión comprador:", error);
alert("No fue posible cerrar sesión");
return;
}

localStorage.removeItem("rol");
alert("Sesión cerrada");
navigate("/acceso-comprador");
};

const cardStyle = {
backgroundColor: "white",
borderRadius: "18px",
padding: "24px",
boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
borderLeft: "6px solid #3b82f6",
borderRight: "6px solid #f59e0b",
};

const buttonStyle = {
textDecoration: "none",
background: "linear-gradient(135deg, #1f3552, #2563eb)",
color: "white",
fontWeight: "bold",
padding: "12px 14px",
borderRadius: "12px",
boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
display: "flex",
alignItems: "center",
justifyContent: "center",
minHeight: "50px",
textAlign: "center",
border: "none",
cursor: "pointer",
width: "100%",
boxSizing: "border-box",
};

const logoutStyle = {
...buttonStyle,
background: "linear-gradient(135deg, #8b1e1e, #dc2626)",
};

return (
<div>
<div style={{ ...cardStyle, marginBottom: "22px" }}>
<h1 style={{ marginTop: 0, color: "#1f3552" }}>Panel comprador</h1>
<p style={{ color: "#4b5563", marginBottom: 0 }}>
Administra tus requerimientos, revisa cotizaciones, compara propuestas y conversa con proveedores.
</p>
</div>

<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
gap: "14px",
marginBottom: "24px",
}}
>
<Link to="/requerimientos" style={buttonStyle}>
Mis requerimientos
</Link>

<Link to="/cotizaciones" style={buttonStyle}>
Cotizaciones
</Link>

<Link to="/comparador-cotizaciones" style={buttonStyle}>
Comparativo
</Link>

<Link to="/mi-perfil-comprador" style={buttonStyle}>
Mi perfil comprador
</Link>

<Link to="/chat" style={buttonStyle}>
Mis conversaciones
</Link>

<button onClick={cerrarSesion} style={logoutStyle}>
Cerrar sesión
</button>
</div>

<div style={cardStyle}>
<h2 style={{ marginTop: 0, color: "#1f3552" }}>Resumen</h2>
<p style={{ color: "#4b5563", marginBottom: "10px" }}>
Como comprador, puedes iniciar conversaciones con proveedores desde el directorio.
</p>
<p style={{ color: "#6b7280", marginBottom: 0 }}>
El proveedor solo responderá dentro de conversaciones que tú ya hayas abierto.
</p>
</div>
</div>
);
}

export default PanelComprador;