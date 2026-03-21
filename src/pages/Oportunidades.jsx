import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Oportunidades() {
const navigate = useNavigate();

const [usuario, setUsuario] = useState(null);
const [proveedorActual, setProveedorActual] = useState(null);
const [oportunidades, setOportunidades] = useState([]);
const [cargando, setCargando] = useState(true);

useEffect(() => {
cargarOportunidades();
}, []);

const cargarOportunidades = async () => {
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

if (!user?.email) {
setCargando(false);
return;
}

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
setProveedorActual(proveedor);

if (!proveedor?.sector) {
setOportunidades([]);
setCargando(false);
return;
}

const { data: requerimientosData, error: requerimientosError } = await supabase
.from("requerimientos")
.select("*")
.eq("estado", "Abierto")
.order("created_at", { ascending: false });

if (requerimientosError) {
console.error("Error cargando requerimientos:", requerimientosError);
setCargando(false);
return;
}

const oportunidadesFiltradas = (requerimientosData || []).filter((r) => {
const sectorRequerimiento = (r.sector || "").trim().toLowerCase();
const sectorProveedor = (proveedor.sector || "").trim().toLowerCase();

return sectorRequerimiento === sectorProveedor;
});

setOportunidades(oportunidadesFiltradas);
} catch (error) {
console.error("Error general cargando oportunidades:", error);
} finally {
setCargando(false);
}
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
<p>Cargando oportunidades...</p>
</div>
);
}

if (!usuario) {
return (
<div style={cardStyle}>
<h2>Oportunidades</h2>
<p>Debes iniciar sesión como proveedor para ver oportunidades.</p>

<Link
to="/acceso-proveedor"
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
Ir a acceso proveedor
</Link>
</div>
);
}

if (!proveedorActual) {
return (
<div style={cardStyle}>
<button
onClick={() => navigate("/panel-proveedor")}
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
← Volver al panel proveedor
</button>

<h2>Oportunidades</h2>
<p>No encontramos un proveedor vinculado a este correo.</p>
</div>
);
}

return (
<div>
<div style={{ ...cardStyle, marginBottom: "20px" }}>
<button
onClick={() => navigate("/panel-proveedor")}
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
← Volver al panel proveedor
</button>

<h2>Oportunidades</h2>
<p>
Estas son oportunidades alineadas a tu sector:{" "}
<strong>{proveedorActual.sector || "No definido"}</strong>
</p>
</div>

<div style={cardStyle}>
{oportunidades.length > 0 ? (
oportunidades.map((o) => (
<div
key={o.id}
style={{
border: "1px solid #dcdcdc",
borderRadius: "10px",
padding: "15px",
marginBottom: "12px"
}}
>
<h3 style={{ marginTop: 0 }}>
{o.nombre_requerimiento || "Sin nombre"}
</h3>

<p>
<strong>Sector:</strong> {o.sector || "No especificado"}
</p>

<p>
<strong>Categoría:</strong> {o.categoria || "No especificada"}
</p>

{o.descripcion ? (
<p>
<strong>Descripción:</strong> {o.descripcion}
</p>
) : null}

{o.archivo_url ? (
<p>
<strong>Archivo:</strong>{" "}
<a href={o.archivo_url} target="_blank" rel="noreferrer">
Ver archivo
</a>
</p>
) : null}

<Link
to={`/enviar-cotizacion/${o.id}`}
style={{
display: "inline-block",
marginTop: "8px",
backgroundColor: "#1f3552",
color: "white",
textDecoration: "none",
padding: "8px 12px",
borderRadius: "8px"
}}
>
Enviar cotización
</Link>
</div>
))
) : (
<p>No hay oportunidades disponibles para tu sector.</p>
)}
</div>
</div>
);
}

export default Oportunidades;
