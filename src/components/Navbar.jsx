import { Link } from "react-router-dom";

function Navbar() {
  const linkStyle = {
    color: "white",
    textDecoration: "none",
    marginRight: "20px",
    fontWeight: "bold"
  };

  return (
    <nav
      style={{
        background: "linear-gradient(135deg, #1f3552, #2f5d8a)",
        padding: "20px 30px",
        borderRadius: "16px",
        marginBottom: "20px"
      }}
    >
      <h1 style={{ color: "white", margin: "0 0 12px 0" }}>PROCURO</h1>

      <div>
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