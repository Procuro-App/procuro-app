import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { sectores } from "../data/categorias";
import { paises } from "../data/paises";
import { provinciasEcuador } from "../data/provinciasEcuador";
import { ciudadesEcuador } from "../data/ciudadesEcuador";

function Proveedores() {
const navigate = useNavigate();

const [proveedores, setProveedores] = useState([]);
const [cargando, setCargando] = useState(true);

const [cobertura, setCobertura] = useState("");
const [pais, setPais] = useState("");
const [provincia, setProvincia] = useState("");
const [ciudad, setCiudad] = useState("");
const [sector, setSector] = useState("");
const [categoria, setCategoria] = useState("");

useEffect(() => {
cargarProveedores();
}, []);

const obtenerPrioridadPlan = (plan) => {
const planLimpio = String(plan || "Gratis").trim();

if (planLimpio === "Premium") return 1;
if (planLimpio === "Pro") return 2;
return 3;
};

const ordenarProveedores = (lista) => {
return [...lista].sort((a, b) => {
const prioridadA = obtenerPrioridadPlan(a.plan);
const prioridadB = obtenerPrioridadPlan(b.plan);

if (prioridadA !== prioridadB) {
return prioridadA - prioridadB;
}

const nombreA = String(a.nombre || "").toLowerCase();
const nombreB = String(b.nombre || "").toLowerCase();

return nombreA.localeCompare(nombreB);
});
};

const cargarProveedores = async () => {
try {
setCargando(true);

const { data, error } = await supabase
.from("proveedores")
.select("*")
.eq("estado", "Aprobado");

if (error) {
console.error("Error cargando proveedores:", error);
setCargando(false);
return;
}

setProveedores(ordenarProveedores(data || []));
} catch (err) {
console.error("Error general cargando proveedores:", err);
} finally {
setCargando(false);
}
};

const categoriasDisponibles = sector ? sectores[sector] || [] : [];
const ciudadesDisponibles = provincia ? ciudadesEcuador[provincia] || [] : [];

const proveedoresFiltrados = useMemo(() => {
const filtrados = proveedores.filter((p) => {
const cumpleCobertura = cobertura ? p.cobertura === cobertura : true;
const cumplePais = pais ? p.pais === pais : true;
const cumpleProvincia = provincia ? p.provincia === provincia : true;
const cumpleCiudad = ciudad ? p.ciudad === ciudad : true;
const cumpleSector = sector ? p.sector === sector : true;
const cumpleCategoria = categoria ? p.categoria === categoria : true;

return (
cumpleCobertura &&
cumplePais &&
cumpleProvincia &&
cumpleCiudad &&
cumpleSector &&
cumpleCategoria
);
});

return ordenarProveedores(filtrados);
}, [proveedores, cobertura, pais, provincia, ciudad, sector, categoria]);

const limpiarRuc = (valor) => {
if (!valor) return "No especificado";
return String(valor).trim();
};

const badgeBaseStyle = {
padding: "6px 10px",
borderRadius: "999px",
fontSize: "12px",
fontWeight: "bold",
marginRight: "6px",
marginBottom: "6px",
display: "inline-block"
};

const obtenerEstiloTarjeta = (plan) => {
const planLimpio = String(plan || "Gratis").trim();

if (planLimpio === "Premium") {
return {
backgroundColor: "#fffaf0",
border: "1px solid #f4d38a",
boxShadow: "0 8px 24px rgba(180,140,40,0.15)"
};
}

if (planLimpio === "Pro") {
return {
backgroundColor: "#f8fbff",
border: "1px solid #b9d6ff",
boxShadow: "0 8px 24px rgba(30,90,180,0.10)"
};
}

return {
backgroundColor: "white",
border: "1px solid #e5e7eb",
boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
};
};

const obtenerBadgePlan = (plan) => {
const planLimpio = String(plan || "Gratis").trim();

if (planLimpio === "Premium") {
return {
texto: "🟡 Premium",
estilo: {
...badgeBaseStyle,
backgroundColor: "#fff3cd",
color: "#856404"
}
};
}

if (planLimpio === "Pro") {
return {
texto: "🔵 Pro",
estilo: {
...badgeBaseStyle,
backgroundColor: "#dbeafe",
color: "#1d4ed8"
}
};
}

return {
texto: "⚪ Gratis",
estilo: {
...badgeBaseStyle,
backgroundColor: "#e5e7eb",
color: "#374151"
}
};
};

return (
<div>
<div
style={{
backgroundColor: "white",
borderRadius: "16px",
padding: "24px",
boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
marginBottom: "20px"
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

<h2>Proveedores</h2>

<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
gap: "12px",
marginTop: "16px"
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
style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
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
style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
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
style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
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
</div>

{cargando ? (
<div
style={{
backgroundColor: "white",
borderRadius: "16px",
padding: "24px",
boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
}}
>
<p>Cargando proveedores...</p>
</div>
) : proveedoresFiltrados.length > 0 ? (
<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
gap: "16px"
}}
>
{proveedoresFiltrados.map((proveedor) => {
const estiloTarjeta = obtenerEstiloTarjeta(proveedor.plan);
const badgePlan = obtenerBadgePlan(proveedor.plan);

return (
<div
key={proveedor.id}
style={{
...estiloTarjeta,
borderRadius: "16px",
padding: "20px"
}}
>
<h3 style={{ marginTop: 0 }}>{proveedor.nombre}</h3>

<div style={{ marginBottom: "12px" }}>
{proveedor.verificado && (
<span
style={{
...badgeBaseStyle,
backgroundColor: "#d1ecf1",
color: "#0c5460"
}}
>
✔ Verificado
</span>
)}

{proveedor.patrocinado && (
<span
style={{
...badgeBaseStyle,
backgroundColor: "#fee2e2",
color: "#991b1b"
}}
>
📌 Patrocinado
</span>
)}

<span style={badgePlan.estilo}>{badgePlan.texto}</span>
</div>

<p><strong>Tipo:</strong> {proveedor.tipo_persona || "No especificado"}</p>
<p><strong>RUC / RUT:</strong> {limpiarRuc(proveedor.ruc_rut)}</p>
<p><strong>Cobertura:</strong> {proveedor.cobertura || "No especificada"}</p>
<p><strong>País:</strong> {proveedor.pais || "No especificado"}</p>
{proveedor.provincia ? <p><strong>Provincia:</strong> {proveedor.provincia}</p> : null}
{proveedor.ciudad ? <p><strong>Ciudad:</strong> {proveedor.ciudad}</p> : null}
<p><strong>Sector:</strong> {proveedor.sector || "No especificado"}</p>
<p><strong>Categoría:</strong> {proveedor.categoria || "No especificada"}</p>
<p><strong>Contacto:</strong> {proveedor.contacto || "No especificado"}</p>
<p><strong>Cargo:</strong> {proveedor.cargo || "No especificado"}</p>

<Link
to={`/proveedor/${proveedor.id}`}
state={{ proveedor }}
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
Ver perfil
</Link>
</div>
);
})}
</div>
) : (
<div
style={{
backgroundColor: "white",
borderRadius: "16px",
padding: "24px",
boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
}}
>
<p>No se encontraron proveedores con esos filtros.</p>
</div>
)}
</div>
);
}

export default Proveedores;