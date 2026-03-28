import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import logo from "../assets/logo_procuro_orange.png";

const ADMIN_EMAILS = ["soporte.procuroapp@gmail.com"];

function Navbar() {
const [mostrarAdmin, setMostrarAdmin] = useState(false);
const location = useLocation();

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

const activo = (ruta) => location.pathname === ruta;

return (
<nav
style={{
background:
"linear-gradient(135deg, rgba(245, 176, 72, 0.98), rgba(241,233,221,0.96))",
borderRadius: "28px",
marginBottom: "24px",
boxShadow: "0 18px 40px rgba(0,0,0,0.20)",
border: "1px solid rgba(249,115,22,0.16)",
padding: isMobile ? "18px 14px 18px 14px" : "22px 24px 22px 24px",
position: "relative",
overflow: "hidden",
}}
>
<div
style={{
position: "absolute",
top: "-40px",
left: "-40px",
width: "180px",
height: "180px",
background:
"radial-gradient(circle, rgba(37,99,235,0.14) 0%, rgba(37,99,235,0) 72%)",
pointerEvents: "none",
}}
/>

<div
style={{
position: "absolute",
right: "-30px",
bottom: "-30px",
width: "180px",
height: "180px",
background:
"radial-gradient(circle, rgba(249,115,22,0.16) 0%, rgba(249,115,22,0) 72%)",
pointerEvents: "none",
}}
/>

<div
style={{
position: "relative",
zIndex: 1,
display: "flex",
flexDirection: "column",
alignItems: "center",
gap: isMobile ? "14px" : "16px",
}}
>
<div
style={{
width: "100%",
display: "flex",
justifyContent: "center",
paddingTop: isMobile ? "4px" : "6px",
}}
>
<img
src={logo}
alt="Procuro"
style={{
width: isMobile ? "92%" : "min(660px, 92%)",
maxWidth: isMobile ? "340px" : "660px",
height: "auto",
objectFit: "contain",
display: "block",
filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.14))",
}}
/>
</div>

<div
style={{
width: "100%",
maxWidth: isMobile ? "100%" : "1080px",
display: "grid",
gridTemplateColumns: isMobile
? "repeat(2, minmax(0, 1fr))"
: `repeat(${mostrarAdmin ? 5 : 4}, minmax(0, 1fr))`,
gap: isMobile ? "10px" : "12px",
}}
>
<Link to="/" style={btnStyle(isMobile, activo("/"), "inicio")}>
Inicio
</Link>

<Link
to="/proveedores"
style={btnStyle(isMobile, activo("/proveedores"), "explorar")}
>
Explorar proveedores
</Link>

<Link
to="/acceso-comprador"
style={btnStyle(isMobile, activo("/acceso-comprador"), "comprador")}
>
Soy comprador
</Link>

<Link
to="/acceso-proveedor"
style={btnStyle(isMobile, activo("/acceso-proveedor"), "proveedor")}
>
Soy proveedor
</Link>

{mostrarAdmin ? (
<Link
to="/admin"
style={{
...btnStyle(
isMobile,
activo("/revision-proveedores"),
"admin"
),
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

const btnStyle = (isMobile, activo, tipo) => {
const estilos = {
inicio: {
fondo: activo
? "linear-gradient(135deg, #111827, #1f2937)"
: "linear-gradient(135deg, #1f2937, #374151)",
sombra: "0 8px 16px rgba(17,24,39,0.24)",
},
explorar: {
fondo: activo
? "linear-gradient(135deg, #1f3552, #2563eb)"
: "linear-gradient(135deg, #27496d, #3b82f6)",
sombra: "0 8px 16px rgba(37,99,235,0.22)",
},
comprador: {
fondo: activo
? "linear-gradient(135deg, #1f3552, #1e3a8a)"
: "linear-gradient(135deg, #24466a, #2563eb)",
sombra: "0 8px 16px rgba(30,58,138,0.22)",
},
proveedor: {
fondo: activo
? "linear-gradient(135deg, #ea580c, #c2410c)"
: "linear-gradient(135deg, #f97316, #ea580c)",
sombra: "0 8px 16px rgba(249,115,22,0.24)",
},
admin: {
fondo: activo
? "linear-gradient(135deg, #581c87, #7e22ce)"
: "linear-gradient(135deg, #6b21a8, #9333ea)",
sombra: "0 8px 16px rgba(147,51,234,0.22)",
},
};

const estilo = estilos[tipo] || estilos.inicio;

return {
textDecoration: "none",
background: estilo.fondo,
color: "white",
fontWeight: "bold",
padding: isMobile ? "13px 10px" : "14px 12px",
borderRadius: "14px",
boxShadow: estilo.sombra,
fontSize: isMobile ? "14px" : "15px",
display: "flex",
alignItems: "center",
justifyContent: "center",
textAlign: "center",
minHeight: isMobile ? "48px" : "50px",
lineHeight: 1.2,
border: activo ? "2px solid rgba(255,255,255,0.42)" : "2px solid transparent",
transition: "all 0.2s ease",
};
};

export default Navbar;
