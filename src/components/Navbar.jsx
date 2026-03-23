import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import logo from "../assets/logo.png";

const ADMIN_EMAILS = ["TU_CORREO_ADMIN_AQUI"];

function Navbar() {
const [mostrarAdmin, setMostrarAdmin] = useState(false);

const isMobile =
typeof window !== "undefined" ? window.innerWidth <= 768 : false;

useEffect(() => {
validarAdminVisible();
}, []);

const validarAdminVisible = async () => {
try {
const { data, error } = await supabase.auth.getUser();

if (error) {
console.error("Error validando admin en navbar:", error);
setMostrarAdmin(false);
return;
}

const email = String(data?.user?.email || "").trim().toLowerCase();
const admins = ADMIN_EMAILS.map((item) =>
String(item || "").trim().toLowerCase()
);

setMostrarAdmin(admins.includes(email));
} catch (error) {
console.error("Error general validando admin en navbar:", error);
setMostrarAdmin(false);
}
};

return (
<nav
style={{
backgroundColor: "white",
borderRadius: "22px",
marginBottom: "22px",
boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
borderLeft: "8px solid #3b82f6",
borderRight: "8px solid #f59e0b",
padding: isMobile ? "10px 12px 14px 12px" : "8px 18px 10px 18px",
}}
>
<div
style={{
display: "flex",
flexDirection: "column",
alignItems: "center",
justifyContent: "center",
gap: isMobile ? "10px" : "6px",
}}
>
<img
src={logo}
alt="Procuro"
style={{
width: isMobile ? "88%" : "min(680px, 94%)",
maxWidth: isMobile ? "320px" : "680px",
height: "auto",
objectFit: "contain",
display: "block",
marginBottom: 0,
}}
/>

<div
style={{
width: "100%",
maxWidth: isMobile ? "100%" : "980px",
display: "grid",
gridTemplateColumns: isMobile
? "repeat(2, minmax(0, 1fr))"
: `repeat(${mostrarAdmin ? 5 : 4}, minmax(0, 1fr))`,
gap: isMobile ? "8px" : "10px",
marginTop: 0,
}}
>
<Link to="/" style={btnStyle(isMobile)}>
Inicio
</Link>

<Link to="/proveedores" style={btnStyle(isMobile)}>
Explorar proveedores
</Link>

<Link to="/acceso-comprador" style={btnStyle(isMobile)}>
Soy comprador
</Link>

<Link to="/acceso-proveedor" style={btnStyle(isMobile)}>
Soy proveedor
</Link>

{mostrarAdmin ? (
<Link
to="/revision-proveedores"
style={{
...btnStyle(isMobile),
gridColumn: isMobile ? "1 / -1" : "auto",
}}
>
Admin
</Link>
) : null}
</div>
</div>
</nav>
);
}

const btnStyle = (isMobile) => ({
textDecoration: "none",
background: "linear-gradient(135deg, #1f3552, #2563eb)",
color: "white",
fontWeight: "bold",
padding: isMobile ? "12px 8px" : "12px 10px",
borderRadius: "12px",
boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
fontSize: isMobile ? "14px" : "15px",
display: "flex",
alignItems: "center",
justifyContent: "center",
textAlign: "center",
minHeight: isMobile ? "44px" : "46px",
lineHeight: 1.2,
});

export default Navbar;