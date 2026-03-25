import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { sectores } from "../data/categorias";
import { paises } from "../data/paises";
import { provinciasEcuador } from "../data/provinciasEcuador";
import { ciudadesEcuador } from "../data/ciudadesEcuador";
import { Link, useNavigate } from "react-router-dom";

function Requerimientos() {
const navigate = useNavigate();

const [usuario, setUsuario] = useState(null);

const [nombreRequerimiento, setNombreRequerimiento] = useState("");
const [cobertura, setCobertura] = useState("");
const [pais, setPais] = useState("");
const [provincia, setProvincia] = useState("");
const [ciudad, setCiudad] = useState("");
const [sector, setSector] = useState("");
const [categoria, setCategoria] = useState("");
const [descripcion, setDescripcion] = useState("");
const [archivo, setArchivo] = useState(null);

const [guardando, setGuardando] = useState(false);
const [requerimientos, setRequerimientos] = useState([]);
const [cargando, setCargando] = useState(true);
const [busqueda, setBusqueda] = useState("");

const isMobile =
typeof window !== "undefined" ? window.innerWidth <= 768 : false;

useEffect(() => {
iniciar();
}, []);

const iniciar = async () => {
const { data } = await supabase.auth.getUser();
setUsuario(data?.user || null);
await cargarRequerimientosPrivados(data?.user || null);
};

const cargarRequerimientosPrivados = async (user) => {
try {
setCargando(true);

if (!user?.id) {
setRequerimientos([]);
setCargando(false);
return;
}

const { data, error } = await supabase
.from("requerimientos")
.select("*")
.eq("comprador_user_id", user.id)
.order("created_at", { ascending: false });

if (error) {
console.error("Error cargando requerimientos:", error);
setCargando(false);
return;
}

setRequerimientos(data || []);
} finally {
setCargando(false);
}
};

const subirArchivoRequerimiento = async (file, userId) => {
if (!file) {
return { url: "", nombre: "" };
}

const extension = file.name.includes(".")
? file.name.split(".").pop()
: "file";

const nombreSeguro = `${userId}/${Date.now()}-${Math.random()
.toString(36)
.slice(2)}.${extension}`;

const { error } = await supabase.storage
.from("requerimientos")
.upload(nombreSeguro, file, {
cacheControl: "3600",
upsert: true,
});

if (error) {
console.error("Error subiendo archivo del requerimiento:", error);
throw new Error(error.message || "No fue posible subir el archivo");
}

const { data } = supabase.storage
.from("requerimientos")
.getPublicUrl(nombreSeguro);

return {
url: data?.publicUrl || "",
nombre: file.name,
};
};

const categoriasDisponibles = sector ? sectores[sector] || [] : [];
const ciudadesDisponibles = provincia
? ciudadesEcuador[provincia] || []
: [];

const crearRequerimiento = async () => {
if (!usuario?.id || !usuario?.email) {
alert("Debes iniciar sesión como comprador para crear requerimientos.");
return;
}

if (!nombreRequerimiento || !cobertura || !pais || !sector) {
alert("Completa los campos obligatorios");
return;
}

if (pais === "Ecuador" && !provincia) {
alert("Selecciona una provincia");
return;
}

if (pais === "Ecuador" && !ciudad) {
alert("Selecciona una ciudad");
return;
}

try {
setGuardando(true);

let archivoSubidoUrl = "";
let archivoSubidoNombre = "";

if (archivo) {
const resultadoArchivo = await subirArchivoRequerimiento(
archivo,
usuario.id
);
archivoSubidoUrl = resultadoArchivo.url;
archivoSubidoNombre = resultadoArchivo.nombre;
}

const { error } = await supabase.from("requerimientos").insert([
{
nombre_requerimiento: nombreRequerimiento,
cobertura,
pais,
provincia,
ciudad,
sector,
categoria: categoria || null,
descripcion,
estado: "Abierto",
comprador_email: usuario.email,
comprador_user_id: usuario.id,
archivo_url: archivoSubidoUrl,
archivo_nombre: archivoSubidoNombre,
},
]);

if (error) {
console.error("Error insertando requerimiento:", error);
alert(`No fue posible crear el requerimiento: ${error.message}`);
return;
}

alert("Requerimiento creado correctamente");

setNombreRequerimiento("");
setCobertura("");
setPais("");
setProvincia("");
setCiudad("");
setSector("");
setCategoria("");
setDescripcion("");
setArchivo(null);

await cargarRequerimientosPrivados(usuario);
} catch (err) {
console.error("Error general creando requerimiento:", err);
alert(
`Ocurrió un error al crear el requerimiento: ${
err.message || "Error desconocido"
}`
);
} finally {
setGuardando(false);
}
};

const abrirProveedoresParaRequerimiento = (req) => {
const titulo = encodeURIComponent(req.nombre_requerimiento || "");
const sectorReq = encodeURIComponent(req.sector || "");

navigate(
`/proveedores?requerimiento_id=${req.id}&requerimiento_nombre=${titulo}&sector=${sectorReq}`
);
};

const verCotizacionesDeRequerimiento = () => {
navigate("/cotizaciones");
};

const textoSeguro = (valor) => String(valor || "").trim().toLowerCase();

const requerimientosFiltrados = useMemo(() => {
if (!busqueda.trim()) return requerimientos;

const q = textoSeguro(busqueda);

return requerimientos.filter((r) => {
const campos = [
r.nombre_requerimiento,
r.descripcion,
r.sector,
r.categoria,
r.cobertura,
r.pais,
r.provincia,
r.ciudad,
r.estado,
]
.map((x) => textoSeguro(x))
.join(" ");

return campos.includes(q);
});
}, [requerimientos, busqueda]);

const paginaStyle = {
minHeight: "100vh",
background:
"linear-gradient(135deg, #111827 0%, #1f2937 38%, #1f3552 72%, #0f172a 100%)",
padding: isMobile ? "16px" : "30px",
};

const cardPrincipal = {
background:
"linear-gradient(135deg, rgba(245,239,230,0.98), rgba(241,233,221,0.96))",
borderRadius: "24px",
padding: isMobile ? "22px 18px" : "30px 32px",
boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
border: "1px solid rgba(249, 115, 22, 0.16)",
marginBottom: "20px",
position: "relative",
overflow: "hidden",
};

const cardSecundaria = {
background: "#f8f5ef",
borderRadius: "20px",
padding: isMobile ? "20px 16px" : "24px",
boxShadow: "0 12px 26px rgba(0,0,0,0.18)",
border: "1px solid rgba(31,53,82,0.10)",
marginBottom: "18px",
};

const cardItem = {
background: "white",
border: "1px solid #e5e7eb",
borderRadius: "16px",
padding: "18px",
boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
};

const inputStyle = {
width: "100%",
padding: "13px 14px",
borderRadius: "12px",
border: "1px solid #d1d5db",
boxSizing: "border-box",
fontSize: "14px",
backgroundColor: "white",
color: "#111827",
};

const labelStyle = {
display: "block",
marginBottom: "6px",
fontWeight: "700",
color: "#1f3552",
fontSize: "14px",
};

const botonPrincipal = {
background: "linear-gradient(135deg, #f97316, #ea580c)",
color: "white",
border: "none",
padding: "12px 18px",
borderRadius: "12px",
cursor: "pointer",
fontWeight: "700",
fontSize: "14px",
boxShadow: "0 8px 16px rgba(249,115,22,0.20)",
};

const botonSecundario = {
background: "linear-gradient(135deg, #1f3552, #2563eb)",
color: "white",
border: "none",
padding: "10px 14px",
borderRadius: "10px",
cursor: "pointer",
fontWeight: "700",
fontSize: "14px",
boxShadow: "0 8px 16px rgba(37,99,235,0.18)",
};

const botonVolver = {
marginBottom: "16px",
backgroundColor: "#e5e7eb",
border: "none",
padding: "8px 12px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "700",
};

if (!usuario) {
return (
<div style={cardSecundaria}>
<h2>Requerimientos</h2>
<p>Debes iniciar sesión como comprador para crear y ver tus requerimientos.</p>
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
fontWeight: "700",
}}
>
Ir a acceso comprador
</Link>
</div>
);
}

return (
<div style={paginaStyle}>
<button
onClick={() => navigate("/panel-comprador")}
style={botonVolver}
>
← Volver
</button>

<div style={cardPrincipal}>
<div
style={{
position: "absolute",
top: "-30px",
right: "-20px",
width: "150px",
height: "150px",
background:
"radial-gradient(circle, rgba(249,115,22,0.16) 0%, rgba(249,115,22,0) 72%)",
pointerEvents: "none",
}}
/>

<p
style={{
margin: 0,
color: "#f97316",
fontWeight: "800",
textTransform: "uppercase",
letterSpacing: "0.08em",
fontSize: "12px",
position: "relative",
zIndex: 1,
}}
>
Requerimientos
</p>

<h1
style={{
margin: "10px 0 8px 0",
fontSize: isMobile ? "24px" : "30px",
color: "#1f3552",
fontWeight: "700",
lineHeight: 1.25,
position: "relative",
zIndex: 1,
}}
>
Crea requerimientos con contexto y encuentra proveedores con mejor enfoque.
</h1>

<p
style={{
marginTop: 0,
marginBottom: 0,
color: "#5b6472",
lineHeight: 1.65,
fontSize: isMobile ? "14px" : "16px",
maxWidth: "840px",
position: "relative",
zIndex: 1,
}}
>
Desde aquí puedes estructurar tu necesidad de compra, adjuntar archivos,
abrir búsqueda por sector y luego solicitar cotizaciones o conversar con proveedores.
</p>
</div>

<div style={cardSecundaria}>
<h2
style={{
marginTop: 0,
marginBottom: "10px",
color: "#1f3552",
fontSize: isMobile ? "22px" : "26px",
fontWeight: "700",
}}
>
Nuevo requerimiento
</h2>

<p
style={{
marginTop: 0,
color: "#5b6472",
lineHeight: 1.6,
fontSize: "14px",
}}
>
Comprador activo: <strong>{usuario.email}</strong>
</p>

<div style={{ marginBottom: "12px" }}>
<label style={labelStyle}>Nombre del requerimiento *</label>
<input
type="text"
placeholder="Ej. Servicio de mantenimiento electromecánico"
value={nombreRequerimiento}
onChange={(e) => setNombreRequerimiento(e.target.value)}
style={inputStyle}
/>
</div>

<div
style={{
display: "grid",
gridTemplateColumns: isMobile
? "1fr"
: "repeat(auto-fit, minmax(220px, 1fr))",
gap: "12px",
marginBottom: "12px",
}}
>
<div>
<label style={labelStyle}>Cobertura *</label>
<select
value={cobertura}
onChange={(e) => {
setCobertura(e.target.value);
setPais("");
setProvincia("");
setCiudad("");
}}
style={inputStyle}
>
<option value="">Selecciona</option>
<option value="Nacional">Nacional</option>
<option value="Internacional">Internacional</option>
</select>
</div>

<div>
<label style={labelStyle}>País *</label>
<select
value={pais}
onChange={(e) => {
setPais(e.target.value);
if (e.target.value !== "Ecuador") {
setProvincia("");
setCiudad("");
}
}}
style={inputStyle}
>
<option value="">Selecciona</option>
{paises.map((item) => (
<option key={item} value={item}>
{item}
</option>
))}
</select>
</div>

<div>
<label style={labelStyle}>Provincia</label>
<select
value={provincia}
onChange={(e) => {
setProvincia(e.target.value);
setCiudad("");
}}
disabled={pais !== "Ecuador"}
style={{
...inputStyle,
backgroundColor: pais === "Ecuador" ? "white" : "#f3f4f6",
}}
>
<option value="">Selecciona</option>
{provinciasEcuador.map((item) => (
<option key={item} value={item}>
{item}
</option>
))}
</select>
</div>

<div>
<label style={labelStyle}>Ciudad</label>
<select
value={ciudad}
onChange={(e) => setCiudad(e.target.value)}
disabled={!provincia}
style={{
...inputStyle,
backgroundColor: provincia ? "white" : "#f3f4f6",
}}
>
<option value="">Selecciona</option>
{ciudadesDisponibles.map((item) => (
<option key={item} value={item}>
{item}
</option>
))}
</select>
</div>

<div>
<label style={labelStyle}>Sector *</label>
<select
value={sector}
onChange={(e) => {
setSector(e.target.value);
setCategoria("");
}}
style={inputStyle}
>
<option value="">Selecciona</option>
{Object.keys(sectores).map((item) => (
<option key={item} value={item}>
{item}
</option>
))}
</select>
</div>

<div>
<label style={labelStyle}>Categoría</label>
<select
value={categoria}
onChange={(e) => setCategoria(e.target.value)}
disabled={!sector}
style={{
...inputStyle,
backgroundColor: sector ? "white" : "#f3f4f6",
}}
>
<option value="">Categoría opcional</option>
{categoriasDisponibles.map((item) => (
<option key={item} value={item}>
{item}
</option>
))}
</select>
</div>
</div>

<div style={{ marginBottom: "12px" }}>
<label style={labelStyle}>Descripción</label>
<textarea
placeholder="Describe tu necesidad, alcance o detalle técnico"
value={descripcion}
onChange={(e) => setDescripcion(e.target.value)}
style={{
...inputStyle,
minHeight: "110px",
resize: "vertical",
}}
/>
</div>

<div style={{ marginBottom: "16px" }}>
<label style={labelStyle}>Archivo adjunto (opcional)</label>
<input
type="file"
onChange={(e) => setArchivo(e.target.files?.[0] || null)}
style={inputStyle}
/>
</div>

<button
onClick={crearRequerimiento}
disabled={guardando}
style={botonPrincipal}
>
{guardando ? "Guardando..." : "Crear requerimiento"}
</button>
</div>

<div style={cardSecundaria}>
<h3
style={{
marginTop: 0,
marginBottom: "12px",
color: "#1f3552",
fontSize: isMobile ? "22px" : "24px",
fontWeight: "700",
}}
>
Mis requerimientos
</h3>

<input
type="text"
placeholder="Buscar por nombre, sector, categoría o estado"
value={busqueda}
onChange={(e) => setBusqueda(e.target.value)}
style={{
...inputStyle,
marginBottom: "16px",
}}
/>

{cargando ? (
<p>Cargando...</p>
) : requerimientosFiltrados.length > 0 ? (
<div
style={{
display: "grid",
gridTemplateColumns: isMobile
? "1fr"
: "repeat(auto-fit, minmax(320px, 1fr))",
gap: "14px",
}}
>
{requerimientosFiltrados.map((r) => (
<div key={r.id} style={cardItem}>
<p
style={{
margin: 0,
fontWeight: "700",
fontSize: "18px",
color: "#1f3552",
}}
>
{r.nombre_requerimiento}
</p>

<p style={{ margin: "10px 0 6px 0", color: "#5b6472" }}>
<strong>Sector:</strong> {r.sector || "No definido"} |{" "}
<strong>Categoría:</strong> {r.categoria || "No definida"}
</p>

<p style={{ margin: "6px 0", color: "#5b6472" }}>
<strong>Estado:</strong> {r.estado || "Abierto"}
</p>

<p style={{ margin: "6px 0", color: "#5b6472" }}>
<strong>Cobertura:</strong> {r.cobertura || "No definida"} |{" "}
<strong>Ubicación:</strong>{" "}
{[r.pais, r.provincia, r.ciudad].filter(Boolean).join(" | ") ||
"No definida"}
</p>

{r.descripcion ? (
<p style={{ margin: "10px 0", color: "#5b6472", lineHeight: 1.6 }}>
<strong>Descripción:</strong> {r.descripcion}
</p>
) : null}

{r.archivo_nombre ? (
<p style={{ color: "#5b6472" }}>
<strong>Archivo:</strong>{" "}
{r.archivo_url ? (
<a href={r.archivo_url} target="_blank" rel="noreferrer">
{r.archivo_nombre}
</a>
) : (
r.archivo_nombre
)}
</p>
) : null}

<div
style={{
marginTop: "14px",
display: "flex",
flexWrap: "wrap",
gap: "10px",
}}
>
<button
onClick={() => abrirProveedoresParaRequerimiento(r)}
style={botonSecundario}
>
Ver proveedores
</button>

<button
onClick={() => verCotizacionesDeRequerimiento(r)}
style={botonPrincipal}
>
Ver cotizaciones
</button>
</div>
</div>
))}
</div>
) : (
<p>No tienes requerimientos todavía.</p>
)}
</div>
</div>
);
}

export default Requerimientos;
