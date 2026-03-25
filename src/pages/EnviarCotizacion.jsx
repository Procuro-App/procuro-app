import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function EnviarCotizacion() {
const { id } = useParams();
const navigate = useNavigate();
const [searchParams] = useSearchParams();

const [requerimiento, setRequerimiento] = useState(null);
const [usuario, setUsuario] = useState(null);

const [proveedorData, setProveedorData] = useState(null);
const [mensaje, setMensaje] = useState("");
const [valorReferencial, setValorReferencial] = useState("");
const [archivo, setArchivo] = useState(null);

const [guardando, setGuardando] = useState(false);
const [cargando, setCargando] = useState(true);

const rol = localStorage.getItem("rol") || "";

const proveedorEmail = searchParams.get("proveedor_email") || "";
const proveedorNombre = searchParams.get("proveedor_nombre") || "";
const proveedorId = searchParams.get("proveedor_id") || "";

const esComprador = rol === "comprador";

useEffect(() => {
cargarDatos();
}, []);

const nombreProveedorMostrado = useMemo(() => {
if (esComprador) {
return (
proveedorData?.nombre ||
proveedorData?.contacto ||
proveedorNombre ||
proveedorEmail ||
"Proveedor"
);
}

return (
proveedorData?.nombre ||
proveedorData?.contacto ||
usuario?.email ||
"Proveedor"
);
}, [esComprador, proveedorData, proveedorNombre, proveedorEmail, usuario]);

const contactoProveedorMostrado = useMemo(() => {
return proveedorData?.contacto || "No definido";
}, [proveedorData]);

const emailProveedorMostrado = useMemo(() => {
if (esComprador) {
return proveedorData?.email || proveedorEmail || "No definido";
}

return proveedorData?.email || usuario?.email || "No definido";
}, [esComprador, proveedorData, proveedorEmail, usuario]);

const telefonoProveedorMostrado = useMemo(() => {
return (
proveedorData?.telefono ||
proveedorData?.telefono_secundario ||
"No definido"
);
}, [proveedorData]);

const cargarDatos = async () => {
try {
setCargando(true);

const { data: userData, error: userError } = await supabase.auth.getUser();

if (userError) {
console.error("Error obteniendo usuario autenticado:", userError);
}

const user = userData?.user || null;
setUsuario(user);

const { data: reqData, error: reqError } = await supabase
.from("requerimientos")
.select("*")
.eq("id", id)
.single();

if (reqError) {
console.error("Error cargando requerimiento:", reqError);
return;
}

setRequerimiento(reqData);

if (esComprador) {
if (proveedorId) {
const { data: proveedorDestino, error: proveedorDestinoError } =
await supabase
.from("proveedores")
.select("*")
.eq("id", proveedorId)
.maybeSingle();

if (proveedorDestinoError) {
console.error(
"Error cargando proveedor destino:",
proveedorDestinoError
);
} else {
setProveedorData(proveedorDestino || null);
}
}
} else {
if (user?.email) {
const { data: proveedorPropio, error: proveedorPropioError } =
await supabase
.from("proveedores")
.select("*")
.eq("email", user.email)
.maybeSingle();

if (proveedorPropioError) {
console.error(
"Error cargando proveedor logueado:",
proveedorPropioError
);
} else {
setProveedorData(proveedorPropio || null);
}
}
}
} catch (error) {
console.error("Error general cargando datos:", error);
} finally {
setCargando(false);
}
};

const subirArchivo = async () => {
if (!archivo) return "";

const extension = archivo.name.includes(".")
? archivo.name.split(".").pop()
: "file";

const nombreSeguro = `${id}/${Date.now()}-${Math.random()
.toString(36)
.slice(2)}.${extension}`;

const { error } = await supabase.storage
.from("cotizaciones")
.upload(nombreSeguro, archivo, {
cacheControl: "3600",
upsert: true,
});

if (error) {
console.error("Error subiendo archivo:", error);
throw new Error(error.message || "Error subiendo archivo");
}

const { data } = supabase.storage
.from("cotizaciones")
.getPublicUrl(nombreSeguro);

return data?.publicUrl || "";
};

const solicitarCotizacion = async () => {
if (!usuario?.email) {
alert("Debes iniciar sesión como comprador.");
return;
}

if (!requerimiento?.id) {
alert("No se encontró el requerimiento.");
return;
}

if (!proveedorEmail && !proveedorData?.email) {
alert("No se encontró el proveedor de destino.");
return;
}

try {
setGuardando(true);

const emailDestino = proveedorData?.email || proveedorEmail;
const nombreDestino =
proveedorData?.nombre ||
proveedorData?.contacto ||
proveedorNombre ||
emailDestino;

const { data: conversacionExistente, error: errorBusqueda } =
await supabase
.from("conversaciones")
.select("*")
.eq("comprador_email", usuario.email)
.eq("proveedor_email", emailDestino)
.eq("requerimiento_id", id)
.maybeSingle();

if (errorBusqueda) {
alert(`Error buscando conversación: ${errorBusqueda.message}`);
return;
}

let conversacion = conversacionExistente;

if (!conversacion) {
const { data: nueva, error: errorCreacion } = await supabase
.from("conversaciones")
.insert([
{
comprador_email: usuario.email,
proveedor_email: emailDestino,
proveedor_nombre: nombreDestino,
proveedor_id: proveedorId || proveedorData?.id || null,
requerimiento_id: id,
requerimiento_nombre: requerimiento.nombre_requerimiento,
},
])
.select()
.single();

if (errorCreacion) {
alert(`Error creando conversación: ${errorCreacion.message}`);
return;
}

conversacion = nueva;
}

const textoSolicitud = `Solicitud formal de cotización para: ${
requerimiento.nombre_requerimiento
}${
requerimiento.descripcion
? `\n\nDetalle del requerimiento: ${requerimiento.descripcion}`
: ""
}${
mensaje.trim()
? `\n\nObservación adicional: ${mensaje.trim()}`
: ""
}`;

const { error: errorMensaje } = await supabase.from("mensajes").insert([
{
conversacion_id: conversacion.id,
remitente_email: usuario.email,
mensaje: textoSolicitud,
archivo_url: requerimiento.archivo_url || null,
archivo_nombre: requerimiento.archivo_nombre || null,
},
]);

if (errorMensaje) {
alert(`Error enviando solicitud: ${errorMensaje.message}`);
return;
}

alert("Solicitud enviada correctamente");
navigate(-1);
} catch (err) {
console.error(err);
alert("Error enviando solicitud");
} finally {
setGuardando(false);
}
};

const enviarCotizacion = async () => {
if (!valorReferencial.trim()) {
alert(
"Debes ingresar el valor total de la cotización. Este dato alimenta el comparativo de precios del comprador."
);
return;
}


if (!requerimiento?.id) {
alert("No se encontró el requerimiento.");
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
requerimiento_id: id,
requerimiento_nombre: requerimiento.nombre_requerimiento,
proveedor_nombre: nombreProveedorMostrado,
contacto: contactoProveedorMostrado,
email: emailProveedorMostrado,
telefono: telefonoProveedorMostrado,
mensaje,
valor_referencial: valorReferencial.trim(),
archivo_url: archivoUrl,
estado: "Enviada",
},
]);

if (error) {
console.error("Error enviando cotización:", error);
alert(`Error enviando cotización: ${error.message}`);
return;
}

alert("Cotización enviada correctamente");
navigate("/oportunidades");
} catch (err) {
console.error(err);
alert(err.message || "Error enviando cotización");
} finally {
setGuardando(false);
}
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
};

const inputStyle = {
width: "100%",
padding: "12px",
marginBottom: "12px",
borderRadius: "10px",
border: "1px solid #ccc",
boxSizing: "border-box",
};

const inputSoloLectura = {
...inputStyle,
backgroundColor: "#f3f4f6",
color: "#6b7280",
};

const miniInfo = {
backgroundColor: "white",
borderRadius: "12px",
padding: "14px",
border: "1px solid #ececec",
boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
};

if (cargando) {
return (
<div style={cardSecundaria}>
<p>Cargando...</p>
</div>
);
}

return (
<div>
<button
onClick={() => navigate(-1)}
style={{
marginBottom: "16px",
backgroundColor: "#e5e7eb",
border: "none",
padding: "8px 12px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold",
}}
>
← Volver
</button>

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
{esComprador ? "Solicitud formal" : "Cotización formal"}
</p>

<h1
style={{
margin: "8px 0 0 0",
fontSize: "30px",
color: "#1f3552",
fontWeight: "800",
}}
>
{esComprador ? "Solicitar cotización" : "Enviar cotización"}
</h1>

<p
style={{
marginTop: "8px",
marginBottom: 0,
color: "#5b6472",
lineHeight: 1.5,
}}
>
{esComprador
? "Primero realiza una solicitud formal al proveedor. Luego, si hace falta, podrás continuar por chat para negociar."
: "Envía tu propuesta formal con el valor total y el archivo de respaldo para alimentar el comparativo del comprador."}
</p>
</div>

<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
gap: "14px",
marginBottom: "18px",
}}
>
<div style={miniInfo}>
<p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>
Requerimiento
</p>
<p
style={{
margin: "6px 0 0 0",
fontWeight: "800",
color: "#1f3552",
}}
>
{requerimiento?.nombre_requerimiento || "No disponible"}
</p>
</div>

<div style={miniInfo}>
<p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>
{esComprador ? "Proveedor seleccionado" : "Proveedor"}
</p>
<p
style={{
margin: "6px 0 0 0",
fontWeight: "800",
color: "#1f3552",
}}
>
{nombreProveedorMostrado || "No disponible"}
</p>
</div>
</div>

<div style={cardSecundaria}>
{!esComprador && (
<>
<input
type="text"
value={nombreProveedorMostrado}
readOnly
style={inputSoloLectura}
/>

<input
type="text"
value={contactoProveedorMostrado}
readOnly
style={inputSoloLectura}
/>

<input
type="email"
value={emailProveedorMostrado}
readOnly
style={inputSoloLectura}
/>

<input
type="text"
value={telefonoProveedorMostrado}
readOnly
style={inputSoloLectura}
/>
</>
)}

<textarea
placeholder={
esComprador
? "Mensaje adicional para el proveedor (opcional)"
: "Mensaje adicional o aclaración sobre la cotización (opcional)"
}
value={mensaje}
onChange={(e) => setMensaje(e.target.value)}
style={{
...inputStyle,
minHeight: "120px",
resize: "vertical",
}}
/>

{!esComprador && (
<>
<div style={{ marginBottom: "14px" }}>
<label
style={{
display: "block",
marginBottom: "6px",
fontWeight: "700",
color: "#1f3552",
fontSize: "14px",
}}
>
Valor total de la cotización *
</label>

<input
type="text"
placeholder="Obligatorio. Este valor alimenta el comparativo de precios."
value={valorReferencial}
onChange={(e) => setValorReferencial(e.target.value)}
style={inputStyle}
/>

<p
style={{
margin: "6px 0 0 0",
color: "#92400e",
fontSize: "13px",
lineHeight: 1.5,
}}
>
Este campo es obligatorio porque se usa para alimentar el comparativo de precios del comprador.
</p>
</div>

<input
type="file"
accept=".pdf,.xlsx,.doc,.docx"
onChange={(e) => setArchivo(e.target.files?.[0] || null)}
style={{ marginBottom: "14px" }}
/>
</>
)}

<button
onClick={esComprador ? solicitarCotizacion : enviarCotizacion}
disabled={guardando}
style={{
backgroundColor: "#1f3552",
color: "white",
border: "none",
padding: "12px 18px",
borderRadius: "10px",
cursor: "pointer",
fontWeight: "bold",
}}
>
{guardando
? "Procesando..."
: esComprador
? "Solicitar cotización"
: "Enviar cotización"}
</button>
</div>
</div>
);
}

export default EnviarCotizacion;
