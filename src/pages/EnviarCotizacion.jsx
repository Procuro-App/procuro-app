import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function EnviarCotizacion() {
const { id } = useParams();
const navigate = useNavigate();

const [requerimiento, setRequerimiento] = useState(null);
const [proveedorNombre, setProveedorNombre] = useState("");
const [contacto, setContacto] = useState("");
const [email, setEmail] = useState("");
const [telefono, setTelefono] = useState("");
const [mensaje, setMensaje] = useState("");
const [valorReferencial, setValorReferencial] = useState("");
const [archivo, setArchivo] = useState(null);
const [guardando, setGuardando] = useState(false);
const [cargando, setCargando] = useState(true);

useEffect(() => {
cargarRequerimiento();
}, []);

const cargarRequerimiento = async () => {
try {
setCargando(true);

if (!id) {
setCargando(false);
return;
}

const { data, error } = await supabase
.from("requerimientos")
.select("*")
.eq("id", id)
.single();

if (error) {
console.error("Error cargando requerimiento:", error);
setCargando(false);
return;
}

setRequerimiento(data);
} catch (error) {
console.error("Error general cargando requerimiento:", error);
} finally {
setCargando(false);
}
};

const subirArchivo = async () => {
if (!archivo) return "";

const nombreArchivo = `${Date.now()}-${archivo.name}`;
const ruta = `${id}/${nombreArchivo}`;

const { error } = await supabase.storage
.from("cotizaciones")
.upload(ruta, archivo);

if (error) {
console.error("Error subiendo archivo:", error);
throw error;
}

const { data } = supabase.storage.from("cotizaciones").getPublicUrl(ruta);

return data.publicUrl;
};

const enviarCotizacion = async () => {
if (!proveedorNombre || !contacto || !email) {
alert("Completa los campos obligatorios");
return;
}

if (!requerimiento?.id) {
alert("No se encontró el requerimiento");
return;
}

try {
setGuardando(true);

let archivoUrl = "";

if (archivo) {
archivoUrl = await subirArchivo();
}

const { error } = await supabase.from("cotizaciones").insert([
{
requerimiento_id: requerimiento.id,
requerimiento_nombre: requerimiento.nombre_requerimiento,
proveedor_nombre: proveedorNombre,
contacto,
email,
telefono,
mensaje,
valor_referencial: valorReferencial,
archivo_url: archivoUrl,
estado: "Enviada",
},
]);

if (error) {
console.error(error);
alert("Error al guardar la cotización");
return;
}

alert("Cotización enviada correctamente");

setProveedorNombre("");
setContacto("");
setEmail("");
setTelefono("");
setMensaje("");
setValorReferencial("");
setArchivo(null);

navigate("/oportunidades");
} catch (err) {
console.error(err);
alert("Error subiendo archivo");
} finally {
setGuardando(false);
}
};

const cardStyle = {
backgroundColor: "white",
borderRadius: "16px",
padding: "24px",
boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
};

if (!id) {
return (
<div style={cardStyle}>
<button
onClick={() => navigate("/oportunidades")}
style={{
marginBottom: "12px",
backgroundColor: "#e5e7eb",
border: "none",
padding: "8px 12px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold",
}}
>
← Volver a oportunidades
</button>

<h2>Enviar cotización</h2>
<p>Error: no se recibió el requerimiento.</p>
</div>
);
}

if (cargando) {
return (
<div style={cardStyle}>
<button
onClick={() => navigate("/oportunidades")}
style={{
marginBottom: "12px",
backgroundColor: "#e5e7eb",
border: "none",
padding: "8px 12px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold",
}}
>
← Volver a oportunidades
</button>

<p>Cargando requerimiento...</p>
</div>
);
}

return (
<div style={cardStyle}>
<button
onClick={() => navigate("/oportunidades")}
style={{
marginBottom: "12px",
backgroundColor: "#e5e7eb",
border: "none",
padding: "8px 12px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold",
}}
>
← Volver a oportunidades
</button>

<h2>Enviar cotización</h2>

{requerimiento ? (
<div style={{ marginBottom: "20px" }}>
<h3>{requerimiento.nombre_requerimiento}</h3>
<p>
<strong>Sector:</strong> {requerimiento.sector || "No especificado"}
</p>
<p>
<strong>Categoría:</strong>{" "}
{requerimiento.categoria || "No especificada"}
</p>
</div>
) : (
<p>No se pudo cargar el requerimiento.</p>
)}

<input
type="text"
placeholder="Nombre del proveedor"
value={proveedorNombre}
onChange={(e) => setProveedorNombre(e.target.value)}
style={{
width: "100%",
padding: "10px",
marginBottom: "10px",
borderRadius: "8px",
border: "1px solid #ccc",
}}
/>

<input
type="text"
placeholder="Contacto"
value={contacto}
onChange={(e) => setContacto(e.target.value)}
style={{
width: "100%",
padding: "10px",
marginBottom: "10px",
borderRadius: "8px",
border: "1px solid #ccc",
}}
/>

<input
type="email"
placeholder="Correo"
value={email}
onChange={(e) => setEmail(e.target.value)}
style={{
width: "100%",
padding: "10px",
marginBottom: "10px",
borderRadius: "8px",
border: "1px solid #ccc",
}}
/>

<input
type="text"
placeholder="Teléfono"
value={telefono}
onChange={(e) => setTelefono(e.target.value)}
style={{
width: "100%",
padding: "10px",
marginBottom: "10px",
borderRadius: "8px",
border: "1px solid #ccc",
}}
/>

<input
type="text"
placeholder="Valor referencial"
value={valorReferencial}
onChange={(e) => setValorReferencial(e.target.value)}
style={{
width: "100%",
padding: "10px",
marginBottom: "10px",
borderRadius: "8px",
border: "1px solid #ccc",
}}
/>

<textarea
placeholder="Mensaje"
value={mensaje}
onChange={(e) => setMensaje(e.target.value)}
style={{
width: "100%",
padding: "10px",
marginBottom: "10px",
borderRadius: "8px",
border: "1px solid #ccc",
minHeight: "100px",
}}
/>

<input
type="file"
accept=".pdf,.xlsx,.docx"
onChange={(e) => setArchivo(e.target.files?.[0] || null)}
style={{ marginBottom: "12px" }}
/>

<button
onClick={enviarCotizacion}
disabled={guardando}
style={{
backgroundColor: "#1f3552",
color: "white",
border: "none",
padding: "12px 18px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold",
}}
>
{guardando ? "Enviando..." : "Enviar cotización"}
</button>
</div>
);
}

export default EnviarCotizacion;