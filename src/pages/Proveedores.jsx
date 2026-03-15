import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { proveedores as proveedoresBase } from "../data/proveedoresData";
import { sectores } from "../data/categorias";
import { paises } from "../data/paises";
import { provinciasEcuador } from "../data/provinciasEcuador";
import { ciudadesEcuador } from "../data/ciudadesEcuador";
import { supabase } from "../lib/supabase";

function Proveedores() {
const [cobertura, setCobertura] = useState("");
const [pais, setPais] = useState("");
const [provincia, setProvincia] = useState("");
const [ciudad, setCiudad] = useState("");
const [sector, setSector] = useState("");
const [categoria, setCategoria] = useState("");
const [proveedoresSupabase, setProveedoresSupabase] = useState([]);
const [cargando, setCargando] = useState(true);

useEffect(() => {
cargarProveedores();
}, []);

const cargarProveedores = async () => {
setCargando(true);

const { data, error } = await supabase
.from("proveedores")
.select("*")
.eq("estado", "Aprobado")
.order("created_at", { ascending: false });

if (error) {
console.error("Error cargando proveedores:", error);
setCargando(false);
return;
}

setProveedoresSupabase(data || []);
setCargando(false);
};

const todosLosProveedores = useMemo(() => {
return [...proveedoresBase, ...proveedoresSupabase];
}, [proveedoresSupabase]);

const categoriasDisponibles = sector ? sectores[sector] || [] : [];
const ciudadesDisponibles = provincia ? ciudadesEcuador[provincia] || [] : [];

const proveedoresFiltrados = todosLosProveedores
.filter((p) => {
const coincideCobertura = cobertura ? p.cobertura === cobertura : true;

const coincidePais = pais
? (p.pais || "").toLowerCase() === pais.toLowerCase()
: true;

const coincideProvincia = provincia
? (p.provincia || "").toLowerCase() === provincia.toLowerCase()
: true;

const coincideCiudad = ciudad
? (p.ciudad || "").toLowerCase() === ciudad.toLowerCase()
: true;

const coincideSector = sector
? (p.sector || "").toLowerCase() === sector.toLowerCase()
: true;

const coincideCategoria = categoria
? (p.categoria || "").toLowerCase() === categoria.toLowerCase()
: true;

return (
coincideCobertura &&
coincidePais &&
coincideProvincia &&
coincideCiudad &&
coincideSector &&
coincideCategoria
);
})
.sort((a, b) => {
const score = (p) => {
if (p.patrocinado) return 3;
if ((p.plan || "").toLowerCase() === "pro") return 2;
return 1;
};

return score(b) - score(a);
});

const renderDocumento = (label, url) => {
if (!url) return null;

return (
<p>
<strong>{label}:</strong>{" "}
<a href={url} target="_blank" rel="noreferrer">
Ver documento
</a>
</p>
);
};

const getCardStyle = (proveedor) => {
if (proveedor.patrocinado) {
return {
border: "2px solid #f0b429",
background: "linear-gradient(180deg, #fff7db 0%, #ffffff 100%)",
boxShadow: "0 8px 20px rgba(240,180,41,0.18)"
};
}

if ((proveedor.plan || "").toLowerCase() === "pro") {
return {
border: "2px solid #2f5b8a",
background: "linear-gradient(180deg, #f4f9ff 0%, #ffffff 100%)",
boxShadow: "0 6px 16px rgba(47,91,138,0.10)"
};
}

return {
border: "1px solid #dcdcdc",
background: "white",
boxShadow: "0 4px 10px rgba(0,0,0,0.04)"
};
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
<h2>Proveedores</h2>

<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
gap: "12px",
marginBottom: "20px"
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

{!cargando && (
<div
style={{
display: "flex",
gap: "10px",
flexWrap: "wrap",
marginBottom: "16px"
}}
>
<span
style={{
padding: "6px 10px",
borderRadius: "999px",
backgroundColor: "#fff3cd",
color: "#856404",
fontSize: "12px",
fontWeight: "bold"
}}
>
Premium / Patrocinado
</span>

<span
style={{
padding: "6px 10px",
borderRadius: "999px",
backgroundColor: "#dbeafe",
color: "#1d4ed8",
fontSize: "12px",
fontWeight: "bold"
}}
>
Pro
</span>

<span
style={{
padding: "6px 10px",
borderRadius: "999px",
backgroundColor: "#e5e7eb",
color: "#374151",
fontSize: "12px",
fontWeight: "bold"
}}
>
Gratis
</span>
</div>
)}

{cargando ? (
<p>Cargando proveedores...</p>
) : (
<p style={{ marginBottom: "20px", color: "#555" }}>
Resultados encontrados: <strong>{proveedoresFiltrados.length}</strong>
</p>
)}

{!cargando && proveedoresFiltrados.length > 0 ? (
proveedoresFiltrados.map((p, index) => (
<div
key={p.id || `${p.nombre}-${index}`}
style={{
...getCardStyle(p),
borderRadius: "12px",
padding: "16px",
marginBottom: "14px"
}}
>
{p.patrocinado && (
<div
style={{
marginBottom: "10px",
display: "inline-block",
backgroundColor: "#f0b429",
color: "#4a3411",
padding: "6px 10px",
borderRadius: "999px",
fontSize: "12px",
fontWeight: "bold"
}}
>
⭐ PATROCINADO
</div>
)}

<h4 style={{ margin: "0 0 8px 0" }}>
<Link
to={`/proveedor/${p.id || index}`}
state={{ proveedor: p }}
style={{ textDecoration: "none", color: "#1f3552" }}
>
{p.nombre}
</Link>
</h4>

<div
style={{
display: "flex",
gap: "8px",
marginBottom: "10px",
flexWrap: "wrap"
}}
>
{!p.patrocinado && (p.plan || "").toLowerCase() === "pro" && (
<span
style={{
backgroundColor: "#dbeafe",
color: "#1d4ed8",
padding: "4px 8px",
borderRadius: "999px",
fontSize: "12px",
fontWeight: "bold"
}}
>
Plan Pro
</span>
)}

{!p.patrocinado && (p.plan || "").toLowerCase() !== "pro" && (
<span
style={{
backgroundColor: "#e5e7eb",
color: "#374151",
padding: "4px 8px",
borderRadius: "999px",
fontSize: "12px",
fontWeight: "bold"
}}
>
Plan Gratis
</span>
)}

{p.verificado && (
<span
style={{
backgroundColor: "#d1ecf1",
color: "#0c5460",
padding: "4px 8px",
borderRadius: "999px",
fontSize: "12px",
fontWeight: "bold"
}}
>
Verificado
</span>
)}
</div>

<p><strong>Tipo de proveedor:</strong> {p.tipo_persona || "No especificado"}</p>
<p><strong>Cobertura:</strong> {p.cobertura}</p>
<p><strong>País:</strong> {p.pais}</p>
{p.provincia ? <p><strong>Provincia:</strong> {p.provincia}</p> : null}
{p.ciudad ? <p><strong>Ciudad:</strong> {p.ciudad}</p> : null}
<p><strong>Sector:</strong> {p.sector}</p>
<p><strong>Categoría:</strong> {p.categoria}</p>
<p><strong>Contacto:</strong> {p.contacto}</p>
<p><strong>Cargo:</strong> {p.cargo}</p>
<p><strong>Correo electrónico:</strong> {p.email}</p>
<p><strong>Teléfono principal:</strong> {p.telefono}</p>
{p.telefono_secundario ? (
<p><strong>Teléfono secundario:</strong> {p.telefono_secundario}</p>
) : null}
<p><strong>Descripción:</strong> {p.descripcion}</p>

{(p.brochure_url || p.presentacion_url || p.certificaciones_url || p.catalogo_url || p.brochure || p.presentacion || p.certificaciones || p.catalogo) && (
<div style={{ marginTop: "12px" }}>
<p style={{ fontWeight: "bold", marginBottom: "8px" }}>
Documentos disponibles
</p>
{renderDocumento("Brochure", p.brochure_url || p.brochure)}
{renderDocumento("Presentación", p.presentacion_url || p.presentacion)}
{renderDocumento("Certificaciones", p.certificaciones_url || p.certificaciones)}
{renderDocumento("Catálogo", p.catalogo_url || p.catalogo)}
</div>
)}

<div
style={{
display: "flex",
gap: "10px",
flexWrap: "wrap",
marginTop: "14px"
}}
>
<Link
to={`/proveedor/${p.id || index}`}
state={{ proveedor: p }}
style={{
display: "inline-block",
backgroundColor: "#e5e7eb",
color: "#111827",
textDecoration: "none",
padding: "10px 14px",
borderRadius: "8px",
fontWeight: "bold"
}}
>
Ver perfil
</Link>

<Link
to="/solicitar-proveedor"
state={{ proveedor: p }}
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
Solicitar cotización directa
</Link>
</div>
</div>
))
) : !cargando ? (
<p>No se encontraron proveedores con esos filtros.</p>
) : null}
</div>
);
}

export default Proveedores;