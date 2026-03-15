import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Proveedores from "./pages/Proveedores";
import ProveedorPerfil from "./pages/ProveedorPerfil";
import Requerimientos from "./pages/Requerimientos";
import Cotizaciones from "./pages/Cotizaciones";
import ComparadorCotizaciones from "./pages/ComparadorCotizaciones";
import Oportunidades from "./pages/Oportunidades";
import PanelProveedor from "./pages/PanelProveedor";
import PanelComprador from "./pages/PanelComprador";
import AccesoProveedor from "./pages/AccesoProveedor";
import RecuperarPassword from "./pages/RecuperarPassword";
import EnviarCotizacion from "./pages/EnviarCotizacion";
import SolicitarProveedor from "./pages/SolicitarProveedor";
import RegistroProveedor from "./pages/RegistroProveedor";
import RevisionProveedores from "./pages/RevisionProveedores";

function App() {
return (
<BrowserRouter>
<div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
<Navbar />

<Routes>
<Route path="/" element={<Home />} />
<Route path="/proveedores" element={<Proveedores />} />
<Route path="/proveedor/:id" element={<ProveedorPerfil />} />
<Route path="/requerimientos" element={<Requerimientos />} />
<Route path="/cotizaciones" element={<Cotizaciones />} />
<Route path="/comparador-cotizaciones" element={<ComparadorCotizaciones />} />
<Route path="/oportunidades" element={<Oportunidades />} />
<Route path="/panel-proveedor" element={<PanelProveedor />} />
<Route path="/panel-comprador" element={<PanelComprador />} />
<Route path="/acceso-proveedor" element={<AccesoProveedor />} />
<Route path="/recuperar-password" element={<RecuperarPassword />} />
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