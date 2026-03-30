import { useLanguage } from "../LanguageContext";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

function AccesoComprador() {
const navigate = useNavigate();
const { language } = useLanguage();

const [modo, setModo] = useState("login");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [usuario, setUsuario] = useState(null);
const [cargando, setCargando] = useState(false);

const RECOVERY_REDIRECT_URL =
"https://procuro-app.vercel.app/recuperar-password-comprador";

const isMobile =
typeof window !== "undefined" ? window.innerWidth <= 768 : false;

const textos = {
es: {
alertCampos: "Ingresa correo y contraseña",
alertLoginError: "No fue posible iniciar sesión:",
alertRegistroError: "No fue posible crear la cuenta:",
alertCorreoExiste: "Este correo ya está registrado. Inicia sesión.",
alertRegistroOk:
"Cuenta creada correctamente. Revisa tu correo para confirmarla.",
alertRecuperacionError:
"No fue posible enviar el correo de recuperación:",
alertLoginOk: "Sesión iniciada correctamente",
alertRecuperar: "Primero ingresa tu correo electrónico",
alertRecuperarOk:
"Te enviamos un correo para recuperar tu contraseña.",
alertErrorGeneral: "Ocurrió un error",

badge: "Acceso comprador",
titulo: "Entra para encontrar, comparar y decidir mejor.",
subtitulo:
"Accede a proveedores organizados, genera requerimientos formales y compara cotizaciones con claridad.",
sesionActiva: "Sesión activa",
acceso: "Tu acceso en PROCURO",
correoActivo: "Correo activo",
irPanel: "Ir a mi panel",
login: "Iniciar sesión",
registro: "Registrarse",
correo: "Correo electrónico",
password: "Contraseña",
ingresar: "Ingresar",
ingresando: "Ingresando...",
creando: "Creando...",
crearCuenta: "Crear cuenta",
olvidaste: "Olvidé mi contraseña",
textoSesion:
"Tu sesión ya está activa. Entra a tu dashboard para gestionar requerimientos, cotizaciones y comparativos.",
textoLogin:
"Entra para gestionar requerimientos y comparar cotizaciones desde tu panel.",
textoRegistro:
"Crea tu cuenta para empezar a solicitar, comparar y decidir mejor.",
},
en: {
alertCampos: "Enter email and password",
alertLoginError: "Login failed:",
alertRegistroError: "Account creation failed:",
alertCorreoExiste:
"This email is already registered. Please log in.",
alertRegistroOk:
"Account created successfully. Check your email to confirm it.",
alertRecuperacionError: "Could not send the recovery email:",
alertLoginOk: "Login successful",
alertRecuperar: "Please enter your email first",
alertRecuperarOk: "We sent you a password recovery email.",
alertErrorGeneral: "An error occurred",

badge: "Buyer access",
titulo: "Enter to find, compare, and decide better.",
subtitulo:
"Access organized suppliers, create formal requests, and compare quotes clearly.",
sesionActiva: "Active session",
acceso: "Your access to PROCURO",
correoActivo: "Active email",
irPanel: "Go to my panel",
login: "Log in",
registro: "Sign up",
correo: "Email",
password: "Password",
ingresar: "Log in",
ingresando: "Logging in...",
creando: "Creating...",
crearCuenta: "Create account",
olvidaste: "Forgot my password",
textoSesion:
"Your session is active. Go to your dashboard to manage requests, quotations, and comparisons.",
textoLogin:
"Enter to manage requests and compare quotes from your panel.",
textoRegistro:
"Create your account to start requesting, comparing, and deciding better.",
},
};

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
console.error("Error verificando sesión comprador:", error);
return;
}

setUsuario(data?.user || null);
};

const registrarse = async () => {
if (!email || !password) {
alert(textos[language].alertCampos);
return;
}

try {
setCargando(true);

const correoLimpio = email.trim().toLowerCase();

const { data, error } = await supabase.auth.signUp({
email: correoLimpio,
password,
});

if (error) {
console.error("Error creando cuenta comprador:", error);

if (
error.message?.toLowerCase().includes("already registered") ||
error.message?.toLowerCase().includes("already been registered") ||
error.message?.toLowerCase().includes("user already registered")
) {
alert(textos[language].alertCorreoExiste);
setModo("login");
} else {
alert(`${textos[language].alertRegistroError} ${error.message}`);
}
return;
}

if (
data?.user &&
Array.isArray(data.user.identities) &&
data.user.identities.length === 0
) {
alert(textos[language].alertCorreoExiste);
setModo("login");
return;
}

alert(textos[language].alertRegistroOk);
setModo("login");
} catch (err) {
console.error("Error inesperado registrando comprador:", err);
alert(textos[language].alertErrorGeneral);
} finally {
setCargando(false);
}
};

const iniciarSesion = async () => {
if (!email || !password) {
alert(textos[language].alertCampos);
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
console.error("Error iniciando sesión comprador:", error);
alert(`${textos[language].alertLoginError} ${error.message}`);
return;
}

localStorage.setItem("rol", "comprador");
alert(textos[language].alertLoginOk);
navigate("/panel-comprador");
} catch (err) {
console.error("Error inesperado iniciando sesión comprador:", err);
alert(textos[language].alertErrorGeneral);
} finally {
setCargando(false);
}
};

const recuperarPassword = async () => {
if (!email) {
alert(textos[language].alertRecuperar);
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
console.error("Error enviando recuperación comprador:", error);
alert(
`${textos[language].alertRecuperacionError} ${error.message}`
);
return;
}

alert(textos[language].alertRecuperarOk);
} catch (err) {
console.error("Error inesperado recuperando contraseña comprador:", err);
alert(textos[language].alertErrorGeneral);
} finally {
setCargando(false);
}
};

const irADashboard = () => {
localStorage.setItem("rol", "comprador");
navigate("/panel-comprador");
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
background: "linear-gradient(135deg, #1f3552, #2563eb)",
color: "white",
border: "none",
padding: "12px 18px",
borderRadius: "12px",
cursor: "pointer",
fontWeight: "700",
boxShadow: "0 8px 16px rgba(37,99,235,0.18)",
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
? "linear-gradient(135deg, #1f3552, #2563eb)"
: "#e5e7eb",
color: activo ? "white" : "#111827",
border: "none",
padding: "10px 14px",
borderRadius: "12px",
cursor: "pointer",
fontWeight: "700",
boxShadow: activo ? "0 8px 16px rgba(37,99,235,0.18)" : "none",
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
"radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0) 72%)",
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
{textos[language].badge}
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
{textos[language].titulo}
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
{textos[language].subtitulo}
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
{usuario ? textos[language].sesionActiva : textos[language].acceso}
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
{textos[language].correoActivo}
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
{textos[language].textoSesion}
</p>
</div>

<button
onClick={irADashboard}
style={{
...btnPrincipal,
marginTop: "16px",
}}
>
{textos[language].irPanel}
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
{textos[language].login}
</button>

<button
onClick={() => setModo("registro")}
style={tabStyle(modo === "registro")}
>
{textos[language].registro}
</button>
</div>

<input
type="email"
placeholder={textos[language].correo}
value={email}
onChange={(e) => setEmail(e.target.value)}
style={inputStyle}
/>

<input
type="password"
placeholder={textos[language].password}
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
{cargando
? textos[language].ingresando
: textos[language].ingresar}
</button>
) : (
<button
onClick={registrarse}
disabled={cargando}
style={btnPrincipal}
>
{cargando
? textos[language].creando
: textos[language].crearCuenta}
</button>
)}

<button
onClick={recuperarPassword}
disabled={cargando}
style={btnSecundario}
>
{textos[language].olvidaste}
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
? textos[language].textoLogin
: textos[language].textoRegistro}
</p>
</>
)}
</div>
</div>
);
}

export default AccesoComprador;