import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Proveedores() {
const navigate = useNavigate();
const location = useLocation();
const [searchParams] = useSearchParams();

const [proveedores, setProveedores] = useState([]);
const [cargando, setCargando] = useState(true);
const [busqueda, setBusqueda] = useState("");

const requerimientoId = searchParams.get("requerimiento_id") || "";
const requerimientoNombre = searchParams.get("requerimiento_nombre") || "";
const sectorDesdeRequerimiento = searchParams.get("sector") || "";
const categoriaDesdeRequerimiento = searchParams.get("categoria") || "";

useEffect(() => {
cargarProveedores();
}, []);

const cargarProveedores = async () => {
try {
setCargando(true);

const { data, error } = await supabase
.from("proveedores")
.select("*")
.order("created_at", { ascending: false });

if (error) {
console.error("Error cargando proveedores:", error);
setProveedores([]);
return;
}

setProveedores(data || []);
} catch (error) {
console.error("Error general cargando proveedores:", error);
setProveedores([]);
} finally {
setCargando(false);
}
};

const textoSeguro = (valor) => String(valor || "").trim().toLowerCase();

const obtenerTextoPlan = (plan) => {
const planTexto = textoSeguro(plan);

if (planTexto === "premium") {
return "Alta visibilidad y prioridad en resultados.";
}

if (planTexto === "pro") {
return "Mejor posicionamiento frente a proveedores gratuitos.";
}

return "Visibilidad básica dentro del directorio.";
};

const proveedoresFiltrados = useMemo(() => {
let lista = [...proveedores];

lista = lista.filter((p) => {
const estado = textoSeguro(p.estado);
const verificado = p.verificado;

if (!p.estado && verificado === undefined) return true;
if (estado && estado !== "aprobado") return false;
if (verificado === false) return false;

return true;
});

if (sectorDesdeRequerimiento) {
lista = lista.filter(
(p) => textoSeguro(p.sector) === textoSeguro(sectorDesdeRequerimiento)
);
}

if (categoriaDesdeRequerimiento) {
lista = lista.filter(
(p) =>
textoSeguro(p.categoria) === textoSeguro(categoriaDesdeRequerimiento)
);
}

if (busqueda.trim()) {
const q = textoSeguro(busqueda);

lista = lista.filter((p) => {
const campos = [
p.nombre,
p.descripcion,
p.sector,
p.categoria,
p.cobertura,
p.pais,
p.provincia,
p.ciudad,
p.contacto,
p.email,
p.telefono,
]
.map((x) => textoSeguro(x))
.join(" ");

return campos.includes(q);
});
}

const prioridadPlan = {
premium: 1,
pro: 2,
gratis: 3,
free: 3,
};

lista.sort((a, b) => {
const planA = prioridadPlan[textoSeguro(a.plan)] || 99;
const planB = prioridadPlan[textoSeguro(b.plan)] || 99;

if (planA !== planB) return planA - planB;

const fechaA = new Date(a.created_at || 0).getTime();
const fechaB = new Date(b.created_at || 0).getTime();

return fechaB - fechaA;
});

return lista;
}, [
proveedores,
busqueda,
sectorDesdeRequerimiento,
categoriaDesdeRequerimiento,
]);

const abrirChatConProveedor = (proveedor) => {
if (!requerimientoId || !requerimientoNombre) {
alert(
"Para iniciar un chat, primero debes entrar desde un requerimiento."
);
return;
}

const proveedorId = encodeURIComponent(proveedor.id || "");
const proveedorEmail = encodeURIComponent(proveedor.email || "");
const proveedorNombre = encodeURIComponent(
proveedor.nombre || proveedor.contacto || proveedor.email || "Proveedor"
);
const reqId = encodeURIComponent(requerimientoId);
const reqNombre = encodeURIComponent(requerimientoNombre);
const sector = encodeURIComponent(sectorDesdeRequerimiento || "");
const categoria = encodeURIComponent(categoriaDesdeRequerimiento || "");

navigate(
`/chat?proveedor_id=${proveedorId}&proveedor_email=${proveedorEmail}&proveedor_nombre=${proveedorNombre}&requerimiento_id=${reqId}&requerimiento_nombre=${reqNombre}&sector=${sector}&categoria=${categoria}`
);
};

const volverARequerimientos = () => {
navigate("/requerimientos");
};

const verPerfilProveedor = (proveedor) => {
const rutaActual = `${location.pathname}${location.search}`;

navigate(`/proveedor/${proveedor.id}`, {
state: {
proveedor,
volverA: rutaActual,
},
});
};

const badgePlan = (plan) => {
const planTexto = textoSeguro(plan);

let fondo = "#e5e7eb";
let color = "#374151";
let texto = plan || "Gratis";

if (planTexto === "premium") {
fondo = "#fef3c7";
color = "#92400e";
texto = "Premium";
} else if (planTexto === "pro") {
fondo = "#dbeafe";
color = "#1d4ed8";
texto = "Pro";
} else if (planTexto === "gratis" || planTexto === "free" || !planTexto) {
fondo = "#e5e7eb";
color = "#374151";
texto = "Gratis";
}

return (
<span
style={{
display: "inline-block",
padding: "6px 10px",
borderRadius: "999px",
backgroundColor: fondo,
color,
fontSize: "12px",
fontWeight: "bold",
}}
>
{texto}
</span>
);
};

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
onClick={() => navigate(-1)}
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

<h2 style={{ marginTop: 0 }}>Proveedores</h2>

{requerimientoId && requerimientoNombre ? (
<div
style={{
marginBottom: "18px",
padding: "16px",
borderRadius: "12px",
background: "#eff6ff",
borderLeft: "6px solid #2563eb",
borderRight: "6px solid #f59e0b",
}}
>
<p style={{ margin: 0, color: "#1f3552", fontWeight: "bold" }}>
Estás buscando proveedores para este requerimiento:
</p>

<p
style={{
margin: "8px 0 0 0",
fontSize: "18px",
fontWeight: "bold",
color: "#111827",
}}
>
{requerimientoNombre}
</p>

<div
style={{
marginTop: "10px",
display: "flex",
gap: "10px",
flexWrap: "wrap",
}}
>
{sectorDesdeRequerimiento ? (
<span
style={{
padding: "6px 10px",
borderRadius: "999px",
backgroundColor: "#dbeafe",
color: "#1d4ed8",
fontSize: "12px",
fontWeight: "bold",
}}
>
Sector: {sectorDesdeRequerimiento}
</span>
) : null}

{categoriaDesdeRequerimiento ? (
<span
style={{
padding: "6px 10px",
borderRadius: "999px",
backgroundColor: "#dcfce7",
color: "#166534",
fontSize: "12px",
fontWeight: "bold",
}}
>
Categoría: {categoriaDesdeRequerimiento}
</span>
) : null}
</div>

<button
onClick={volverARequerimientos}
style={{
marginTop: "12px",
backgroundColor: "#1f3552",
color: "white",
border: "none",
padding: "10px 14px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold",
}}
>
Volver a mis requerimientos
</button>
</div>
) : (
<div
style={{
marginBottom: "18px",
padding: "14px",
borderRadius: "12px",
backgroundColor: "#fff7ed",
borderLeft: "6px solid #f59e0b",
}}
>
<p style={{ margin: 0, color: "#92400e", fontWeight: "bold" }}>
Vista general de proveedores
</p>
<p style={{ margin: "6px 0 0 0", color: "#7c2d12" }}>
Puedes explorar proveedores, pero para iniciar una conversación con
contexto debes entrar desde un requerimiento.
</p>
</div>
)}

<input
type="text"
placeholder="Buscar por nombre, sector, categoría, ciudad o descripción"
value={busqueda}
onChange={(e) => setBusqueda(e.target.value)}
style={{
width: "100%",
padding: "12px",
marginBottom: "18px",
borderRadius: "10px",
border: "1px solid #ccc",
}}
/>

{cargando ? (
<p>Cargando proveedores...</p>
) : proveedoresFiltrados.length === 0 ? (
<div
style={{
border: "1px solid #e5e7eb",
borderRadius: "12px",
padding: "18px",
backgroundColor: "#fafafa",
}}
>
<p style={{ margin: 0, fontWeight: "bold" }}>
No encontramos proveedores para este criterio.
</p>
<p style={{ margin: "6px 0 0 0", color: "#6b7280" }}>
Puedes volver al requerimiento o cambiar el filtro de búsqueda.
</p>
</div>
) : (
<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
gap: "14px",
}}
>
{proveedoresFiltrados.map((p) => (
<div
key={p.id}
style={{
border: "1px solid #dcdcdc",
borderRadius: "14px",
padding: "16px",
backgroundColor: "white",
boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
}}
>
<div
style={{
display: "flex",
justifyContent: "space-between",
alignItems: "flex-start",
gap: "10px",
marginBottom: "10px",
}}
>
<div>
<h3
style={{
margin: 0,
fontSize: "18px",
color: "#111827",
}}
>
{p.nombre || p.contacto || "Proveedor sin nombre"}
</h3>

<p
style={{
margin: "6px 0 0 0",
color: "#6b7280",
fontSize: "14px",
}}
>
{p.sector || "Sin sector"} | {p.categoria || "Sin categoría"}
</p>
</div>

<div>{badgePlan(p.plan)}</div>
</div>

<p
style={{
margin: "0 0 10px 0",
fontSize: "13px",
color: "#6b7280",
lineHeight: 1.4,
}}
>
{obtenerTextoPlan(p.plan)}
</p>

{p.descripcion ? (
<p style={{ margin: "10px 0", color: "#374151" }}>
{p.descripcion}
</p>
) : null}

<p style={{ margin: "6px 0" }}>
<strong>Cobertura:</strong> {p.cobertura || "No definida"}
</p>

<p style={{ margin: "6px 0" }}>
<strong>Ubicación:</strong>{" "}
{[p.pais, p.provincia, p.ciudad].filter(Boolean).join(" | ") ||
"No definida"}
</p>

<p style={{ margin: "6px 0" }}>
<strong>Contacto:</strong> {p.contacto || "No definido"}
</p>

<p style={{ margin: "6px 0" }}>
<strong>Email:</strong> {p.email || "No definido"}
</p>

{p.telefono ? (
<p style={{ margin: "6px 0" }}>
<strong>Teléfono:</strong> {p.telefono}
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
onClick={() => verPerfilProveedor(p)}
style={{
backgroundColor: "#e5e7eb",
color: "#1f3552",
border: "none",
padding: "10px 14px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold",
}}
>
Ver perfil
</button>

{requerimientoId && requerimientoNombre ? (
<button
onClick={() => abrirChatConProveedor(p)}
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
Contactar proveedor para este requerimiento
</button>
) : (
<button
onClick={() =>
alert(
"Para iniciar un chat, primero abre un requerimiento y entra desde ahí."
)
}
style={{
backgroundColor: "#9ca3af",
color: "white",
border: "none",
padding: "10px 14px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold",
}}
>
Abrir desde requerimiento
</button>
)}
</div>
</div>
))}
</div>
)}
</div>
);
}

export default Proveedores;