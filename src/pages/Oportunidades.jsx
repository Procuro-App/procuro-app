import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Oportunidades() {
const navigate = useNavigate();

const [usuario, setUsuario] = useState(null);
const [proveedor, setProveedor] = useState(null);
const [requerimientos, setRequerimientos] = useState([]);
const [cargando, setCargando] = useState(true);

useEffect(() => {
cargarDatos();
}, []);

const cargarDatos = async () => {
try {
setCargando(true);

const { data: userData } = await supabase.auth.getUser();
const user = userData?.user || null;

setUsuario(user);

if (!user?.email) return;

// Obtener proveedor
const { data: proveedorData } = await supabase
.from("proveedores")
.select("*")
.eq("email", user.email)
.maybeSingle();

setProveedor(proveedorData);

if (!proveedorData?.sector) {
setRequerimientos([]);
return;
}

// Obtener requerimientos por sector
const { data: requerimientosData, error } = await supabase
.from("requerimientos")
.select("*")
.eq("sector", proveedorData.sector)
.order("created_at", { ascending: false });

if (error) {
console.error("Error cargando oportunidades:", error);
return;
}

setRequerimientos(requerimientosData || []);
} catch (error) {
console.error("Error general:", error);
} finally {
setCargando(false);
}
};

const abrirChat = (req) => {
navigate(
`/chat?proveedor_id=${proveedor?.id}&proveedor_email=${proveedor?.email}&proveedor_nombre=${proveedor?.nombre}&requerimiento_id=${req.id}&requerimiento_nombre=${req.nombre_requerimiento}`
);
};

const card = {
background: "#f8f5ef",
borderRadius: "16px",
padding: "18px",
boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
marginBottom: "14px",
};

const boton = {
marginTop: "12px",
background: "linear-gradient(135deg, #f97316, #ea580c)",
color: "white",
border: "none",
padding: "10px 14px",
borderRadius: "8px",
cursor: "pointer",
fontWeight: "bold",
};

if (cargando) {
return <p>Cargando oportunidades...</p>;
}

return (
<div>
<h2 style={{ color: "#1f3552" }}>Oportunidades</h2>
<p style={{ color: "#5b6472" }}>
Requerimientos disponibles según tu sector.
</p>

{requerimientos.length > 0 ? (
requerimientos.map((r) => (
<div key={r.id} style={card}>
<h3 style={{ marginTop: 0 }}>{r.nombre_requerimiento}</h3>

<p><strong>Sector:</strong> {r.sector}</p>

{r.descripcion && (
<p><strong>Detalle:</strong> {r.descripcion}</p>
)}

<p style={{ fontSize: "12px", color: "#888" }}>
{new Date(r.created_at).toLocaleString()}
</p>

<button style={boton} onClick={() => abrirChat(r)}>
Abrir conversación
</button>
</div>
))
) : (
<p>No hay oportunidades disponibles para tu sector aún.</p>
)}
</div>
);
}

export default Oportunidades;