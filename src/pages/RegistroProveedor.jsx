import { useEffect, useState } from "react";
import { sectores } from "../data/categorias";
import { paises } from "../data/paises";
import { provinciasEcuador } from "../data/provinciasEcuador";
import { ciudadesEcuador } from "../data/ciudadesEcuador";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";

const validarIdentificacionFiscal = (valor) => {
if (!valor) return false;

const limpio = String(valor).trim();

// Permite letras, números y guiones
if (!/^[A-Za-z0-9-]+$/.test(limpio)) return false;

// Longitud flexible para IDs fiscales internacionales
if (limpio.length < 8 || limpio.length > 20) return false;

return true;
};

function RegistroProveedor() {
const navigate = useNavigate();

const [usuario, setUsuario] = useState(null);
const [proveedorId, setProveedorId] = useState(null);
const [modoEdicion, setModoEdicion] = useState(false);
const [cargando, setCargando] = useState(true);

const [nombre, setNombre] = useState("");
const [tipoPersona, setTipoPersona] = useState("");
const [rucRut, setRucRut] = useState("");
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
.from("proveedores")
.select("*")
.eq("email", user.email)
.order("created_at", { ascending: false })
.limit(1);

if (error) {
console.error("Error cargando proveedor existente:", error);
setCargando(false);
return;
}

const proveedor = data?.[0] || null;

if (proveedor) {
setModoEdicion(true);
setProveedorId(proveedor.id);

setNombre(proveedor.nombre || "");
setTipoPersona(proveedor.tipo_persona || "");
setRucRut(proveedor.ruc_rut || "");
setCobertura(proveedor.cobertura || "");
setPais(proveedor.pais || "");
setProvincia(proveedor.provincia || "");
setCiudad(proveedor.ciudad || "");
setSector(proveedor.sector || "");
setCategoria(proveedor.categoria || "");
setDescripcion(proveedor.descripcion || "");
setContacto(proveedor.contacto || "");
setCargo(proveedor.cargo || "");
setEmail(proveedor.email || user.email || "");
setTelefono(proveedor.telefono || "");
setTelefonoSecundario(proveedor.telefono_secundario || "");
}

setCargando(false);
} catch (err) {
console.error("Error general iniciando registro/edición proveedor:", err);
setCargando(false);
}
};

const categoriasDisponibles = sector ? sectores[sector] || [] : [];
const ciudadesDisponibles = provincia ? ciudadesEcuador[provincia] || [] : [];

const subirArchivoProveedor = async (archivo, carpeta = "general") => {
if (!archivo) return "";

const nombreOriginal = archivo.name;

// limpiar nombre (sin espacios ni símbolos raros)
const nombreLimpio = nombreOriginal
.normalize("NFD") // quita tildes
.replace(/[\u0300-\u036f]/g, "")
.replace(/[^a-zA-Z0-9.]/g, "_"); // solo letras, números y punto

const nombreSeguro = `${Date.now()}-${nombreLimpio}`;
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

const { data } = supabase.storage.from("proveedores").getPublicUrl(ruta);

return data?.publicUrl || "";
};

const guardarProveedor = async () => {
if (
!nombre ||
!tipoPersona ||
!rucRut ||
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

if (!validarIdentificacionFiscal(rucRut)) {
alert(
"La identificación fiscal debe tener entre 8 y 20 caracteres, usando solo letras, números o guiones."
);
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

if (brochure) brochureUrl = await subirArchivoProveedor(brochure, "brochure");
if (presentacion) presentacionUrl = await subirArchivoProveedor(presentacion, "presentacion");
if (certificaciones) certificacionesUrl = await subirArchivoProveedor(certificaciones, "certificaciones");
if (catalogo) catalogoUrl = await subirArchivoProveedor(catalogo, "catalogo");

const payloadBase = {
nombre,
tipo_persona: tipoPersona,
ruc_rut: String(rucRut).trim(),
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
telefono_secundario: telefonoSecundario
};

if (!modoEdicion) {
const { error } = await supabase.from("proveedores").insert([
{
...payloadBase,
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
} else {
const updatePayload = {
...payloadBase
};

if (brochureUrl) updatePayload.brochure_url = brochureUrl;
if (presentacionUrl) updatePayload.presentacion_url = presentacionUrl;
if (certificacionesUrl) updatePayload.certificaciones_url = certificacionesUrl;
if (catalogoUrl) updatePayload.catalogo_url = catalogoUrl;

const { error } = await supabase
.from("proveedores")
.update(updatePayload)
.eq("id", proveedorId);

if (error) {
console.error(error);
alert("Hubo un problema al guardar los cambios");
return;
}

alert("Perfil de proveedor actualizado correctamente");
}

await iniciar();
} catch (err) {
console.error("Error real guardando proveedor:", err);
alert(`Ocurrió un error: ${err.message || "Error desconocido"}`);
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
<p>Cargando formulario de proveedor...</p>
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
<h2>Mi perfil proveedor</h2>
<p>Debes iniciar sesión como proveedor para registrar o editar tu perfil.</p>

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
Ir a acceso proveedor
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

<h2>Mi perfil proveedor</h2>

{modoEdicion ? (
<p style={{ marginBottom: "16px", color: "#555" }}>
Puedes actualizar tu información. El correo de acceso se mantiene bloqueado por seguridad.
</p>
) : (
<p style={{ marginBottom: "16px", color: "#555" }}>
Completa tu registro como proveedor. El correo usado en tu sesión será tu correo de acceso.
</p>
)}

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

<input
type="text"
placeholder="RUC / RUT / Tax ID"
value={rucRut}
onChange={(e) => setRucRut(e.target.value)}
style={{
width: "100%",
padding: "12px",
marginBottom: "6px",
borderRadius: "10px",
border: "1px solid #ccc"
}}
/>

<p style={{ color: "#6c757d", fontSize: "14px", marginBottom: "12px" }}>
Ingresa una identificación fiscal válida entre 8 y 20 caracteres. Puede contener letras, números o guiones.
</p>

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
disabled
style={{
padding: "12px",
borderRadius: "10px",
border: "1px solid #ccc",
backgroundColor: "#f3f3f3",
color: "#666"
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
Para cambiar tu correo de acceso, solicitaremos ese flujo en una etapa posterior. Por ahora el correo queda bloqueado por seguridad.
</p>

<h3 style={{ marginTop: "20px" }}>Actualizar documentos (opcional)</h3>

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
onClick={guardarProveedor}
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
{guardando
? "Guardando..."
: modoEdicion
? "Guardar cambios"
: "Registrar proveedor"}
</button>
</div>
);
}

export default RegistroProveedor;
