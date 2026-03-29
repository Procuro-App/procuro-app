import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Proveedores from "./pages/Proveedores";
import ProveedorPerfil from "./pages/ProveedorPerfil";
import Requerimientos from "./pages/Requerimientos";
import Cotizaciones from "./pages/Cotizaciones";
import ComparadorCotizaciones from "./pages/ComparadorCotizaciones";
import Oportunidades from "./pages/Oportunidades";
import AccesoProveedor from "./pages/AccesoProveedor";
import AccesoComprador from "./pages/AccesoComprador";
import RegistroProveedor from "./pages/RegistroProveedor";
import RevisionProveedores from "./pages/RevisionProveedores";
import AdminDashboard from "./pages/AdminDashboard";
import PanelProveedor from "./pages/PanelProveedor";
import PanelComprador from "./pages/PanelComprador";
import RecuperarPassword from "./pages/RecuperarPassword";
import RecuperarPasswordComprador from "./pages/RecuperarPasswordComprador";
import MiPerfilComprador from "./pages/MiPerfilComprador";
import EnviarCotizacion from "./pages/EnviarCotizacion";
import Chat from "./pages/Chat";

import { useEffect, useState } from "react";

function App() {
const [language, setLanguage] = useState(
localStorage.getItem("procuro_language") || "es"
);

useEffect(() => {
localStorage.setItem("procuro_language", language);
}, [language]);

return (

<BrowserRouter>
<div
style={{
minHeight: "100vh",
background:
"linear-gradient(135deg, #1e1e1e 0%, #2b2b2b 45%, #1f3552 100%)",
padding: "14px",
}}
>
<div
style={{
maxWidth: "1200px",
margin: "0 auto",
}}
>
<Navbar language={language} setLanguage={setLanguage} />

<Routes>
<Route path="/" element={<Home />} />
<Route path="/proveedores" element={<Proveedores />} />
<Route path="/proveedor/:id" element={<ProveedorPerfil />} />

<Route path="/requerimientos" element={<Requerimientos />} />
<Route path="/cotizaciones" element={<Cotizaciones />} />
<Route
path="/comparador-cotizaciones"
element={<ComparadorCotizaciones />}
/>
<Route path="/enviar-cotizacion/:id" element={<EnviarCotizacion />} />
<Route path="/oportunidades" element={<Oportunidades />} />

<Route path="/acceso-proveedor" element={<AccesoProveedor />} />
<Route path="/acceso-comprador" element={<AccesoComprador />} />

<Route path="/registro-proveedor" element={<RegistroProveedor />} />
<Route
path="/revision-proveedores"
element={<RevisionProveedores />}
/>

<Route path="/admin" element={<AdminDashboard />} />
<Route path="/panel-proveedor" element={<PanelProveedor />} />
<Route path="/panel-comprador" element={<PanelComprador />} />

<Route
path="/mi-perfil-comprador"
element={<MiPerfilComprador />}
/>

<Route path="/recuperar-password" element={<RecuperarPassword />} />
<Route
path="/recuperar-password-comprador"
element={<RecuperarPasswordComprador />}
/>

<Route path="/chat" element={<Chat />} />
</Routes>
</div>
</div>
</BrowserRouter>
);
}

export default App;