import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";

function AccesoProveedor() {
const navigate = useNavigate();

const [modo, setModo] = useState("login");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [usuario, setUsuario] = useState(null);
const [cargando, setCargando] = useState(false);

useEffect(() => {
verificarSesion();

const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
setUsuario(session?.user || null);
});

return () => {
listener?.subscription?.unsubscribe();
};
}, []);

const verificarSesion = async () => {
const { data, error } = await supabase.auth.getUser();

if (error) {
console.error("Error verificando sesión:", error);
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

const { error } = await supabase.auth.signUp({
email,
password
});

if (error) {
console.error(error);
alert("No fue posible crear la cuenta");
return;
}

alert("Cuenta creada correctamente. Si Supabase pide confirmación por correo, revisa tu email.");
} catch (err) {
console.error(err);
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

const { error } = await supabase.auth.signInWithPassword({
email,
password
});

if (error) {
console.error(error);
alert("Correo o contraseña incorrectos");
return;
}

alert("Sesión iniciada correctamente");
navigate("/panel-proveedor");
} catch (err) {
console.error(err);
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

const { error } = await supabase.auth.resetPasswordForEmail(email, {
redirectTo: `${window.location.origin}/recuperar-password`
});

if (error) {
console.error(error);
alert("No fue posible enviar el correo de recuperación");
return;
}

alert("Te enviamos un correo para recuperar tu contraseña.");
} catch (err) {
console.error(err);
alert("Ocurrió un error al solicitar la recuperación");
} finally {
setCargando(false);
}
};

const cerrarSesion = async () => {
const { error } = await supabase.auth.signOut();

if (error) {
console.error(error);
alert("No fue posible cerrar sesión");
return;
}

alert("Sesión cerrada");
setUsuario(null);
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
<h2>Acceso proveedor</h2>

{usuario ? (
<>
<p><strong>Sesión activa:</strong> {usuario.email}</p>

<div
style={{
display: "flex",
gap: "10px",
flexWrap: "wrap",
marginTop: "12px"
}}
>
<Link
to="/panel-proveedor"
style={{
display: "inline-block",
backgroundColor: "#1f3552",
color: "white",
textDecoration: "none",
padding: "10px 14px",
borderRadius: "8px",
fontWeight: "bold"
}}
>
Ir a mi panel
</Link>

<button
onClick={cerrarSesion}
style={{
backgroundColor: "#8b1e1e",
color: "white",
border: "none",
padding: "10px 14px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold"
}}
>
Cerrar sesión
</button>
</div>
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

export default AccesoProveedor;