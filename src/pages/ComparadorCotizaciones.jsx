import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function ComparadorCotizaciones() {
const navigate = useNavigate();
const [searchParams] = useSearchParams();

const [usuario, setUsuario] = useState(null);
const [requerimientos, setRequerimientos] = useState([]);
const [cotizaciones, setCotizaciones] = useState([]);
const [requerimientoSeleccionado, setRequerimientoSeleccionado] = useState("");
const [cargando, setCargando] = useState(true);

const requerimientoIdURL = searchParams.get("requerimiento_id") || "";

useEffect(() => {
cargarDatosComprador();
}, []);

const cargarDatosComprador = async () => {
try {
setCargando(true);

const { data: userData } = await supabase.auth.getUser();
const user = userData?.user || null;
setUsuario(user);

if (!user?.id) return;

const { data: requerimientosData } = await supabase
.from("requerimientos")
.select("*")
.eq("comprador_user_id", user.id)
.order("created_at", { ascending: false });

setRequerimientos(requerimientosData || []);

const requerimientoIds = (requerimientosData || [])
.map((r) => r.id)
.filter(Boolean);

if (requerimientoIds.length === 0) {
setCotizaciones([]);
return;
}

const { data: cotizacionesData } = await supabase
.from("cotizaciones")
.select("*")
.in("requerimiento_id", requerimientoIds)
.order("created_at", { ascending: false });

setCotizaciones(cotizacionesData || []);

// 👉 si vienes desde botón comparar
if (requerimientoIdURL) {
setRequerimientoSeleccionado(requerimientoIdURL);
}
} catch (error) {
console.error("Error cargando comparador:", error);
} finally {
setCargando(false);
}
};

const cotizacionesFiltradas = useMemo(() => {
if (!requerimientoSeleccionado) return [];

return cotizaciones.filter(
(c) => c.requerimiento_id === requerimientoSeleccionado
);
}, [cotizaciones, requerimientoSeleccionado]);

const convertirANumero = (valor) => {
if (!valor) return null;

const limpio = String(valor)
.replace(/[^\d.,]/g, "")
.replace(/,/g, "");

const numero = Number(limpio);
return Number.isNaN(numero) ? null : numero;
};

const cotizacionesConAnalisis = useMemo(() => {
const conValor = cotizacionesFiltradas.map((c) => ({
...c,
valorNumerico: convertirANumero(c.valor_referencial),
}));

const valores = conValor
.map((c) => c.valorNumerico)
.filter((v) => v !== null)
.sort((a, b) => a - b);

if (valores.length === 0) return conValor;

const min = valores[0];
const max = valores[valores.length - 1];

return conValor.map((c) => {
if (c.valorNumerico === null) return { ...c, nivel: "sin" };
if (c.valorNumerico === min) return { ...c, nivel: "mejor" };
if (c.valorNumerico === max && max !== min)
return { ...c, nivel: "alto" };
return { ...c, nivel: "medio" };
});
}, [cotizacionesFiltradas]);

const estilo = (nivel) => {
if (nivel === "mejor")
return { bg: "#d1fae5", color: "#065f46", text: "🟢 Mejor" };
if (nivel === "medio")
return { bg: "#fef3c7", color: "#92400e", text: "🟡 Medio" };
if (nivel === "alto")
return { bg: "#fee2e2", color: "#991b1b", text: "🔴 Alto" };

return { bg: "#e5e7eb", color: "#374151", text: "Sin dato" };
};

if (cargando) return <p>Cargando...</p>;

if (!usuario) {
return (
<div>
<h2>Comparador</h2>
<Link to="/acceso-comprador">Ir a login</Link>
</div>
);
}

return (
<div>
<button onClick={() => navigate("/panel-comprador")}>
← Volver
</button>

<h2>Comparador de cotizaciones</h2>

{/* SELECT */}
<select
value={requerimientoSeleccionado}
onChange={(e) => setRequerimientoSeleccionado(e.target.value)}
>
<option value="">Selecciona requerimiento</option>
{requerimientos.map((r) => (
<option key={r.id} value={r.id}>
{r.nombre_requerimiento}
</option>
))}
</select>

{/* RESULTADOS */}
{cotizacionesConAnalisis.length > 0 ? (
<div>
{cotizacionesConAnalisis.map((c) => {
const s = estilo(c.nivel);

return (
<div key={c.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
<div style={{
background: s.bg,
color: s.color,
padding: 5,
borderRadius: 8,
display: "inline-block"
}}>
{s.text}
</div>

<h3>{c.proveedor_nombre}</h3>
<p>Valor: {c.valor_referencial}</p>
<p>Contacto: {c.contacto}</p>

{c.archivo_url && (
<a href={c.archivo_url} target="_blank">Ver archivo</a>
)}
</div>
);
})}
</div>
) : (
<p>No hay cotizaciones</p>
)}
</div>
);
}

export default ComparadorCotizaciones;