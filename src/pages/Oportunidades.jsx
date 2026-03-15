import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { proveedores as proveedoresBase } from "../data/proveedoresData";

function Oportunidades() {
const [requerimientos, setRequerimientos] = useState([]);
const [proveedoresSupabase, setProveedoresSupabase] = useState([]);
const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");
const [cargando, setCargando] = useState(true);

useEffect(() => {
cargarOportunidades();
}, []);

const cargarOportunidades = async () => {
try {
setCargando(true);

const { data: requerimientosData, error: requerimientosError } = await supabase
.from("requerimientos")
.select("*")
.eq("estado", "Abierto")
.order("created_at", { ascending: false });

const { data: proveedoresData, error: proveedoresError } = await supabase
.from("proveedores")
.select("*")
.eq("estado", "Aprobado")
.order("created_at", { ascending: false });

if (requerimientosError) {
console.error("Error cargando oportunidades:", requerimientosError);
}

if (proveedoresError) {
console.error("Error cargando proveedores:", proveedoresError);
}

setRequerimientos(requerimientosData || []);
setProveedoresSupabase(proveedoresData || []);
} catch (error) {
console.error("Error general cargando oportunidades:", error);
} finally {
setCargando(false);
}
};

const todosLosProveedores = useMemo(() => {
return [...proveedoresBase, ...proveedoresSupabase];
}, [proveedoresSupabase]);

const proveedorActual = useMemo(() => {
if (!proveedorSeleccionado) return null;

return (
todosLosProveedores.find(
(p) => (p.nombre || "").toLowerCase() === proveedorSeleccionado.toLowerCase()
) || null
);
}, [proveedorSeleccionado, todosLosProveedores]);

const oportunidadesFiltradas = useMemo(() => {
if (!proveedorActual) return requerimientos;

return requerimientos.filter((r) => {
const mismaCategoria =
(r.categoria || "").toLowerCase() ===
(proveedorActual.categoria || "").toLowerCase();

const mismoSector =
(r.sector || "").toLowerCase() ===
(proveedorActual.sector || "").toLowerCase();

return mismaCategoria || mismoSector;
});
}, [requerimientos, proveedorActual]);

const cardStyle = {
backgroundColor: "white",
borderRadius: "16px",
padding: "20px",
boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
};

return (
<div>
<div style={{ ...cardStyle, marginBottom: "20px" }}>
<h2>Muro de oportunidades</h2>
<p>
Aquí se muestran los requerimientos abiertos publicados por compradores en PROCURO.
</p>
<p>
Puedes ver todas las oportunidades o filtrar según un proveedor para visualizar las más relacionadas con su sector o categoría.
</p>

<select
value={proveedorSeleccionado}
onChange={(e) => setProveedorSeleccionado(e.target.value)}
style={{
width: "100%",
padding: "12px",
borderRadius: "10px",
border: "1px solid #ccc",
marginTop: "12px"
}}
>
<option value="">Ver todas las oportunidades</option>
{todosLosProveedores.map((p, index) => (
<option key={p.id || `${p.nombre}-${index}`} value={p.nombre}>
{p.nombre}
</option>
))}
</select>
</div>

{cargando ? (
<div style={cardStyle}>
<p>Cargando oportunidades...</p>
</div>
) : (
<div style={{ ...cardStyle }}>
<p style={{ marginBottom: "20px", color: "#555" }}>
Oportunidades encontradas: <strong>{oportunidadesFiltradas.length}</strong>
</p>

{oportunidadesFiltradas.length > 0 ? (
oportunidadesFiltradas.map((r) => (
<div
key={r.id}
style={{
border: "1px solid #dcdcdc",
borderRadius: "10px",
padding: "15px",
marginBottom: "12px"
}}
>
<div
style={{
display: "flex",
justifyContent: "space-between",
gap: "10px",
alignItems: "flex-start",
flexWrap: "wrap"
}}
>
<h3 style={{ margin: 0 }}>{r.nombre_requerimiento}</h3>

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
{r.estado}
</span>
</div>

{r.cobertura ? <p><strong>Cobertura:</strong> {r.cobertura}</p> : null}
{r.pais ? <p><strong>País:</strong> {r.pais}</p> : null}
{r.provincia ? <p><strong>Provincia:</strong> {r.provincia}</p> : null}
{r.ciudad ? <p><strong>Ciudad:</strong> {r.ciudad}</p> : null}
<p><strong>Sector:</strong> {r.sector}</p>
<p><strong>Categoría:</strong> {r.categoria}</p>
{r.descripcion ? <p><strong>Descripción:</strong> {r.descripcion}</p> : null}

<div
style={{
display: "flex",
gap: "10px",
flexWrap: "wrap",
marginTop: "12px"
}}
>
<Link
to={`/enviar-cotizacion/${r.id}`}
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
Cotizar oportunidad
</Link>

<Link
to="/proveedores"
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
Buscar proveedores
</Link>
</div>
</div>
))
) : (
<p>No hay oportunidades disponibles para este criterio.</p>
)}
</div>
)}
</div>
);
}

export default Oportunidades;