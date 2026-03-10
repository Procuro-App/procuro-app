import { useState } from "react";
import { sectores } from "../data/categorias";
import { paises } from "../data/paises";
import { provinciasEcuador } from "../data/provinciasEcuador";
import { ciudadesEcuador } from "../data/ciudadesEcuador";

function RegistroProveedor() {
  const [nombre, setNombre] = useState("");
  const [cobertura, setCobertura] = useState("");
  const [pais, setPais] = useState("");
  const [provincia, setProvincia] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [sector, setSector] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [contacto, setContacto] = useState("");
  const [cargo, setCargo] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [telefonoSecundario, setTelefonoSecundario] = useState("");
  const [brochure, setBrochure] = useState("");
  const [presentacion, setPresentacion] = useState("");
  const [certificaciones, setCertificaciones] = useState("");
  const [catalogo, setCatalogo] = useState("");

  const categoriasDisponibles = sector ? sectores[sector] || [] : [];
  const ciudadesDisponibles = provincia ? ciudadesEcuador[provincia] || [] : [];

  const registrarProveedor = () => {
    if (!nombre || !cobertura || !pais || !sector || !categoria || !contacto || !email || !telefono) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    if (pais === "Ecuador" && !provincia) {
      alert("Por favor selecciona una provincia");
      return;
    }

    if (pais === "Ecuador" && !ciudad) {
      alert("Por favor selecciona una ciudad");
      return;
    }

    const nuevoProveedor = {
      id: `REG_${Date.now()}`,
      nombre,
      cobertura,
      pais,
      provincia,
      ciudad,
      sector,
      categoria,
      descripcion,
      contacto,
      cargo,
      email,
      telefono,
      telefonoSecundario,
      brochure,
      presentacion,
      certificaciones,
      catalogo,
      plan: "Gratis",
      verificado: false,
      patrocinado: false,
      estado: "Pendiente",
      fechaRegistro: new Date().toLocaleString()
    };

    const registrosGuardados =
      JSON.parse(localStorage.getItem("proveedoresPendientes")) || [];

    registrosGuardados.push(nuevoProveedor);

    localStorage.setItem(
      "proveedoresPendientes",
      JSON.stringify(registrosGuardados)
    );

    alert("Proveedor enviado a revisión correctamente");

    setNombre("");
    setCobertura("");
    setPais("");
    setProvincia("");
    setCiudad("");
    setSector("");
    setCategoria("");
    setDescripcion("");
    setContacto("");
    setCargo("");
    setEmail("");
    setTelefono("");
    setTelefonoSecundario("");
    setBrochure("");
    setPresentacion("");
    setCertificaciones("");
    setCatalogo("");
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
      }}
    >
      <h2>Registro de proveedor</h2>

      <input
        type="text"
        placeholder="Nombre comercial"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "12px",
          borderRadius: "10px",
          border: "1px solid #ccc",
          boxSizing: "border-box"
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px",
          marginBottom: "12px"
        }}
      >
        <select
          value={cobertura}
          onChange={(e) => {
            setCobertura(e.target.value);
            setPais("");
            setProvincia("");
            setCiudad("");
          }}
          style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
        >
          <option value="">Cobertura</option>
          <option value="Nacional">Nacional</option>
          <option value="Internacional">Internacional</option>
        </select>

        <select
          value={pais}
          onChange={(e) => {
            setPais(e.target.value);
            if (e.target.value !== "Ecuador") {
              setProvincia("");
              setCiudad("");
            }
          }}
          style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
        >
          <option value="">País</option>
          {paises.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={provincia}
          onChange={(e) => {
            setProvincia(e.target.value);
            setCiudad("");
          }}
          disabled={pais !== "Ecuador"}
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            backgroundColor: pais === "Ecuador" ? "white" : "#f3f3f3"
          }}
        >
          <option value="">Provincia</option>
          {provinciasEcuador.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          disabled={!provincia}
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            backgroundColor: provincia ? "white" : "#f3f3f3"
          }}
        >
          <option value="">Ciudad</option>
          {ciudadesDisponibles.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={sector}
          onChange={(e) => {
            setSector(e.target.value);
            setCategoria("");
          }}
          style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
        >
          <option value="">Sector</option>
          {Object.keys(sectores).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          disabled={!sector}
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            backgroundColor: sector ? "white" : "#f3f3f3"
          }}
        >
          <option value="">Categoría</option>
          {categoriasDisponibles.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <textarea
        placeholder="Descripción de la empresa"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        style={{
          width: "100%",
          minHeight: "100px",
          padding: "12px",
          marginBottom: "12px",
          borderRadius: "10px",
          border: "1px solid #ccc",
          boxSizing: "border-box"
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px",
          marginBottom: "12px"
        }}
      >
        <input
          type="text"
          placeholder="Nombre de contacto"
          value={contacto}
          onChange={(e) => setContacto(e.target.value)}
          style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
        />

        <input
          type="text"
          placeholder="Cargo"
          value={cargo}
          onChange={(e) => setCargo(e.target.value)}
          style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
        />

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
        />

        <input
          type="text"
          placeholder="Teléfono principal"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
        />

        <input
          type="text"
          placeholder="Teléfono secundario (opcional)"
          value={telefonoSecundario}
          onChange={(e) => setTelefonoSecundario(e.target.value)}
          style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
        />
      </div>

      <p style={{ color: "#6c757d", fontSize: "14px", marginBottom: "16px" }}>
        Nota: El teléfono principal debe corresponder a un número institucional o corporativo que permanezca activo en el tiempo. Evite registrar números personales que puedan cambiar por rotación de personal.
      </p>

      <h3 style={{ marginTop: "20px" }}>Documentos opcionales</h3>
      <p style={{ color: "#6c757d", fontSize: "14px", marginBottom: "12px" }}>
        Puedes compartir enlaces o nombres de documentos disponibles de tu empresa. Ninguno es obligatorio.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px",
          marginBottom: "16px"
        }}
      >
        <input
          type="text"
          placeholder="Brochure (opcional)"
          value={brochure}
          onChange={(e) => setBrochure(e.target.value)}
          style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
        />

        <input
          type="text"
          placeholder="Presentación (opcional)"
          value={presentacion}
          onChange={(e) => setPresentacion(e.target.value)}
          style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
        />

        <input
          type="text"
          placeholder="Certificaciones (opcional)"
          value={certificaciones}
          onChange={(e) => setCertificaciones(e.target.value)}
          style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
        />

        <input
          type="text"
          placeholder="Catálogo (opcional)"
          value={catalogo}
          onChange={(e) => setCatalogo(e.target.value)}
          style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
        />
      </div>

      <button
        onClick={registrarProveedor}
        style={{
          backgroundColor: "#1f3552",
          color: "white",
          border: "none",
          padding: "12px 18px",
          borderRadius: "10px",
          cursor: "pointer"
        }}
      >
        Enviar a revisión
      </button>
    </div>
  );
}

export default RegistroProveedor;