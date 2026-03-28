import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function ProveedorPerfil() {
const { id } = useParams();
const location = useLocation();
const navigate = useNavigate();

const [proveedor, setProveedor] = useState(location.state?.proveedor || null);
const [cargando, setCargando] = useState(!location.state?.proveedor);

useEffect(() => {
if (!proveedor && id) {
cargarProveedor();
} else {
incrementarViews(proveedor);
}
}, [id]);

const cargarProveedor = async () => {
const { data, error } = await supabase
.from("proveedores")
.select("*")
.eq("id", id)
.single();

if (error) {
console.error(error);
setCargando(false);
return;
}

setProveedor(data);
setCargando(false);

incrementarViews(data);
};

const incrementarViews = async (p) => {
if (!p?.id) return;

try {
await supabase
.from("proveedores")
.update({ views: (p.views || 0) + 1 })
.eq("id", p.id);

setProveedor((prev) => ({
...prev,
views: (prev?.views || 0) + 1,
}));
} catch (err) {
console.error("Error views:", err);
}
};

const volver = () => {
if (location.state?.volverA) {
navigate(location.state.volverA);
} else {
navigate("/proveedores");
}
};

if (cargando) return <p>Cargando proveedor...</p>;
if (!proveedor) return <p>No se encontró el proveedor.</p>;

return (
<div
style={{
backgroundColor: "white",
borderRadius: "16px",
padding: "28px",
boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
}}
>
<button
onClick={volver}
style={{
marginBottom: "16px",
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

<h2>{proveedor.nombre}</h2>

{/* 👁 VISUALIZACIONES */}
<p style={{ color: "#6b7280" }}>
👁 {proveedor.views || 0} visualizaciones
</p>

<p><strong>Sector:</strong> {proveedor.sector}</p>
<p><strong>Categoría:</strong> {proveedor.categoria}</p>
<p><strong>Descripción:</strong> {proveedor.descripcion}</p>
<hr style={{ margin: "20px 0" }} />

<h3 style={{ color: "#1f3552" }}>Documentos del proveedor</h3>

{proveedor.brochure_url && (
<p>
<strong>Brochure:</strong>{" "}
<a href={proveedor.brochure_url} target="_blank" rel="noreferrer">
Ver documento
</a>
</p>
)}

{proveedor.presentacion_url && (
<p>
<strong>Presentación:</strong>{" "}
<a href={proveedor.presentacion_url} target="_blank" rel="noreferrer">
Ver documento
</a>
</p>
)}

{proveedor.certificaciones_url && (
<p>
<strong>Certificaciones:</strong>{" "}
<a href={proveedor.certificaciones_url} target="_blank" rel="noreferrer">
Ver documento
</a>
</p>
)}

{proveedor.catalogo_url && (
<p>
<strong>Catálogo:</strong>{" "}
<a href={proveedor.catalogo_url} target="_blank" rel="noreferrer">
Ver documento
</a>
</p>
)}

<p><strong>Contacto:</strong> {proveedor.contacto}</p>
<p><strong>RUC / RUT / Tax ID:</strong> {proveedor.ruc_rut || "No definido"}</p>
<p><strong>Email:</strong> {proveedor.email}</p>
<p><strong>Teléfono:</strong> {proveedor.telefono}</p>

{proveedor.archivo_url && (
<p>
<strong>Archivo:</strong>{" "}
<a href={proveedor.archivo_url} target="_blank" rel="noreferrer">
Ver documento
</a>
</p>
)}
</div>
);
}

export default ProveedorPerfil;
