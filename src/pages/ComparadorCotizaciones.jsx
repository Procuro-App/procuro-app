import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

function ComparadorCotizaciones() {
const [requerimientos, setRequerimientos] = useState([]);
const [cotizaciones, setCotizaciones] = useState([]);
const [requerimientoSeleccionado, setRequerimientoSeleccionado] = useState("");
const [cargando, setCargando] = useState(true);

useEffect(() => {
cargarDatos();
}, []);

const cargarDatos = async () => {
try {
setCargando(true);

const { data: requerimientosData, error: requerimientosError } = await supabase
.from("requerimientos")
.select("*")
.order("created_at", { ascending: false });

const { data: cotizacionesData, error: cotizacionesError } = await supabase
.from("cotizaciones")
.select("*")
.order("created_at", { ascending: false });

if (requerimientosError) {
console.error("Error cargando requerimientos:", requerimientosError);
}

if (cotizacionesError) {
console.error("Error cargando cotizaciones:", cotizacionesError);
}

setRequerimientos(requerimientosData || []);
setCotizaciones(cotizacionesData || []);
} catch (error) {
console.error("Error general cargando comparador:", error);
} finally {
setCargando(false);
}
};

const cotizacionesFiltradas = useMemo(() => {
if (!requerimientoSeleccionado) return [];

return cotizaciones.filter(
(c) => c.requerimiento_nombre === requerimientoSeleccionado
);
}, [cotizaciones, requerimientoSeleccionado]);

const cardStyle = {
backgroundColor: "white",
borderRadius: "16px",
padding: "20px",
boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
};

if (cargando) {
return (
<div style={cardStyle}>
<p>Cargando comparador de cotizaciones...</p>
</div>
);
}

return (
<div>
<div style={{ ...cardStyle, marginBottom: "20px" }}>
<h2>Comparador de cotizaciones</h2>
<p>
Selecciona un requerimiento para revisar y comparar las cotizaciones recibidas.
</p>

<select
value={requerimientoSeleccionado}
onChange={(e) => setRequerimientoSeleccionado(e.target.value)}
style={{
width: "100%",
padding: "12px",
borderRadius: "10px",
border: "1px solid #ccc",
marginTop: "12px"
}}
>
<option value="">Selecciona un requerimiento</option>
{requerimientos.map((r) => (
<option key={r.id} value={r.nombre_requerimiento}>
{r.nombre_requerimiento}
</option>
))}
</select>
</div>

{!requerimientoSeleccionado ? (
<div style={cardStyle}>
<p>Selecciona un requerimiento para visualizar y comparar cotizaciones.</p>
</div>
) : (
<>
<div style={{ ...cardStyle, marginBottom: "20px" }}>
<p style={{ marginBottom: "0", color: "#555" }}>
Cotizaciones encontradas: <strong>{cotizacionesFiltradas.length}</strong>
</p>
</div>

{/* Vista móvil: tarjetas */}
<div className="comparador-mobile">
<div style={cardStyle}>
{cotizacionesFiltradas.length > 0 ? (
cotizacionesFiltradas.map((c) => (
<div
key={c.id}
style={{
border: "1px solid #dcdcdc",
borderRadius: "10px",
padding: "15px",
marginBottom: "12px"
}}
>
<h3 style={{ marginTop: 0 }}>
{c.proveedor_nombre || "Proveedor no especificado"}
</h3>

<p><strong>Requerimiento:</strong> {c.requerimiento_nombre}</p>
<p><strong>Estado:</strong> {c.estado}</p>
{c.contacto ? <p><strong>Contacto:</strong> {c.contacto}</p> : null}
{c.email ? <p><strong>Email:</strong> {c.email}</p> : null}
{c.telefono ? <p><strong>Teléfono:</strong> {c.telefono}</p> : null}
{c.valor_referencial ? (
<p><strong>Valor referencial:</strong> {c.valor_referencial}</p>
) : (
<p><strong>Valor referencial:</strong> No especificado</p>
)}
{c.mensaje ? <p><strong>Mensaje:</strong> {c.mensaje}</p> : null}

{c.archivo_url ? (
<p>
<strong>Archivo:</strong>{" "}
<a href={c.archivo_url} target="_blank" rel="noreferrer">
Ver archivo adjunto
</a>
</p>
) : (
<p><strong>Archivo:</strong> No adjunto</p>
)}
</div>
))
) : (
<p>No hay cotizaciones para este requerimiento.</p>
)}
</div>
</div>

{/* Vista escritorio: tabla */}
<div className="comparador-desktop">
<div style={cardStyle}>
{cotizacionesFiltradas.length > 0 ? (
<div style={{ overflowX: "auto" }}>
<table
style={{
width: "100%",
borderCollapse: "collapse",
minWidth: "900px"
}}
>
<thead>
<tr style={{ backgroundColor: "#f3f4f6" }}>
<th style={thStyle}>Proveedor</th>
<th style={thStyle}>Estado</th>
<th style={thStyle}>Valor referencial</th>
<th style={thStyle}>Contacto</th>
<th style={thStyle}>Email</th>
<th style={thStyle}>Teléfono</th>
<th style={thStyle}>Mensaje</th>
<th style={thStyle}>Archivo</th>
</tr>
</thead>
<tbody>
{cotizacionesFiltradas.map((c) => (
<tr key={c.id}>
<td style={tdStyle}>{c.proveedor_nombre || "No especificado"}</td>
<td style={tdStyle}>{c.estado || "No especificado"}</td>
<td style={tdStyle}>{c.valor_referencial || "No especificado"}</td>
<td style={tdStyle}>{c.contacto || "No especificado"}</td>
<td style={tdStyle}>{c.email || "No especificado"}</td>
<td style={tdStyle}>{c.telefono || "No especificado"}</td>
<td style={tdStyle}>{c.mensaje || "Sin mensaje"}</td>
<td style={tdStyle}>
{c.archivo_url ? (
<a href={c.archivo_url} target="_blank" rel="noreferrer">
Ver archivo
</a>
) : (
"No adjunto"
)}
</td>
</tr>
))}
</tbody>
</table>
</div>
) : (
<p>No hay cotizaciones para este requerimiento.</p>
)}
</div>
</div>

<style>
{`
.comparador-mobile {
display: block;
}

.comparador-desktop {
display: none;
}

@media (min-width: 900px) {
.comparador-mobile {
display: none;
}

.comparador-desktop {
display: block;
}
}
`}
</style>
</>
)}
</div>
);
}

const thStyle = {
textAlign: "left",
padding: "12px",
borderBottom: "1px solid #d1d5db",
fontSize: "14px"
};

const tdStyle = {
padding: "12px",
borderBottom: "1px solid #e5e7eb",
verticalAlign: "top",
fontSize: "14px"
};

export default ComparadorCotizaciones;