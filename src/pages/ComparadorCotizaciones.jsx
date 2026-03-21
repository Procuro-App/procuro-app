import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function ComparadorCotizaciones() {
const navigate = useNavigate();

const [usuario, setUsuario] = useState(null);
const [requerimientos, setRequerimientos] = useState([]);
const [cotizaciones, setCotizaciones] = useState([]);
const [requerimientoSeleccionado, setRequerimientoSeleccionado] = useState("");
const [cargando, setCargando] = useState(true);

useEffect(() => {
cargarDatosComprador();
}, []);

const cargarDatosComprador = async () => {
try {
setCargando(true);

const { data: userData, error: userError } = await supabase.auth.getUser();

if (userError) {
console.error("Error obteniendo comprador autenticado:", userError);
setCargando(false);
return;
}

const user = userData?.user || null;
setUsuario(user);

if (!user?.id) {
setCargando(false);
return;
}

const { data: requerimientosData, error: requerimientosError } = await supabase
.from("requerimientos")
.select("*")
.eq("comprador_user_id", user.id)
.order("created_at", { ascending: false });

if (requerimientosError) {
console.error("Error cargando requerimientos:", requerimientosError);
setCargando(false);
return;
}

const nombresRequerimientos = (requerimientosData || [])
.map((r) => r.nombre_requerimiento)
.filter(Boolean);

let cotizacionesData = [];

if (nombresRequerimientos.length > 0) {
const { data, error } = await supabase
.from("cotizaciones")
.select("*")
.in("requerimiento_nombre", nombresRequerimientos)
.order("created_at", { ascending: false });

if (error) {
console.error("Error cargando cotizaciones:", error);
} else {
cotizacionesData = data || [];
}
}

setRequerimientos(requerimientosData || []);
setCotizaciones(cotizacionesData);
} catch (error) {
console.error("Error general cargando comparativo:", error);
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

const convertirANumero = (valor) => {
if (valor === null || valor === undefined || valor === "") return null;

const limpio = String(valor)
.replace(/[^\d.,]/g, "")
.replace(/,/g, "");

const numero = Number(limpio);

return Number.isNaN(numero) ? null : numero;
};

const cotizacionesConAnalisis = useMemo(() => {
const conValor = cotizacionesFiltradas.map((c) => ({
...c,
valorNumerico: convertirANumero(c.valor_referencial)
}));

const valoresValidos = conValor
.map((c) => c.valorNumerico)
.filter((v) => v !== null)
.sort((a, b) => a - b);

if (valoresValidos.length === 0) return conValor;

const minimo = valoresValidos[0];
const maximo = valoresValidos[valoresValidos.length - 1];

return conValor.map((c) => {
if (c.valorNumerico === null) {
return { ...c, nivelPrecio: "sin-dato" };
}

if (c.valorNumerico === minimo) {
return { ...c, nivelPrecio: "mejor" };
}

if (c.valorNumerico === maximo && maximo !== minimo) {
return { ...c, nivelPrecio: "alto" };
}

return { ...c, nivelPrecio: "medio" };
});
}, [cotizacionesFiltradas]);

const obtenerEstiloNivel = (nivel) => {
if (nivel === "mejor") {
return {
backgroundColor: "#d1fae5",
color: "#065f46",
texto: "🟢 Mejor precio"
};
}

if (nivel === "medio") {
return {
backgroundColor: "#fef3c7",
color: "#92400e",
texto: "🟡 Precio intermedio"
};
}

if (nivel === "alto") {
return {
backgroundColor: "#fee2e2",
color: "#991b1b",
texto: "🔴 Precio más alto"
};
}

return {
backgroundColor: "#e5e7eb",
color: "#374151",
texto: "Sin dato comparable"
};
};

const cardStyle = {
backgroundColor: "white",
borderRadius: "16px",
padding: "20px",
boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
};

if (cargando) {
return (
<div style={cardStyle}>
<p>Cargando comparativo de cotizaciones...</p>
</div>
);
}

if (!usuario) {
return (
<div style={cardStyle}>
<h2>Comparativo de cotizaciones</h2>
<p>Debes iniciar sesión como comprador para ver tu comparativo.</p>

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
fontWeight: "bold"
}}
>
Ir a acceso comprador
</Link>
</div>
);
}

return (
<div>
<div style={{ ...cardStyle, marginBottom: "20px" }}>
<button
onClick={() => navigate("/panel-comprador")}
style={{
marginBottom: "12px",
backgroundColor: "#e5e7eb",
border: "none",
padding: "8px 12px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold"
}}
>
← Volver al dashboard
</button>

<h2>Comparativo de cotizaciones</h2>
<p>
Selecciona uno de tus requerimientos para comparar las cotizaciones recibidas.
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
<p>Selecciona un requerimiento para visualizar el comparativo.</p>
</div>
) : (
<>
<div style={{ ...cardStyle, marginBottom: "20px" }}>
<p style={{ marginBottom: 0, color: "#555" }}>
Cotizaciones encontradas:{" "}
<strong>{cotizacionesConAnalisis.length}</strong>
</p>
</div>

<div className="comparador-mobile">
<div style={cardStyle}>
{cotizacionesConAnalisis.length > 0 ? (
cotizacionesConAnalisis.map((c) => {
const nivel = obtenerEstiloNivel(c.nivelPrecio);

return (
<div
key={c.id}
style={{
border: "1px solid #dcdcdc",
borderRadius: "10px",
padding: "15px",
marginBottom: "12px"
}}
>
<div
style={{
display: "inline-block",
marginBottom: "10px",
backgroundColor: nivel.backgroundColor,
color: nivel.color,
padding: "6px 10px",
borderRadius: "999px",
fontSize: "12px",
fontWeight: "bold"
}}
>
{nivel.texto}
</div>

<h3 style={{ marginTop: 0 }}>
{c.proveedor_nombre || "Proveedor no especificado"}
</h3>

<p><strong>Requerimiento:</strong> {c.requerimiento_nombre}</p>
<p><strong>Estado:</strong> {c.estado || "No especificado"}</p>
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
);
})
) : (
<p>No hay cotizaciones para este requerimiento.</p>
)}
</div>
</div>

<div className="comparador-desktop">
<div style={cardStyle}>
{cotizacionesConAnalisis.length > 0 ? (
<div style={{ overflowX: "auto" }}>
<table
style={{
width: "100%",
borderCollapse: "collapse",
minWidth: "980px"
}}
>
<thead>
<tr style={{ backgroundColor: "#f3f4f6" }}>
<th style={thStyle}>Proveedor</th>
<th style={thStyle}>Semáforo</th>
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
{cotizacionesConAnalisis.map((c) => {
const nivel = obtenerEstiloNivel(c.nivelPrecio);

return (
<tr key={c.id}>
<td style={tdStyle}>{c.proveedor_nombre || "No especificado"}</td>
<td style={tdStyle}>
<span
style={{
backgroundColor: nivel.backgroundColor,
color: nivel.color,
padding: "6px 10px",
borderRadius: "999px",
fontSize: "12px",
fontWeight: "bold",
display: "inline-block"
}}
>
{nivel.texto}
</span>
</td>
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
);
})}
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