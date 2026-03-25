import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

function AccesoProveedor() {
const navigate = useNavigate();

const [modo, setModo] = useState("login");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [usuario, setUsuario] = useState(null);
const [cargando, setCargando] = useState(false);

const RECOVERY_REDIRECT_URL =
"https://procuro-app.vercel.app/recuperar-password";

const isMobile =
typeof window !== "undefined" ? window.innerWidth <= 768 : false;

useEffect(() => {
verificarSesion();

const { data: listener } = supabase.auth.onAuthStateChange(
(_event, session) => {
setUsuario(session?.user || null);
}
);

return () => {
listener?.subscription?.unsubscribe();
};
}, []);

const verificarSesion = async () => {
const { data, error } = await supabase.auth.getUser();

if (error) {
console.error("Error verificando sesión proveedor:", error);
return;
}

setUsuario(data?.user || null);
};

const registrarse = async () => {
if (!email || !password) {
alert("Ingresa correo y contraseña");
return;
}

try {
setCargando(true);

const correoLimpio = email.trim().toLowerCase();

const { error } = await supabase.auth.signUp({
email: correoLimpio,
password,
});

if (error) {
console.error("Error creando cuenta proveedor:", error);
alert(`No fue posible crear la cuenta: ${error.message}`);
return;
}

alert(
"Cuenta de proveedor creada correctamente. Revisa tu correo para confirmarla."
);
} catch (err) {
console.error("Error inesperado registrando proveedor:", err);
alert("Ocurrió un error al registrarte");
} finally {
setCargando(false);
}
};

const iniciarSesion = async () => {
if (!email || !password) {
alert("Ingresa correo y contraseña");
return;
}

try {
setCargando(true);

const correoLimpio = email.trim().toLowerCase();

const { error } = await supabase.auth.signInWithPassword({
email: correoLimpio,
password,
});

if (error) {
console.error("Error iniciando sesión proveedor:", error);
alert(`No fue posible iniciar sesión: ${error.message}`);
return;
}

localStorage.setItem("rol", "proveedor");
alert("Sesión iniciada correctamente");
navigate("/panel-proveedor");
} catch (err) {
console.error("Error inesperado iniciando sesión proveedor:", err);
alert("Ocurrió un error al iniciar sesión");
} finally {
setCargando(false);
}
};

const recuperarPassword = async () => {
if (!email) {
alert("Primero ingresa tu correo electrónico");
return;
}

try {
setCargando(true);

const correoLimpio = email.trim().toLowerCase();

const { error } = await supabase.auth.resetPasswordForEmail(
correoLimpio,
{
redirectTo: RECOVERY_REDIRECT_URL,
}
);

if (error) {
console.error("Error enviando recuperación proveedor:", error);
alert(`No fue posible enviar el correo de recuperación: ${error.message}`);
return;
}

alert("Te enviamos un correo para recuperar tu contraseña.");
} catch (err) {
console.error("Error inesperado recuperando contraseña proveedor:", err);
alert("Ocurrió un error al solicitar la recuperación");
} finally {
setCargando(false);
}
};

const irAPanel = () => {
localStorage.setItem("rol", "proveedor");
navigate("/panel-proveedor");
};

const paginaStyle = {
minHeight: "100vh",
background:
"linear-gradient(135deg, #111827 0%, #1f2937 38%, #1f3552 72%, #0f172a 100%)",
padding: isMobile ? "16px" : "34px",
};

const heroCardStyle = {
background:
"linear-gradient(135deg, rgba(245,239,230,0.98), rgba(241,233,221,0.96))",
borderRadius: "24px",
padding: isMobile ? "22px 18px" : "30px 32px",
boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
marginBottom: "20px",
position: "relative",
overflow: "hidden",
};

const formCardStyle = {
background: "#f8f5ef",
borderRadius: "20px",
padding: isMobile ? "20px 16px" : "24px",
boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
border: "1px solid rgba(31,53,82,0.10)",
};

const inputStyle = {
width: "100%",
padding: "13px 14px",
marginBottom: "12px",
borderRadius: "12px",
border: "1px solid #d1d5db",
boxSizing: "border-box",
fontSize: "14px",
backgroundColor: "white",
color: "#111827",
};

const btnPrincipal = {
background: "linear-gradient(135deg, #f97316, #ea580c)",
color: "white",
border: "none",
padding: "12px 18px",
borderRadius: "12px",
cursor: "pointer",
fontWeight: "700",
boxShadow: "0 8px 16px rgba(249,115,22,0.20)",
};

const btnSecundario = {
backgroundColor: "#e5e7eb",
color: "#111827",
border: "none",
padding: "12px 18px",
borderRadius: "12px",
cursor: "pointer",
fontWeight: "700",
};

const tabStyle = (activo) => ({
background: activo
? "linear-gradient(135deg, #f97316, #ea580c)"
: "#e5e7eb",
color: activo ? "white" : "#111827",
border: "none",
padding: "10px 14px",
borderRadius: "12px",
cursor: "pointer",
fontWeight: "700",
boxShadow: activo ? "0 8px 16px rgba(249,115,22,0.18)" : "none",
});

return (
<div style={paginaStyle}>
<div style={heroCardStyle}>
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
fontSize: "12px",
fontWeight: "800",
textTransform: "uppercase",
letterSpacing: "0.08em",
}}
>
Acceso proveedor
</p>

<h1
style={{
margin: "10px 0 8px 0",
color: "#1f3552",
fontSize: isMobile ? "24px" : "30px",
lineHeight: 1.25,
fontWeight: "700",
}}
>
Entra para hacer visible tu oferta, responder oportunidades y cotizar con estructura.
</h1>

<p
style={{
margin: 0,
color: "#4b5563",
lineHeight: 1.65,
fontSize: isMobile ? "14px" : "16px",
maxWidth: "820px",
}}
>
Desde aquí puedes acceder a tu panel, ver oportunidades, enviar
cotizaciones formales y dar seguimiento a tus conversaciones dentro de PROCURO.
</p>
</div>

<div style={formCardStyle}>
<h2
style={{
marginTop: 0,
marginBottom: "10px",
color: "#1f3552",
fontSize: isMobile ? "22px" : "26px",
fontWeight: "700",
}}
>
{usuario ? "Sesión activa" : "Tu acceso en PROCURO"}
</h2>

{usuario ? (
<>
<div
style={{
backgroundColor: "white",
borderRadius: "14px",
padding: "16px",
border: "1px solid #e5e7eb",
boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
}}
>
<p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>
Correo activo
</p>
<p
style={{
margin: "6px 0 0 0",
color: "#111827",
fontWeight: "700",
}}
>
{usuario.email}
</p>

<p
style={{
color: "#4b5563",
marginTop: "12px",
marginBottom: 0,
lineHeight: 1.6,
}}
>
Tu sesión ya está activa. Entra a tu panel para revisar oportunidades,
enviar cotizaciones y gestionar tu actividad en la plataforma.
</p>
</div>

<button
onClick={irAPanel}
style={{
...btnPrincipal,
marginTop: "16px",
}}
>
Ir a mi panel
</button>
</>
) : (
<>
<div
style={{
display: "flex",
gap: "10px",
marginBottom: "18px",
flexWrap: "wrap",
}}
>
<button
onClick={() => setModo("login")}
style={tabStyle(modo === "login")}
>
Iniciar sesión
</button>

<button
onClick={() => setModo("registro")}
style={tabStyle(modo === "registro")}
>
Crear cuenta
</button>
</div>

<input
type="email"
placeholder="Correo electrónico"
value={email}
onChange={(e) => setEmail(e.target.value)}
style={inputStyle}
/>

<input
type="password"
placeholder="Contraseña"
value={password}
onChange={(e) => setPassword(e.target.value)}
style={inputStyle}
/>

<div
style={{
display: "flex",
gap: "10px",
flexWrap: "wrap",
alignItems: "center",
marginTop: "6px",
}}
>
{modo === "login" ? (
<button
onClick={iniciarSesion}
disabled={cargando}
style={btnPrincipal}
>
{cargando ? "Ingresando..." : "Ingresar"}
</button>
) : (
<button
onClick={registrarse}
disabled={cargando}
style={btnPrincipal}
>
{cargando ? "Creando..." : "Crear cuenta"}
</button>
)}

<button
onClick={recuperarPassword}
disabled={cargando}
style={btnSecundario}
>
Olvidé mi contraseña
</button>
</div>

<p
style={{
marginTop: "14px",
marginBottom: 0,
color: "#6b7280",
fontSize: "13px",
lineHeight: 1.6,
}}
>
{modo === "login"
? "Entra para revisar oportunidades y responder cotizaciones desde tu panel."
: "Crea tu cuenta para empezar a mostrar tu oferta y participar en oportunidades reales dentro de PROCURO."}
</p>
</>
)}
</div>
</div>
);
}

export default AccesoProveedor;