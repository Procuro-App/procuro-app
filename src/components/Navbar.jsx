import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

function Navbar() {
return (
<nav
style={{
backgroundColor: "white",
borderRadius: "22px",
marginBottom: "22px",
boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
borderLeft: "8px solid #3b82f6",
borderRight: "8px solid #f59e0b",
padding: "2px 18px 6px 18px"
}}
>
<div
style={{
display: "flex",
flexDirection: "column",
alignItems: "center",
justifyContent: "center",
gap: "6px"
}}
>
<img
src={logo}
alt="Procuro"
style={{
width: "min(680px, 94%)",
height: "400px",
objectFit: "contain",
display: "block",
marginBottom: "0"
}}
/>

<div
style={{
width: "100%",
maxWidth: "980px",
display: "grid",
gridTemplateColumns: "repeat(5, 1fr)",
gap: "10px",
marginTop: "0"
}}
>
<Link to="/" style={btnStyle}>
Inicio
</Link>

<Link to="/proveedores" style={btnStyle}>
Explorar proveedores
</Link>

<Link to="/acceso-comprador" style={btnStyle}>
Soy comprador
</Link>

<Link to="/acceso-proveedor" style={btnStyle}>
Soy proveedor
</Link>

<Link to="/revision-proveedores" style={btnStyle}>
Admin
</Link>
</div>
</div>
</nav>
);
}

const btnStyle = {
textDecoration: "none",
background: "linear-gradient(135deg, #1f3552, #2563eb)",
color: "white",
fontWeight: "bold",
padding: "11px 10px",
borderRadius: "12px",
boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
fontSize: "15px",
display: "flex",
alignItems: "center",
justifyContent: "center",
textAlign: "center",
minHeight: "44px"
};

export default Navbar;