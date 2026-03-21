import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { paises } from "../data/paises";
import { provinciasEcuador } from "../data/provinciasEcuador";
import { ciudadesEcuador } from "../data/ciudadesEcuador";
import { Link, useNavigate } from "react-router-dom";

function MiPerfilComprador() {
const navigate = useNavigate();

const [usuario, setUsuario] = useState(null);
const [compradorId, setCompradorId] = useState(null);
const [modoEdicion, setModoEdicion] = useState(false);
const [cargando, setCargando] = useState(true);
const [guardando, setGuardando] = useState(false);

const [nombre, setNombre] = useState("");
const [empresa, setEmpresa] = useState("");
const [cargo, setCargo] = useState("");
const [email, setEmail] = useState("");
const [telefono, setTelefono] = useState("");
const [pais, setPais] = useState("");
const [provincia, setProvincia] = useState("");
const [ciudad, setCiudad] = useState("");
const [descripcion, setDescripcion] = useState("");

useEffect(() => {
iniciar();
}, []);

const iniciar = async () => {
try {
setCargando(true);

const { data: userData, error: userError } = await supabase.auth.getUser();

if (userError) {
console.error("Error obteniendo usuario autenticado:", userError);
setCargando(false);
return;
}

const user = userData?.user || null;
setUsuario(user);

if (!user?.email) {
setCargando(false);
return;
}

setEmail(user.email);

const { data, error } = await supabase
.from("compradores")
.select("*")
.eq("email", user.email)
.order("created_at", { ascending: false })
.limit(1);

if (error) {
console.error("Error cargando comprador existente:", error);
setCargando(false);
return;
}

const comprador = data?.[0] || null;

if (comprador) {
setModoEdicion(true);
setCompradorId(comprador.id);

setNombre(comprador.nombre || "");
setEmpresa(comprador.empresa || "");
setCargo(comprador.cargo || "");
setEmail(comprador.email || user.email || "");
setTelefono(comprador.telefono || "");
setPais(comprador.pais || "");
setProvincia(comprador.provincia || "");
setCiudad(comprador.ciudad || "");
setDescripcion(comprador.descripcion || "");
}

setCargando(false);
} catch (err) {
console.error("Error general iniciando perfil comprador:", err);
setCargando(false);
}
};

const ciudadesDisponibles = provincia ? ciudadesEcuador[provincia] || [] : [];

const guardarComprador = async () => {
if (!nombre || !empresa || !cargo || !email || !telefono || !pais) {
alert("Por favor completa los campos obligatorios");
return;
}

if (pais === "Ecuador" && !provincia) {
alert("Por favor selecciona una provincia");
return;
}

if (pais === "Ecuador" && !ciudad) {
alert("Por favor selecciona una ciudad");
return;
}

try {
setGuardando(true);

const payload = {
auth_user_id: usuario?.id || null,
nombre,
empresa,
cargo,
email,
telefono,
pais,
provincia,
ciudad,
descripcion
};

if (!modoEdicion) {
const { error } = await supabase.from("compradores").insert([payload]);

if (error) {
console.error(error);
alert("Hubo un problema al registrar el comprador");
return;
}

alert("Perfil comprador creado correctamente");
} else {
const { error } = await supabase
.from("compradores")
.update(payload)
.eq("id", compradorId);

if (error) {
console.error(error);
alert("Hubo un problema al guardar los cambios");
return;
}

alert("Perfil comprador actualizado correctamente");
}

await iniciar();
} catch (err) {
console.error(err);
alert("Ocurrió un error al guardar el perfil comprador");
} finally {
setGuardando(false);
}
};

if (cargando) {
return (
<div
style={{
backgroundColor: "white",
borderRadius: "16px",
padding: "24px",
boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
}}
>
<p>Cargando perfil comprador...</p>
</div>
);
}

if (!usuario) {
return (
<div
style={{
backgroundColor: "white",
borderRadius: "16px",
padding: "24px",
boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
}}
>
<h2>Mi perfil comprador</h2>
<p>Debes iniciar sesión como comprador para registrar o editar tu perfil.</p>

<Link
to="/acceso-comprador"
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
Ir a acceso comprador
</Link>
</div>
);
}

return (
<div
style={{
backgroundColor: "white",
borderRadius: "16px",
padding: "24px",
boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
}}
>
<button
onClick={() => navigate(-1)}
style={{
marginBottom: "10px",
backgroundColor: "#e5e7eb",
border: "none",
padding: "8px 12px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold"
}}
>
← Volver
</button>

<h2>Mi perfil comprador</h2>

{modoEdicion ? (
<p style={{ marginBottom: "16px", color: "#555" }}>
Puedes actualizar tu información. El correo de acceso se mantiene bloqueado por seguridad.
</p>
) : (
<p style={{ marginBottom: "16px", color: "#555" }}>
Completa tu perfil como comprador. El correo usado en tu sesión será tu correo de acceso.
</p>
)}

<input
type="text"
placeholder="Nombre completo"
value={nombre}
onChange={(e) => setNombre(e.target.value)}
style={{
width: "100%",
padding: "12px",
marginBottom: "12px",
borderRadius: "10px",
border: "1px solid #ccc"
}}
/>

<input
type="text"
placeholder="Empresa"
value={empresa}
onChange={(e) => setEmpresa(e.target.value)}
style={{
width: "100%",
padding: "12px",
marginBottom: "12px",
borderRadius: "10px",
border: "1px solid #ccc"
}}
/>

<input
type="text"
placeholder="Cargo"
value={cargo}
onChange={(e) => setCargo(e.target.value)}
style={{
width: "100%",
padding: "12px",
marginBottom: "12px",
borderRadius: "10px",
border: "1px solid #ccc"
}}
/>

<input
type="email"
placeholder="Correo electrónico"
value={email}
disabled
style={{
width: "100%",
padding: "12px",
marginBottom: "12px",
borderRadius: "10px",
border: "1px solid #ccc",
backgroundColor: "#f3f3f3",
color: "#666"
}}
/>

<input
type="text"
placeholder="Teléfono"
value={telefono}
onChange={(e) => setTelefono(e.target.value)}
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
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
gap: "12px",
marginBottom: "12px"
}}
>
<select
value={pais}
onChange={(e) => {
setPais(e.target.value);
if (e.target.value !== "Ecuador") {
setProvincia("");
setCiudad("");
}
}}
style={{
padding: "12px",
borderRadius: "10px",
border: "1px solid #ccc"
}}
>
<option value="">País</option>
{paises.map((item) => (
<option key={item} value={item}>
{item}
</option>
))}
</select>

<select
value={provincia}
onChange={(e) => {
setProvincia(e.target.value);
setCiudad("");
}}
disabled={pais !== "Ecuador"}
style={{
padding: "12px",
borderRadius: "10px",
border: "1px solid #ccc",
backgroundColor: pais === "Ecuador" ? "white" : "#f3f3f3"
}}
>
<option value="">Provincia</option>
{provinciasEcuador.map((item) => (
<option key={item} value={item}>
{item}
</option>
))}
</select>

<select
value={ciudad}
onChange={(e) => setCiudad(e.target.value)}
disabled={!provincia}
style={{
padding: "12px",
borderRadius: "10px",
border: "1px solid #ccc",
backgroundColor: provincia ? "white" : "#f3f3f3"
}}
>
<option value="">Ciudad</option>
{ciudadesDisponibles.map((item) => (
<option key={item} value={item}>
{item}
</option>
))}
</select>
</div>

<textarea
placeholder="Descripción breve"
value={descripcion}
onChange={(e) => setDescripcion(e.target.value)}
style={{
width: "100%",
minHeight: "100px",
padding: "12px",
marginBottom: "12px",
borderRadius: "10px",
border: "1px solid #ccc"
}}
/>

<p style={{ color: "#6c757d", fontSize: "14px", marginBottom: "16px" }}>
Para cambiar tu correo de acceso, haremos un flujo aparte más adelante. Por ahora queda bloqueado por seguridad.
</p>

<button
onClick={guardarComprador}
disabled={guardando}
style={{
backgroundColor: "#1f3552",
color: "white",
border: "none",
padding: "12px 18px",
borderRadius: "10px",
cursor: "pointer"
}}
>
{guardando ? "Guardando..." : modoEdicion ? "Guardar cambios" : "Crear perfil comprador"}
</button>
</div>
);
}

export default MiPerfilComprador;