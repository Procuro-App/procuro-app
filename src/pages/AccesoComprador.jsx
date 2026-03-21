import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

function AccesoComprador() {
const navigate = useNavigate();

const [modo, setModo] = useState("login");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [usuario, setUsuario] = useState(null);
const [cargando, setCargando] = useState(false);

const RECOVERY_REDIRECT_URL =
"https://procuro-app.vercel.app/recuperar-password-comprador";

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
alert("Ingresa correo y contraseña");
return;
}

try {
setCargando(true);

const correoLimpio = email.trim().toLowerCase();

const { error } = await supabase.auth.signUp({
email: correoLimpio,
password
});

if (error) {
console.error("Error creando cuenta comprador:", error);
alert(`No fue posible crear la cuenta: ${error.message}`);
return;
}

alert(
"Cuenta de comprador creada correctamente. Revisa tu correo para confirmarla."
);
} catch (err) {
console.error("Error inesperado registrando comprador:", err);
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
password
});

if (error) {
console.error("Error iniciando sesión comprador:", error);
alert(`No fue posible iniciar sesión: ${error.message}`);
return;
}

localStorage.setItem("rol", "comprador");
alert("Sesión iniciada correctamente");
navigate("/panel-comprador");
} catch (err) {
console.error("Error inesperado iniciando sesión comprador:", err);
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
redirectTo: RECOVERY_REDIRECT_URL
}
);

if (error) {
console.error("Error enviando recuperación comprador:", error);
alert(`No fue posible enviar el correo de recuperación: ${error.message}`);
return;
}

alert("Te enviamos un correo para recuperar tu contraseña.");
} catch (err) {
console.error("Error inesperado recuperando contraseña comprador:", err);
alert("Ocurrió un error al solicitar la recuperación");
} finally {
setCargando(false);
}
};

const irADashboard = () => {
localStorage.setItem("rol", "comprador");
navigate("/panel-comprador");
};

return (
<div
style={{
backgroundColor: "white",
borderRadius: "16px",
padding: "24px",
boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
}}
>
<h2>Acceso comprador</h2>

{usuario ? (
<>
<p>
<strong>Sesión activa:</strong> {usuario.email}
</p>
<p style={{ color: "#555", marginTop: "6px" }}>
Tu sesión ya está activa. Entra a tu dashboard para gestionar tu cuenta.
</p>

<button
onClick={irADashboard}
style={{
backgroundColor: "#1f3552",
color: "white",
border: "none",
padding: "12px 18px",
borderRadius: "10px",
cursor: "pointer",
fontWeight: "bold",
marginTop: "12px"
}}
>
Ir a mi dashboard
</button>
</>
) : (
<>
<div
style={{
display: "flex",
gap: "10px",
marginBottom: "16px",
flexWrap: "wrap"
}}
>
<button
onClick={() => setModo("login")}
style={{
backgroundColor: modo === "login" ? "#1f3552" : "#e5e7eb",
color: modo === "login" ? "white" : "#111827",
border: "none",
padding: "10px 14px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold"
}}
>
Iniciar sesión
</button>

<button
onClick={() => setModo("registro")}
style={{
backgroundColor: modo === "registro" ? "#1f3552" : "#e5e7eb",
color: modo === "registro" ? "white" : "#111827",
border: "none",
padding: "10px 14px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold"
}}
>
Crear cuenta
</button>
</div>

<input
type="email"
placeholder="Correo electrónico"
value={email}
onChange={(e) => setEmail(e.target.value)}
style={{
width: "100%",
padding: "12px",
marginBottom: "12px",
borderRadius: "10px",
border: "1px solid #ccc"
}}
/>

<input
type="password"
placeholder="Contraseña"
value={password}
onChange={(e) => setPassword(e.target.value)}
style={{
width: "100%",
padding: "12px",
marginBottom: "12px",
borderRadius: "10px",
border: "1px solid #ccc"
}}
/>

<div
style={{
display: "flex",
gap: "10px",
flexWrap: "wrap",
alignItems: "center"
}}
>
{modo === "login" ? (
<button
onClick={iniciarSesion}
disabled={cargando}
style={{
backgroundColor: "#1f3552",
color: "white",
border: "none",
padding: "12px 18px",
borderRadius: "10px",
cursor: "pointer",
fontWeight: "bold"
}}
>
{cargando ? "Ingresando..." : "Ingresar"}
</button>
) : (
<button
onClick={registrarse}
disabled={cargando}
style={{
backgroundColor: "#1f3552",
color: "white",
border: "none",
padding: "12px 18px",
borderRadius: "10px",
cursor: "pointer",
fontWeight: "bold"
}}
>
{cargando ? "Creando..." : "Crear cuenta"}
</button>
)}

<button
onClick={recuperarPassword}
disabled={cargando}
style={{
backgroundColor: "#e5e7eb",
color: "#111827",
border: "none",
padding: "12px 18px",
borderRadius: "10px",
cursor: "pointer",
fontWeight: "bold"
}}
>
Olvidé mi contraseña
</button>
</div>
</>
)}
</div>
);
}

export default AccesoComprador;