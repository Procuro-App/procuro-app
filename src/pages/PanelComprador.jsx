import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function PanelComprador() {
const navigate = useNavigate();

const [usuario, setUsuario] = useState(null);
const [nombreComprador, setNombreComprador] = useState("");

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
Panel comprador
</p>

<h1 style={tituloStyle}>
{nombreComprador ? `Hola, ${nombreComprador}` : "Panel comprador"}
</h1>

<p style={subtituloStyle}>
Administra requerimientos, revisa cotizaciones, compara propuestas y
conversa con proveedores desde una sola vista.
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
<div style={cardSecundaria}>
<h3
style={{
marginTop: 0,
marginBottom: "8px",
color: "#1f3552",
fontSize: "20px",
}}
>
Requerimientos
</h3>
<p style={{ marginTop: 0, color: "#5b6472", minHeight: "48px" }}>
Crea solicitudes de compra y encuentra proveedores por sector.
</p>
<button
onClick={() => navigate("/requerimientos")}
style={botonPrincipal}
>
Ir a mis requerimientos
</button>
</div>

<div style={cardSecundaria}>
<h3
style={{
marginTop: 0,
marginBottom: "8px",
color: "#1f3552",
fontSize: "20px",
}}
>
Cotizaciones
</h3>
<p style={{ marginTop: 0, color: "#5b6472", minHeight: "48px" }}>
Revisa respuestas de proveedores y centraliza documentos enviados.
</p>
<button
onClick={() => navigate("/cotizaciones")}
style={botonSecundario}
>
Ver cotizaciones
</button>
</div>

<div style={cardSecundaria}>
<h3
style={{
marginTop: 0,
marginBottom: "8px",
color: "#1f3552",
fontSize: "20px",
}}
>
Comparativo
</h3>
<p style={{ marginTop: 0, color: "#5b6472", minHeight: "48px" }}>
Compara propuestas recibidas y visualiza diferencias rápidamente.
</p>
<button
onClick={() => navigate("/comparador-cotizaciones")}
style={botonSecundario}
>
Abrir comparativo
</button>
</div>

<div style={cardSecundaria}>
<h3
style={{
marginTop: 0,
marginBottom: "8px",
color: "#1f3552",
fontSize: "20px",
}}
>
Mi perfil
</h3>
<p style={{ marginTop: 0, color: "#5b6472", minHeight: "48px" }}>
Consulta o actualiza la información de tu perfil comprador.
</p>
<button
onClick={() => navigate("/mi-perfil-comprador")}
style={botonSecundario}
>
Ir a mi perfil
</button>
</div>

<div style={cardSecundaria}>
<h3
style={{
marginTop: 0,
marginBottom: "8px",
color: "#1f3552",
fontSize: "20px",
}}
>
Conversaciones
</h3>
<p style={{ marginTop: 0, color: "#5b6472", minHeight: "48px" }}>
Gestiona los chats abiertos con proveedores por cada requerimiento.
</p>
<button onClick={() => navigate("/chat")} style={botonSecundario}>
Ver mis conversaciones
</button>
</div>

<div style={cardSecundaria}>
<h3
style={{
marginTop: 0,
marginBottom: "8px",
color: "#1f3552",
fontSize: "20px",
}}
>
Sesión
</h3>
<p style={{ marginTop: 0, color: "#5b6472", minHeight: "48px" }}>
Cierra tu sesión de forma segura cuando termines tu gestión.
</p>
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
Como comprador, puedes iniciar conversaciones con proveedores desde el
directorio vinculado a cada requerimiento.
</p>

<p style={{ color: "#5b6472", marginBottom: 0 }}>
El proveedor responderá dentro de conversaciones separadas por
requerimiento, lo que te permite mantener orden, contexto y trazabilidad.
</p>
</div>
</div>
);
}

export default PanelComprador;