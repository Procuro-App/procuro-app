import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Cotizaciones() {
const navigate = useNavigate();
const [searchParams] = useSearchParams();

const [usuario, setUsuario] = useState(null);
const [cotizaciones, setCotizaciones] = useState([]);
const [cargando, setCargando] = useState(true);
const [nombreRequerimientoActual, setNombreRequerimientoActual] = useState("");

const requerimientoId = searchParams.get("requerimiento_id") || "";
const rol = localStorage.getItem("rol");

useEffect(() => {
cargarCotizaciones();
}, [requerimientoId]);

const cargarCotizaciones = async () => {
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

if (!user?.id && !user?.email) {
setCargando(false);
return;
}

if (rol === "proveedor") {
const { data: proveedoresData, error: proveedorError } = await supabase
.from("proveedores")
.select("*")
.eq("email", user.email)
.order("created_at", { ascending: false })
.limit(1);

if (proveedorError) {
console.error("Error cargando proveedor:", proveedorError);
setCargando(false);
return;
}

const proveedor = proveedoresData?.[0] || null;

if (!proveedor?.nombre) {
setCotizaciones([]);
setCargando(false);
return;
}

let query = supabase
.from("cotizaciones")
.select("*")
.eq("proveedor_nombre", proveedor.nombre)
.order("created_at", { ascending: false });

if (requerimientoId) {
query = query.eq("requerimiento_id", requerimientoId);
}

const { data: cotizacionesData, error: cotizacionesError } = await query;

if (cotizacionesError) {
console.error("Error cargando cotizaciones del proveedor:", cotizacionesError);
setCargando(false);
return;
}

setCotizaciones(cotizacionesData || []);

if (requerimientoId) {
await cargarNombreRequerimiento(requerimientoId);
}
} else {
if (requerimientoId) {
const { data: requerimientoData, error: requerimientoError } = await supabase
.from("requerimientos")
.select("*")
.eq("id", requerimientoId)
.eq("comprador_user_id", user.id)
.maybeSingle();

if (requerimientoError) {
console.error("Error cargando requerimiento filtrado:", requerimientoError);
setCargando(false);
return;
}

if (!requerimientoData) {
setCotizaciones([]);
setCargando(false);
return;
}

setNombreRequerimientoActual(
requerimientoData.nombre_requerimiento || ""
);

const { data: cotizacionesData, error: cotizacionesError } = await supabase
.from("cotizaciones")
.select("*")
.eq("requerimiento_id", requerimientoId)
.order("created_at", { ascending: false });

if (cotizacionesError) {
console.error("Error cargando cotizaciones del requerimiento:", cotizacionesError);
setCargando(false);
return;
}

setCotizaciones(cotizacionesData || []);
} else {
const { data: requerimientosData, error: requerimientosError } = await supabase
.from("requerimientos")
.select("id, nombre_requerimiento")
.eq("comprador_user_id", user.id);

if (requerimientosError) {
console.error(
"Error cargando requerimientos del comprador:",
requerimientosError
);
setCargando(false);
return;
}

const requerimientoIds = (requerimientosData || [])
.map((r) => r.id)
.filter(Boolean);

if (requerimientoIds.length === 0) {
setCotizaciones([]);
setCargando(false);
return;
}

const { data: cotizacionesData, error: cotizacionesError } = await supabase
.from("cotizaciones")
.select("*")
.in("requerimiento_id", requerimientoIds)
.order("created_at", { ascending: false });

if (cotizacionesError) {
console.error("Error cargando cotizaciones del comprador:", cotizacionesError);
setCargando(false);
return;
}

setCotizaciones(cotizacionesData || []);
}
}
} catch (error) {
console.error("Error general cargando cotizaciones:", error);
} finally {
setCargando(false);
}
};

const cargarNombreRequerimiento = async (id) => {
try {
const { data, error } = await supabase
.from("requerimientos")
.select("nombre_requerimiento")
.eq("id", id)
.maybeSingle();

if (error) {
console.error("Error cargando nombre del requerimiento:", error);
return;
}

setNombreRequerimientoActual(data?.nombre_requerimiento || "");
} catch (error) {
console.error("Error general cargando nombre del requerimiento:", error);
}
};

const volverSegunRol = () => {
if (rol === "proveedor") {
navigate("/panel-proveedor");
return;
}

if (requerimientoId) {
navigate("/requerimientos");
return;
}

navigate("/panel-comprador");
};

const irAComparador = () => {
if (!requerimientoId) return;
navigate(`/comparador-cotizaciones?requerimiento_id=${requerimientoId}`);
};

const hayComparables = useMemo(() => {
return rol !== "proveedor" && requerimientoId && cotizaciones.length > 0;
}, [rol, requerimientoId, cotizaciones.length]);

const cardStyle = {
backgroundColor: "white",
borderRadius: "16px",
padding: "20px",
boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
};

if (cargando) {
return (
<div style={cardStyle}>
<p>Cargando cotizaciones...</p>
</div>
);
}

if (!usuario) {
return (
<div style={cardStyle}>
<h2>Cotizaciones</h2>
<p>Debes iniciar sesión para ver tus cotizaciones.</p>

<Link
to={rol === "proveedor" ? "/acceso-proveedor" : "/acceso-comprador"}
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
Ir al acceso
</Link>
</div>
);
}

return (
<div>
<div style={{ ...cardStyle, marginBottom: "20px" }}>
<button
onClick={volverSegunRol}
style={{
marginBottom: "12px",
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

<h2>
{rol === "proveedor"
? "Mis cotizaciones"
: requerimientoId
? "Cotizaciones del requerimiento"
: "Cotizaciones"}
</h2>

<p>
{rol === "proveedor"
? "Aquí puedes revisar las cotizaciones que has enviado."
: requerimientoId
? `Aquí puedes revisar las cotizaciones recibidas para: ${
nombreRequerimientoActual || "este requerimiento"
}.`
: "Aquí puedes revisar las cotizaciones recibidas para tus requerimientos."}
</p>

{hayComparables ? (
<button
onClick={irAComparador}
style={{
marginTop: "10px",
backgroundColor: "#2563eb",
color: "white",
border: "none",
padding: "10px 14px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold",
}}
>
Comparar cotizaciones
</button>
) : null}
</div>

<div style={cardStyle}>
{cotizaciones.length > 0 ? (
cotizaciones.map((c) => (
<div
key={c.id}
style={{
border: "1px solid #dcdcdc",
borderRadius: "10px",
padding: "15px",
marginBottom: "12px",
}}
>
<h3 style={{ marginTop: 0 }}>
{c.requerimiento_nombre || "Sin requerimiento"}
</h3>

{rol === "proveedor" ? null : (
<p>
<strong>Proveedor:</strong>{" "}
{c.proveedor_nombre || "No especificado"}
</p>
)}

<p>
<strong>Estado:</strong> {c.estado || "No especificado"}
</p>

{c.valor_referencial ? (
<p>
<strong>Valor referencial:</strong> {c.valor_referencial}
</p>
) : (
<p>
<strong>Valor referencial:</strong> No especificado
</p>
)}

{c.contacto ? (
<p>
<strong>Contacto:</strong> {c.contacto}
</p>
) : null}

{c.email ? (
<p>
<strong>Email:</strong> {c.email}
</p>
) : null}

{c.telefono ? (
<p>
<strong>Teléfono:</strong> {c.telefono}
</p>
) : null}

{c.mensaje ? (
<p>
<strong>Mensaje:</strong> {c.mensaje}
</p>
) : null}

{c.archivo_url ? (
<p>
<strong>Archivo adjunto:</strong>{" "}
<a href={c.archivo_url} target="_blank" rel="noreferrer">
Ver archivo
</a>
</p>
) : (
<p>
<strong>Archivo adjunto:</strong> No adjunto
</p>
)}
</div>
))
) : (
<p>
{requerimientoId
? "Aún no hay cotizaciones para este requerimiento."
: "No hay cotizaciones registradas todavía."}
</p>
)}
</div>
</div>
);
}

export default Cotizaciones;
