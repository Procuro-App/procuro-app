import { Link } from "react-router-dom";

function Navbar() {
  const navStyle = {
    backgroundColor: "#2f5b8a",
    padding: "18px",
    borderRadius: "18px",
    marginBottom: "20px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
  };

  const brandStyle = {
    color: "white",
    fontSize: "clamp(30px, 7vw, 64px)",
    fontWeight: "bold",
    margin: 0,
    lineHeight: 1
  };

  const linksContainerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "10px",
    marginTop: "18px"
  };

  const linkStyle = {
    color: "white",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "clamp(13px, 2.8vw, 17px)",
    padding: "10px 12px",
    borderRadius: "10px",
    textAlign: "center",
    backgroundColor: "rgba(255,255,255,0.08)"
  };

  return (
    <nav style={navStyle}>
      <h1 style={brandStyle}>PROCURO</h1>

      <div style={linksContainerStyle}>
        <Link to="/" style={linkStyle}>Inicio</Link>
        <Link to="/proveedores" style={linkStyle}>Proveedores</Link>
        <Link to="/requerimientos" style={linkStyle}>Requerimientos</Link>
        <Link to="/cotizaciones" style={linkStyle}>Cotizaciones</Link>
        <Link to="/registro-proveedor" style={linkStyle}>Registro proveedor</Link>
        <Link to="/revision-proveedores" style={linkStyle}>Revisión proveedores</Link>
      </div>
    </nav>
  );
}

export default Navbar;