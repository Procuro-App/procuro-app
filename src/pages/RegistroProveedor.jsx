import { useState } from "react";
import { sectores } from "../data/categorias";
import { paises } from "../data/paises";
import { provinciasEcuador } from "../data/provinciasEcuador";
import { ciudadesEcuador } from "../data/ciudadesEcuador";
import { supabase } from "../lib/supabase";

function RegistroProveedor() {
const [nombre, setNombre] = useState("");
const [tipoPersona, setTipoPersona] = useState("");
const [cobertura, setCobertura] = useState("");
const [pais, setPais] = useState("");
const [provincia, setProvincia] = useState("");
const [ciudad, setCiudad] = useState("");
const [sector, setSector] = useState("");
const [categoria, setCategoria] = useState("");
const [descripcion, setDescripcion] = useState("");
const [contacto, setContacto] = useState("");
const [cargo, setCargo] = useState("");
const [email, setEmail] = useState("");
const [telefono, setTelefono] = useState("");
const [telefonoSecundario, setTelefonoSecundario] = useState("");

const [brochure, setBrochure] = useState(null);
const [presentacion, setPresentacion] = useState(null);
const [certificaciones, setCertificaciones] = useState(null);
const [catalogo, setCatalogo] = useState(null);

const [guardando, setGuardando] = useState(false);

const categoriasDisponibles = sector ? sectores[sector] || [] : [];
const ciudadesDisponibles = provincia ? ciudadesEcuador[provincia] || [] : [];

const subirArchivoProveedor = async (archivo, carpeta = "general") => {
if (!archivo) return "";

const nombreSeguro = `${Date.now()}-${archivo.name.replace(/\s+/g, "-")}`;
const ruta = `${carpeta}/${nombreSeguro}`;

const { error } = await supabase.storage
.from("proveedores")
.upload(ruta, archivo, {
cacheControl: "3600",
upsert: false
});

if (error) {
console.error(`Error subiendo archivo ${carpeta}:`, error);
throw error;
}

const { data } = supabase.storage
.from("proveedores")
.getPublicUrl(ruta);

return data?.publicUrl || "";
};

const registrarProveedor = async () => {
if (
!nombre ||
!tipoPersona ||
!cobertura ||
!pais ||
!sector ||
!categoria ||
!contacto ||
!email ||
!telefono
) {
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

let brochureUrl = "";
let presentacionUrl = "";
let certificacionesUrl = "";
let catalogoUrl = "";

if (brochure) {
brochureUrl = await subirArchivoProveedor(brochure, "brochure");
}

if (presentacion) {
presentacionUrl = await subirArchivoProveedor(presentacion, "presentacion");
}

if (certificaciones) {
certificacionesUrl = await subirArchivoProveedor(certificaciones, "certificaciones");
}

if (catalogo) {
catalogoUrl = await subirArchivoProveedor(catalogo, "catalogo");
}

const { error } = await supabase.from("proveedores").insert([
{
nombre,
tipo_persona: tipoPersona,
cobertura,
pais,
provincia,
ciudad,
sector,
categoria,
descripcion,
contacto,
cargo,
email,
telefono,
telefono_secundario: telefonoSecundario,
brochure_url: brochureUrl,
presentacion_url: presentacionUrl,
certificaciones_url: certificacionesUrl,
catalogo_url: catalogoUrl,
plan: "Gratis",
verificado: false,
patrocinado: false,
estado: "Pendiente",
fecha_registro: new Date().toLocaleString()
}
]);

if (error) {
console.error(error);
alert("Hubo un problema al registrar el proveedor");
return;
}

alert("Proveedor enviado a revisión correctamente");

setNombre("");
setTipoPersona("");
setCobertura("");
setPais("");
setProvincia("");
setCiudad("");
setSector("");
setCategoria("");
setDescripcion("");
setContacto("");
setCargo("");
setEmail("");
setTelefono("");
setTelefonoSecundario("");
setBrochure(null);
setPresentacion(null);
setCertificaciones(null);
setCatalogo(null);
} catch (err) {
console.error(err);
alert("Ocurrió un error al subir los archivos o registrar el proveedor");
} finally {
setGuardando(false);
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
<h2>Registro de proveedor</h2>

<input
type="text"
placeholder="Nombre de empresa"
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

<select
value={tipoPersona}
onChange={(e) => setTipoPersona(e.target.value)}
style={{
width: "100%",
padding: "12px",
marginBottom: "12px",
borderRadius: "10px",
border: "1px solid #ccc"
}}
>
<option value="">Tipo de proveedor</option>
<option value="Persona Natural">Persona Natural</option>
<option value="Persona Jurídica">Persona Jurídica</option>
</select>

<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
gap: "12px",
marginBottom: "12px"
}}
>
<select
value={cobertura}
onChange={(e) => {
setCobertura(e.target.value);
setPais("");
setProvincia("");
setCiudad("");
}}
style={{
padding: "12px",
borderRadius: "10px",
border: "1px solid #ccc"
}}
>
<option value="">Cobertura</option>
<option value="Nacional">Nacional</option>
<option value="Internacional">Internacional</option>
</select>

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

<select
value={sector}
onChange={(e) => {
setSector(e.target.value);
setCategoria("");
}}
style={{
padding: "12px",
borderRadius: "10px",
border: "1px solid #ccc"
}}
>
<option value="">Sector</option>
{Object.keys(sectores).map((item) => (
<option key={item} value={item}>
{item}
</option>
))}
</select>

<select
value={categoria}
onChange={(e) => setCategoria(e.target.value)}
disabled={!sector}
style={{
padding: "12px",
borderRadius: "10px",
border: "1px solid #ccc",
backgroundColor: sector ? "white" : "#f3f3f3"
}}
>
<option value="">Categoría</option>
{categoriasDisponibles.map((item) => (
<option key={item} value={item}>
{item}
</option>
))}
</select>
</div>

<textarea
placeholder="Descripción"
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

<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
gap: "12px",
marginBottom: "12px"
}}
>
<input
type="text"
placeholder="Nombre de contacto"
value={contacto}
onChange={(e) => setContacto(e.target.value)}
style={{
padding: "12px",
borderRadius: "10px",
border: "1px solid #ccc"
}}
/>

<input
type="text"
placeholder="Cargo"
value={cargo}
onChange={(e) => setCargo(e.target.value)}
translate="no"
lang="es"
style={{
padding: "12px",
borderRadius: "10px",
border: "1px solid #ccc"
}}
/>

<input
type="email"
placeholder="Correo electrónico"
value={email}
onChange={(e) => setEmail(e.target.value)}
style={{
padding: "12px",
borderRadius: "10px",
border: "1px solid #ccc"
}}
/>

<input
type="text"
placeholder="Teléfono principal"
value={telefono}
onChange={(e) => setTelefono(e.target.value)}
style={{
padding: "12px",
borderRadius: "10px",
border: "1px solid #ccc"
}}
/>

<input
type="text"
placeholder="Teléfono secundario (opcional)"
value={telefonoSecundario}
onChange={(e) => setTelefonoSecundario(e.target.value)}
style={{
padding: "12px",
borderRadius: "10px",
border: "1px solid #ccc"
}}
/>
</div>

<p style={{ color: "#6c757d", fontSize: "14px", marginBottom: "16px" }}>
Nota: El teléfono principal debe corresponder a un número institucional o corporativo que permanezca activo en el tiempo. Evite registrar números personales que puedan cambiar por rotación de personal.
</p>

<h3 style={{ marginTop: "20px" }}>Documentos opcionales</h3>

<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
gap: "12px",
marginBottom: "16px"
}}
>
<div>
<label style={{ display: "block", marginBottom: "6px" }}>Brochure</label>
<input
type="file"
accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
onChange={(e) => setBrochure(e.target.files?.[0] || null)}
style={{
padding: "12px",
borderRadius: "10px",
border: "1px solid #ccc",
width: "100%"
}}
/>
</div>

<div>
<label style={{ display: "block", marginBottom: "6px" }}>Presentación</label>
<input
type="file"
accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
onChange={(e) => setPresentacion(e.target.files?.[0] || null)}
style={{
padding: "12px",
borderRadius: "10px",
border: "1px solid #ccc",
width: "100%"
}}
/>
</div>

<div>
<label style={{ display: "block", marginBottom: "6px" }}>Certificaciones</label>
<input
type="file"
accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
onChange={(e) => setCertificaciones(e.target.files?.[0] || null)}
style={{
padding: "12px",
borderRadius: "10px",
border: "1px solid #ccc",
width: "100%"
}}
/>
</div>

<div>
<label style={{ display: "block", marginBottom: "6px" }}>Catálogo</label>
<input
type="file"
accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
onChange={(e) => setCatalogo(e.target.files?.[0] || null)}
style={{
padding: "12px",
borderRadius: "10px",
border: "1px solid #ccc",
width: "100%"
}}
/>
</div>
</div>

<button
onClick={registrarProveedor}
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
{guardando ? "Guardando..." : "Registrar proveedor"}
</button>
</div>
);
}

export default RegistroProveedor;