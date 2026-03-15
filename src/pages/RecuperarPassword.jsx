import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

function RecuperarPassword() {
const [password, setPassword] = useState("");
const [confirmacion, setConfirmacion] = useState("");
const [sessionLista, setSessionLista] = useState(false);
const [cargando, setCargando] = useState(false);

useEffect(() => {
verificarSesionRecuperacion();

const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
if (event === "PASSWORD_RECOVERY" || session) {
setSessionLista(true);
}
});

return () => {
listener?.subscription?.unsubscribe();
};
}, []);

const verificarSesionRecuperacion = async () => {
const { data } = await supabase.auth.getSession();
if (data?.session) {
setSessionLista(true);
}
};

const actualizarPassword = async () => {
if (!password || !confirmacion) {
alert("Completa ambos campos");
return;
}

if (password !== confirmacion) {
alert("Las contraseñas no coinciden");
return;
}

try {
setCargando(true);

const { error } = await supabase.auth.updateUser({
password
});

if (error) {
console.error(error);
alert("No fue posible actualizar la contraseña");
return;
}

alert("Contraseña actualizada correctamente");
} catch (err) {
console.error(err);
alert("Ocurrió un error al actualizar la contraseña");
} finally {
setCargando(false);
}
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
<h2>Recuperar contraseña</h2>

{!sessionLista ? (
<>
<p>
Abre esta página desde el enlace enviado a tu correo para poder establecer una nueva contraseña.
</p>

<Link
to="/acceso-proveedor"
style={{
display: "inline-block",
marginTop: "12px",
backgroundColor: "#1f3552",
color: "white",
textDecoration: "none",
padding: "10px 14px",
borderRadius: "8px",
fontWeight: "bold"
}}
>
Volver a acceso proveedor
</Link>
</>
) : (
<>
<input
type="password"
placeholder="Nueva contraseña"
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

<input
type="password"
placeholder="Confirmar nueva contraseña"
value={confirmacion}
onChange={(e) => setConfirmacion(e.target.value)}
style={{
width: "100%",
padding: "12px",
marginBottom: "12px",
borderRadius: "10px",
border: "1px solid #ccc"
}}
/>

<button
onClick={actualizarPassword}
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
{cargando ? "Actualizando..." : "Guardar nueva contraseña"}
</button>
</>
)}
</div>
);
}

export default RecuperarPassword;