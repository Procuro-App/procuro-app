import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Proveedores from "./pages/Proveedores";
import Requerimientos from "./pages/Requerimientos";
import Cotizaciones from "./pages/Cotizaciones";
import RegistroProveedor from "./pages/RegistroProveedor";
import RevisionProveedores from "./pages/RevisionProveedores";
import Oportunidades from "./pages/Oportunidades";
import EnviarCotizacion from "./pages/EnviarCotizacion";
import SolicitarProveedor from "./pages/SolicitarProveedor";

function App() {
  return (
    <BrowserRouter>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/requerimientos" element={<Requerimientos />} />
          <Route path="/cotizaciones" element={<Cotizaciones />} />
          <Route path="/oportunidades" element={<Oportunidades />} />
          <Route path="/enviar-cotizacion/:id" element={<EnviarCotizacion />} />
          <Route path="/solicitar-proveedor" element={<SolicitarProveedor />} />
          <Route path="/registro-proveedor" element={<RegistroProveedor />} />
          <Route path="/revision-proveedores" element={<RevisionProveedores />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;