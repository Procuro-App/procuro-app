import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { proveedores } from "../data/proveedoresData";
import { sectores } from "../data/categorias";
import { paises } from "../data/paises";
import { provinciasEcuador } from "../data/provinciasEcuador";
import { ciudadesEcuador } from "../data/ciudadesEcuador";

function Requerimientos() {
  const navigate = useNavigate();

  const [nombreRequerimiento, setNombreRequerimiento] = useState("");
  const [cobertura, setCobertura] = useState("");
  const [pais, setPais] = useState("");
  const [provincia, setProvincia] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [sector, setSector] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [requerimientoPublicado, setRequerimientoPublicado] = useState(null);

  const categoriasDisponibles = sector ? sectores[sector] || [] : [];
  const ciudadesDisponibles = provincia ? ciudadesEcuador[provincia] || [] : [];

  const publicarRequerimiento = () => {
    if (
      !nombreRequerimiento ||
      !cobertura ||
      !pais ||
      !sector ||
      !categoria
    ) {
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

    setRequerimientoPublicado({
      nombreRequerimiento,
      cobertura,
      pais,
      provincia,
      ciudad,
      sector,
      categoria,
      descripcion
    });
  };

  const solicitarCotizacion = (proveedor) => {
    if (!requerimientoPublicado) return;

    const nuevaSolicitud = {
      proveedorId: proveedor.id,
      proveedorNombre: proveedor.nombre,
      contacto: proveedor.contacto,
      email: proveedor.email,
      telefono: proveedor.telefono,
      requerimientoNombre: requerimientoPublicado.nombreRequerimiento,
      sector: requerimientoPublicado.sector,
      categoria: requerimientoPublicado.categoria,
      pais: requerimientoPublicado.pais,
      provincia: requerimientoPublicado.provincia,
      ciudad: requerimientoPublicado.ciudad,
      fecha: new Date().toLocaleString()
    };

    const solicitudesGuardadas =
      JSON.parse(localStorage.getItem("solicitudesCotizacion")) || [];

    solicitudesGuardadas.push(nuevaSolicitud);

    localStorage.setItem(
      "solicitudesCotizacion",
      JSON.stringify(solicitudesGuardadas)
    );

    alert(`Solicitud enviada a ${proveedor.nombre}`);
    navigate("/cotizaciones");
  };

  const proveedoresSugeridos = requerimientoPublicado
    ? proveedores.filter((p) => {
        const coincideCobertura = p.cobertura === requerimientoPublicado.cobertura;

        const coincidePais =
          (p.pais || "").toLowerCase() ===
          (requerimientoPublicado.pais || "").toLowerCase();

        const coincideProvincia =
          requerimientoPublicado.pais === "Ecuador"
            ? (p.provincia || "").toLowerCase() ===
              (requerimientoPublicado.provincia || "").toLowerCase()
            : true;

        const coincideCiudad =
          requerimientoPublicado.pais === "Ecuador"
            ? (p.ciudad || "").toLowerCase() ===
              (requerimientoPublicado.ciudad || "").toLowerCase()
            : true;

        const coincideSector =
          (p.sector || "").toLowerCase() ===
          (requerimientoPublicado.sector || "").toLowerCase();

        const coincideCategoria =
          (p.categoria || "").toLowerCase() ===
          (requerimientoPublicado.categoria || "").toLowerCase();

        return (
          coincideCobertura &&
          coincidePais &&
          coincideProvincia &&
          coincideCiudad &&
          coincideSector &&
          coincideCategoria
        );
      })
    : [];

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
      }}
    >
      <h2>Publicar requerimiento</h2>

      <input
        type="text"
        placeholder="Nombre del requerimiento"
        value={nombreRequerimiento}
        onChange={(e) => setNombreRequerimiento(e.target.value)}
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
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ccc"
          }}
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
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ccc"
          }}
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
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ccc"
          }}
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
        placeholder="Descripción del requerimiento"
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

      <button
        onClick={publicarRequerimiento}
        style={{
          backgroundColor: "#1f3552",
          color: "white",
          border: "none",
          padding: "12px 18px",
          borderRadius: "10px",
          cursor: "pointer"
        }}
      >
        Publicar requerimiento
      </button>

      {requerimientoPublicado && (
        <div
          style={{
            marginTop: "24px",
            border: "1px solid #dcdcdc",
            borderRadius: "12px",
            padding: "16px"
          }}
        >
          <h3>Requerimiento publicado</h3>
          <p><strong>Nombre:</strong> {requerimientoPublicado.nombreRequerimiento}</p>
          <p><strong>Cobertura:</strong> {requerimientoPublicado.cobertura}</p>
          <p><strong>País:</strong> {requerimientoPublicado.pais}</p>
          {requerimientoPublicado.provincia ? (
            <p><strong>Provincia:</strong> {requerimientoPublicado.provincia}</p>
          ) : null}
          {requerimientoPublicado.ciudad ? (
            <p><strong>Ciudad:</strong> {requerimientoPublicado.ciudad}</p>
          ) : null}
          <p><strong>Sector:</strong> {requerimientoPublicado.sector}</p>
          <p><strong>Categoría:</strong> {requerimientoPublicado.categoria}</p>
          <p><strong>Descripción:</strong> {requerimientoPublicado.descripcion}</p>
        </div>
      )}

      {requerimientoPublicado && (
        <div style={{ marginTop: "30px" }}>
          <h3>Proveedores sugeridos</h3>

          {proveedoresSugeridos.length > 0 ? (
            proveedoresSugeridos.map((p) => (
              <div
                key={p.id}
                style={{
                  border: "1px solid #dcdcdc",
                  borderRadius: "10px",
                  padding: "15px",
                  marginBottom: "12px"
                }}
              >
                <h4 style={{ margin: "0 0 8px 0" }}>{p.nombre}</h4>
                <p><strong>Cobertura:</strong> {p.cobertura}</p>
                <p><strong>País:</strong> {p.pais}</p>
                {p.provincia ? <p><strong>Provincia:</strong> {p.provincia}</p> : null}
                <p><strong>Ciudad:</strong> {p.ciudad}</p>
                <p><strong>Sector:</strong> {p.sector}</p>
                <p><strong>Categoría:</strong> {p.categoria}</p>
                <p><strong>Contacto:</strong> {p.contacto}</p>
                <p><strong>Email:</strong> {p.email}</p>
                <p><strong>Teléfono:</strong> {p.telefono}</p>

                <button
                  onClick={() => solicitarCotizacion(p)}
                  style={{
                    marginTop: "10px",
                    backgroundColor: "#1f3552",
                    color: "white",
                    border: "none",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  Solicitar cotización
                </button>
              </div>
            ))
          ) : (
            <p>No se encontraron proveedores compatibles con ese requerimiento.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Requerimientos;