import { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

function ProveedorPerfil() {

const { id } = useParams();
const location = useLocation();

const [proveedor, setProveedor] = useState(location.state?.proveedor || null);
const [cargando, setCargando] = useState(!location.state?.proveedor);

useEffect(() => {
if (!proveedor && id) {
cargarProveedor();
}
}, [id]);

const cargarProveedor = async () => {

const { data, error } = await supabase
.from("proveedores")
.select("*")
.eq("id", id)
.single();

if (error) {
console.error("Error cargando proveedor:", error);
setCargando(false);
return;
}

setProveedor(data);
setCargando(false);
};

if (cargando) {
return <p>Cargando proveedor...</p>;
}

if (!proveedor) {
return <p>No se encontró el proveedor.</p>;
}

const badgeStyle = {
padding: "6px 10px",
borderRadius: "999px",
fontSize: "12px",
fontWeight: "bold",
marginRight: "6px"
};

const mostrarDoc = (titulo, url) => {

if (!url) return null;

return (
<p>
<strong>{titulo}:</strong>{" "}
<a href={url} target="_blank" rel="noreferrer">
Ver documento
</a>
</p>
);

};

return (

<div
style={{
backgroundColor: "white",
borderRadius: "16px",
padding: "28px",
boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
}}
>

<Link
to="/proveedores"
style={{
display: "inline-block",
marginBottom: "16px",
textDecoration: "none",
color: "#1f3552",
fontWeight: "bold"
}}
>
← Volver a proveedores
</Link>

<h2 style={{ marginBottom: "8px" }}>{proveedor.nombre}</h2>

{/* BADGES */}

<div style={{ marginBottom: "14px" }}>

{proveedor.verificado && (
<span
style={{
...badgeStyle,
backgroundColor: "#d1ecf1",
color: "#0c5460"
}}
>
Verificado
</span>
)}

{proveedor.patrocinado && (
<span
style={{
...badgeStyle,
backgroundColor: "#fff3cd",
color: "#856404"
}}
>
Patrocinado
</span>
)}

{proveedor.plan && (
<span
style={{
...badgeStyle,
backgroundColor: "#e2e3e5",
color: "#383d41"
}}
>
Plan {proveedor.plan}
</span>
)}

</div>

<p><strong>Tipo de proveedor:</strong> {proveedor.tipo_persona || "No especificado"}</p>
<p><strong>Cobertura:</strong> {proveedor.cobertura}</p>
<p><strong>País:</strong> {proveedor.pais}</p>

{proveedor.provincia && (
<p><strong>Provincia:</strong> {proveedor.provincia}</p>
)}

{proveedor.ciudad && (
<p><strong>Ciudad:</strong> {proveedor.ciudad}</p>
)}

<p><strong>Sector:</strong> {proveedor.sector}</p>
<p><strong>Categoría:</strong> {proveedor.categoria}</p>

<h3 style={{ marginTop: "20px" }}>Descripción</h3>

<p>{proveedor.descripcion || "El proveedor no ha agregado descripción."}</p>

<h3 style={{ marginTop: "20px" }}>Contacto</h3>

<p><strong>Contacto:</strong> {proveedor.contacto}</p>
<p><strong>Cargo:</strong> {proveedor.cargo}</p>
<p><strong>Email:</strong> {proveedor.email}</p>
<p><strong>Teléfono:</strong> {proveedor.telefono}</p>

{proveedor.telefono_secundario && (
<p><strong>Teléfono secundario:</strong> {proveedor.telefono_secundario}</p>
)}

<h3 style={{ marginTop: "20px" }}>Documentos</h3>

{mostrarDoc("Brochure", proveedor.brochure_url || proveedor.brochure)}
{mostrarDoc("Presentación", proveedor.presentacion_url || proveedor.presentacion)}
{mostrarDoc("Certificaciones", proveedor.certificaciones_url || proveedor.certificaciones)}
{mostrarDoc("Catálogo", proveedor.catalogo_url || proveedor.catalogo)}

{/* BOTÓN COMERCIAL */}

<Link
to="/solicitar-proveedor"
state={{ proveedor }}
style={{
display: "inline-block",
marginTop: "24px",
backgroundColor: "#1f3552",
color: "white",
textDecoration: "none",
padding: "12px 16px",
borderRadius: "8px",
fontWeight: "bold"
}}
>
Solicitar cotización
</Link>

</div>

);

}

export default ProveedorPerfil;