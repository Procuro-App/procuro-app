import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Cotizaciones() {
const navigate = useNavigate();

const [usuario, setUsuario] = useState(null);
const [cotizaciones, setCotizaciones] = useState([]);
const [cargando, setCargando] = useState(true);

useEffect(() => {
cargarCotizaciones();
}, []);

const cargarCotizaciones = async () => {
try {
setCargando(true);

const rol = localStorage.getItem("rol");

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

const { data: cotizacionesData, error: cotizacionesError } = await supabase
.from("cotizaciones")
.select("*")
.eq("proveedor_nombre", proveedor.nombre)
.order("created_at", { ascending: false });

if (cotizacionesError) {
console.error("Error cargando cotizaciones del proveedor:", cotizacionesError);
setCargando(false);
return;
}

setCotizaciones(cotizacionesData || []);
} else {
const { data: requerimientosData, error: requerimientosError } = await supabase
.from("requerimientos")
.select("nombre_requerimiento")
.eq("comprador_user_id", user.id);

if (requerimientosError) {
console.error("Error cargando requerimientos del comprador:", requerimientosError);
setCargando(false);
return;
}

const nombresRequerimientos = (requerimientosData || [])
.map((r) => r.nombre_requerimiento)
.filter(Boolean);

if (nombresRequerimientos.length === 0) {
setCotizaciones([]);
setCargando(false);
return;
}

const { data: cotizacionesData, error: cotizacionesError } = await supabase
.from("cotizaciones")
.select("*")
.in("requerimiento_nombre", nombresRequerimientos)
.order("created_at", { ascending: false });

if (cotizacionesError) {
console.error("Error cargando cotizaciones del comprador:", cotizacionesError);
setCargando(false);
return;
}

setCotizaciones(cotizacionesData || []);
}
} catch (error) {
console.error("Error general cargando cotizaciones:", error);
} finally {
setCargando(false);
}
};

const volverSegunRol = () => {
const rol = localStorage.getItem("rol");

if (rol === "proveedor") {
navigate("/panel-proveedor");
} else {
navigate("/panel-comprador");
}
};

const rol = localStorage.getItem("rol");

const cardStyle = {
backgroundColor: "white",
borderRadius: "16px",
padding: "20px",
boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
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
fontWeight: "bold"
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
fontWeight: "bold"
}}
>
← Volver
</button>

<h2>{rol === "proveedor" ? "Mis cotizaciones" : "Cotizaciones"}</h2>
<p>
{rol === "proveedor"
? "Aquí puedes revisar las cotizaciones que has enviado."
: "Aquí puedes revisar las cotizaciones recibidas para tus requerimientos."}
</p>
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
marginBottom: "12px"
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
<strong>Estado:</strong>{" "}
{c.estado || "No especificado"}
</p>

{c.valor_referencial ? (
<p>
<strong>Valor referencial:</strong>{" "}
{c.valor_referencial}
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
<p>No hay cotizaciones registradas todavía.</p>
)}
</div>
</div>
);
}

export default Cotizaciones;
