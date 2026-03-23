import { useEffect, useState } from "react";
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

if (!nombreRequerimiento || !cobertura || !pais || !sector || !categoria) {
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
categoria,
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
const categoriaReq = encodeURIComponent(req.categoria || "");
const sectorReq = encodeURIComponent(req.sector || "");

navigate(
`/proveedores?requerimiento_id=${req.id}&requerimiento_nombre=${titulo}&categoria=${categoriaReq}&sector=${sectorReq}`
);
};

const verCotizacionesDeRequerimiento = (req) => {
navigate(`/cotizaciones?requerimiento_id=${req.id}`);
};

if (!usuario) {
return (
<div
style={{
backgroundColor: "white",
borderRadius: "16px",
padding: "24px",
boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
}}
>
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
fontWeight: "bold",
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
boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
}}
>
<button
onClick={() => navigate("/panel-comprador")}
style={{
marginBottom: "10px",
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

<h2>Requerimientos</h2>
<p>
<strong>Comprador activo:</strong> {usuario.email}
</p>

<input
type="text"
placeholder="Nombre del requerimiento"
value={nombreRequerimiento}
onChange={(e) => setNombreRequerimiento(e.target.value)}
style={{
width: "100%",
padding: "12px",
marginBottom: "12px",
borderRadius: "10px",
border: "1px solid #ccc",
}}
/>

<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
gap: "12px",
marginBottom: "12px",
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
border: "1px solid #ccc",
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
border: "1px solid #ccc",
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
backgroundColor: pais === "Ecuador" ? "white" : "#f3f3f3",
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
backgroundColor: provincia ? "white" : "#f3f3f3",
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
border: "1px solid #ccc",
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
backgroundColor: sector ? "white" : "#f3f3f3",
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
border: "1px solid #ccc",
}}
/>

<div style={{ marginBottom: "16px" }}>
<label
style={{
display: "block",
marginBottom: "6px",
fontWeight: "bold",
}}
>
Archivo adjunto (opcional)
</label>
<input
type="file"
onChange={(e) => setArchivo(e.target.files?.[0] || null)}
style={{
width: "100%",
padding: "12px",
borderRadius: "10px",
border: "1px solid #ccc",
}}
/>
</div>

<button
onClick={crearRequerimiento}
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
{guardando ? "Guardando..." : "Crear requerimiento"}
</button>

<div style={{ marginTop: "24px" }}>
<h3>Mis requerimientos</h3>

{cargando ? (
<p>Cargando...</p>
) : requerimientos.length > 0 ? (
requerimientos.map((r) => (
<div
key={r.id}
style={{
border: "1px solid #dcdcdc",
borderRadius: "10px",
padding: "15px",
marginBottom: "12px",
backgroundColor: "#fff",
}}
>
<p style={{ margin: 0, fontWeight: "bold", fontSize: "18px" }}>
{r.nombre_requerimiento}
</p>

<p style={{ margin: "8px 0 4px 0" }}>
<strong>Sector:</strong> {r.sector || "No definido"} |{" "}
<strong>Categoría:</strong> {r.categoria || "No definida"}
</p>

<p style={{ margin: "4px 0" }}>
<strong>Estado:</strong> {r.estado || "Abierto"}
</p>

<p style={{ margin: "4px 0" }}>
<strong>Cobertura:</strong> {r.cobertura || "No definida"} |{" "}
<strong>País:</strong> {r.pais || "No definido"}
{r.provincia ? ` | ${r.provincia}` : ""}
{r.ciudad ? ` | ${r.ciudad}` : ""}
</p>

{r.descripcion ? (
<p style={{ margin: "8px 0" }}>
<strong>Descripción:</strong> {r.descripcion}
</p>
) : null}

{r.archivo_nombre ? (
<p>
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
marginTop: "12px",
display: "flex",
flexWrap: "wrap",
gap: "10px",
}}
>
<button
onClick={() => abrirProveedoresParaRequerimiento(r)}
style={{
backgroundColor: "#2563eb",
color: "white",
border: "none",
padding: "10px 14px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold",
}}
>
Ver proveedores para este requerimiento
</button>

<button
onClick={() => verCotizacionesDeRequerimiento(r)}
style={{
backgroundColor: "#10b981",
color: "white",
border: "none",
padding: "10px 14px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold",
}}
>
Ver cotizaciones
</button>
</div>
</div>
))
) : (
<p>No tienes requerimientos todavía.</p>
)}
</div>
</div>
);
}

export default Requerimientos;