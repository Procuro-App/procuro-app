import emailjs from "@emailjs/browser";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const ADMIN_EMAILS = ["soporte.procuroapp@gmail.com"];

function RevisionProveedores() {
const navigate = useNavigate();

const [proveedoresPendientes, setProveedoresPendientes] = useState([]);
const [cargando, setCargando] = useState(true);
const [autorizado, setAutorizado] = useState(false);
const [usuario, setUsuario] = useState(null);

const isMobile =
typeof window !== "undefined" ? window.innerWidth <= 768 : false;

useEffect(() => {
validarAcceso();
}, []);

const validarAcceso = async () => {
try {
setCargando(true);

const { data, error } = await supabase.auth.getUser();

if (error) {
console.error("Error validando usuario admin:", error);
setAutorizado(false);
setCargando(false);
return;
}

const user = data?.user || null;
setUsuario(user);

const email = String(user?.email || "").trim().toLowerCase();
const admins = ADMIN_EMAILS.map((item) =>
String(item || "").trim().toLowerCase()
);

if (!email || !admins.includes(email)) {
setAutorizado(false);
setCargando(false);
return;
}

setAutorizado(true);
await cargarPendientes();
} catch (error) {
console.error("Error general validando acceso admin:", error);
setAutorizado(false);
setCargando(false);
}
};

const cargarPendientes = async () => {
const { data, error } = await supabase
.from("proveedores")
.select("*")
.eq("estado", "Pendiente")
.order("created_at", { ascending: false });

if (error) {
console.error("Error cargando proveedores pendientes:", error);
setCargando(false);
return;
}

setProveedoresPendientes(data || []);
setCargando(false);
};

const aprobarProveedor = async (proveedor) => {
try {
// 1. Aprobar en base
const { error } = await supabase
.from("proveedores")
.update({
estado: "Aprobado",
verificado: true,
})
.eq("id", proveedor.id);

if (error) {
throw error;
}

// 2. Enviar correo automático
await emailjs.send(
"soporte.procuroapp", // Service ID
"template_znn0f4l", // Template ID
{
nombre: proveedor.nombre || proveedor.contacto || "Proveedor",
email: proveedor.email,
},
"WMUL-bM_T6_fHLmbR" 
);

alert("Proveedor aprobado y correo enviado 🚀");

cargarPendientes();
} catch (error) {
console.error("Error:", error);
alert("Error al aprobar o enviar correo");
}
};

const limpiarPendientes = async () => {
const ids = proveedoresPendientes.map((p) => p.id);

if (ids.length === 0) return;

const confirmar = window.confirm(
"¿Seguro que deseas eliminar todos los proveedores pendientes?"
);

if (!confirmar) return;

const { error } = await supabase
.from("proveedores")
.delete()
.in("id", ids);

if (error) {
console.error("Error limpiando pendientes:", error);
alert("Hubo un problema al limpiar la bandeja.");
return;
}

alert("Bandeja limpiada correctamente.");
cargarPendientes();
};

const paginaStyle = {
minHeight: "100vh",
background:
"linear-gradient(135deg, #111827 0%, #1f2937 38%, #1f3552 72%, #0f172a 100%)",
padding: isMobile ? "16px" : "30px",
};

const cardPrincipal = {
background:
"linear-gradient(135deg, rgba(245,239,230,0.98), rgba(241,233,221,0.96))",
borderRadius: "24px",
padding: isMobile ? "22px 18px" : "30px 32px",
boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
border: "1px solid rgba(249,115,22,0.16)",
marginBottom: "20px",
position: "relative",
overflow: "hidden",
};

const cardSecundaria = {
background: "#f8f5ef",
borderRadius: "20px",
padding: isMobile ? "20px 16px" : "24px",
boxShadow: "0 12px 26px rgba(0,0,0,0.18)",
border: "1px solid rgba(31,53,82,0.10)",
marginBottom: "18px",
};

const cardProveedor = {
background: "white",
border: "1px solid #e5e7eb",
borderRadius: "16px",
padding: "18px",
boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
marginBottom: "14px",
};

const botonVolver = {
marginBottom: "16px",
backgroundColor: "#e5e7eb",
border: "none",
padding: "8px 12px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "700",
};

const botonAprobar = {
background: "linear-gradient(135deg, #1f3552, #2563eb)",
color: "white",
border: "none",
padding: "10px 14px",
borderRadius: "10px",
cursor: "pointer",
fontWeight: "700",
};

const botonEliminar = {
background: "linear-gradient(135deg, #dc2626, #b91c1c)",
color: "white",
border: "none",
padding: "12px 18px",
borderRadius: "10px",
cursor: "pointer",
fontWeight: "700",
};

if (cargando) {
return (
<div style={paginaStyle}>
<div style={cardSecundaria}>
<button onClick={() => navigate("/")} style={botonVolver}>
← Volver
</button>
<p>Cargando revisión de proveedores...</p>
</div>
</div>
);
}

if (!autorizado) {
return (
<div style={paginaStyle}>
<div style={cardSecundaria}>
<button onClick={() => navigate("/")} style={botonVolver}>
← Volver
</button>
<h2 style={{ marginTop: 0, color: "#1f3552" }}>Acceso restringido</h2>
<p style={{ color: "#5b6472" }}>
No tienes permisos para acceder a esta sección.
</p>
{usuario?.email ? (
<p style={{ color: "#5b6472", marginBottom: 0 }}>
Sesión detectada: <strong>{usuario.email}</strong>
</p>
) : null}
</div>
</div>
);
}

return (
<div style={paginaStyle}>
<button onClick={() => navigate("/")} style={botonVolver}>
← Volver
</button>

<div style={cardPrincipal}>
<div
style={{
position: "absolute",
top: "-30px",
right: "-20px",
width: "150px",
height: "150px",
background:
"radial-gradient(circle, rgba(249,115,22,0.16) 0%, rgba(249,115,22,0) 72%)",
pointerEvents: "none",
}}
/>

<p
style={{
margin: 0,
color: "#f97316",
fontWeight: "800",
textTransform: "uppercase",
letterSpacing: "0.08em",
fontSize: "12px",
position: "relative",
zIndex: 1,
}}
>
Administración
</p>

<h1
style={{
margin: "10px 0 8px 0",
fontSize: isMobile ? "24px" : "30px",
color: "#1f3552",
fontWeight: "700",
lineHeight: 1.25,
position: "relative",
zIndex: 1,
}}
>
Revisión de proveedores
</h1>

<p
style={{
marginTop: 0,
marginBottom: 0,
color: "#5b6472",
lineHeight: 1.65,
fontSize: isMobile ? "14px" : "16px",
maxWidth: "840px",
position: "relative",
zIndex: 1,
}}
>
Aquí puedes aprobar proveedores pendientes antes de que se muestren en
la plataforma.
</p>
</div>

<div style={cardSecundaria}>
<p style={{ marginTop: 0, color: "#5b6472" }}>
Proveedores pendientes:{" "}
<strong>{proveedoresPendientes.length}</strong>
</p>

{proveedoresPendientes.length > 0 ? (
<>
{proveedoresPendientes.map((p) => (
<div key={p.id} style={cardProveedor}>
<h3
style={{
marginTop: 0,
marginBottom: "10px",
color: "#1f3552",
fontSize: "20px",
fontWeight: "700",
}}
>
{p.nombre || "Proveedor sin nombre"}
</h3>

<p><strong>Estado:</strong> {p.estado || "Pendiente"}</p>
<p><strong>RUC / RUT / Tax ID:</strong> {p.ruc_rut || "❌ Falta RUC"}</p>
<p><strong>Cobertura:</strong> {p.cobertura || "No definida"}</p>
<p><strong>País:</strong> {p.pais || "No definido"}</p>
{p.provincia ? <p><strong>Provincia:</strong> {p.provincia}</p> : null}
{p.ciudad ? <p><strong>Ciudad:</strong> {p.ciudad}</p> : null}
<p><strong>Sector:</strong> {p.sector || "No definido"}</p>
<p><strong>Categoría:</strong> {p.categoria || "No definida"}</p>
{p.descripcion ? (
<p><strong>Descripción:</strong> {p.descripcion}</p>
) : null}
<p><strong>Contacto:</strong> {p.contacto || "No definido"}</p>
{p.cargo ? <p><strong>Cargo:</strong> {p.cargo}</p> : null}
<p><strong>Correo electrónico:</strong> {p.email || "No definido"}</p>
<p><strong>Teléfono principal:</strong> {p.telefono || "No definido"}</p>
{p.telefono_secundario ? (
<p><strong>Teléfono secundario:</strong> {p.telefono_secundario}</p>
) : null}
{p.brochure ? <p><strong>Brochure:</strong> {p.brochure}</p> : null}
{p.presentacion ? (
<p><strong>Presentación:</strong> {p.presentacion}</p>
) : null}
{p.certificaciones ? (
<p><strong>Certificaciones:</strong> {p.certificaciones}</p>
) : null}
{p.catalogo ? <p><strong>Catálogo:</strong> {p.catalogo}</p> : null}

<p>
<strong>Fecha de registro:</strong>{" "}
{p.created_at
? new Date(p.created_at).toLocaleString()
: p.fecha_registro || "No disponible"}
</p>

<button
onClick={() => aprobarProveedor(p)}
disabled={!p.ruc_rut}
style={{
...botonAprobar,
background: !p.ruc_rut ? "#9ca3af" : botonAprobar.background,
cursor: !p.ruc_rut ? "not-allowed" : "pointer",
opacity: !p.ruc_rut ? 0.8 : 1,
}}
>
{!p.ruc_rut ? "Falta RUC" : "Aprobar proveedor"}
</button>
</div>
))}

<button onClick={limpiarPendientes} style={botonEliminar}>
Limpiar bandeja
</button>
</>
) : (
<p style={{ marginBottom: 0 }}>
No hay proveedores pendientes de revisión.
</p>
)}
</div>
</div>
);
}

export default RevisionProveedores;
