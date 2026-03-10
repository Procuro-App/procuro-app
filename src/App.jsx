import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Proveedores from "./pages/Proveedores";
import Requerimientos from "./pages/Requerimientos";
import Cotizaciones from "./pages/Cotizaciones";
import RegistroProveedor from "./pages/RegistroProveedor";
import RevisionProveedores from "./pages/RevisionProveedores";

function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          backgroundColor: "#eef2f7",
          minHeight: "100vh",
          padding: "30px",
          fontFamily: "Arial, sans-serif"
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/proveedores" element={<Proveedores />} />
            <Route path="/requerimientos" element={<Requerimientos />} />
            <Route path="/cotizaciones" element={<Cotizaciones />} />
            <Route path="/registro-proveedor" element={<RegistroProveedor />} />
            <Route path="/revision-proveedores" element={<RevisionProveedores />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;