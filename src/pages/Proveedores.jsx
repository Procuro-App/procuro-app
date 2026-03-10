import { useEffect, useMemo, useState } from "react";
import { proveedores as proveedoresBase } from "../data/proveedoresData";
import { sectores } from "../data/categorias";
import { paises } from "../data/paises";
import { provinciasEcuador } from "../data/provinciasEcuador";
import { ciudadesEcuador } from "../data/ciudadesEcuador";

function Proveedores() {
  const [cobertura, setCobertura] = useState("");
  const [pais, setPais] = useState("");
  const [provincia, setProvincia] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [sector, setSector] = useState("");
  const [categoria, setCategoria] = useState("");
  const [proveedoresAprobados, setProveedoresAprobados] = useState([]);

  useEffect(() => {
    const aprobadosGuardados =
      JSON.parse(localStorage.getItem("proveedoresAprobados")) || [];
    setProveedoresAprobados(aprobadosGuardados);
  }, []);

  const todosLosProveedores = useMemo(() => {
    return [...proveedoresBase, ...proveedoresAprobados];
  }, [proveedoresAprobados]);

  const categoriasDisponibles = sector ? sectores[sector] || [] : [];
  const ciudadesDisponibles = provincia ? ciudadesEcuador[provincia] || [] : [];

  const proveedoresFiltrados = todosLosProveedores
    .filter((p) => {
      const coincideCobertura = cobertura ? p.cobertura === cobertura : true;

      const coincidePais = pais
        ? (p.pais || "").toLowerCase() === pais.toLowerCase()
        : true;

      const coincideProvincia = provincia
        ? (p.provincia || "").toLowerCase() === provincia.toLowerCase()
        : true;

      const coincideCiudad = ciudad
        ? (p.ciudad || "").toLowerCase() === ciudad.toLowerCase()
        : true;

      const coincideSector = sector
        ? (p.sector || "").toLowerCase() === sector.toLowerCase()
        : true;

      const coincideCategoria = categoria
        ? (p.categoria || "").toLowerCase() === categoria.toLowerCase()
        : true;

      return (
        coincideCobertura &&
        coincidePais &&
        coincideProvincia &&
        coincideCiudad &&
        coincideSector &&
        coincideCategoria
      );
    })
    .sort((a, b) => {
      if (a.patrocinado === b.patrocinado) return 0;
      return a.patrocinado ? -1 : 1;
    });

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
      }}
    >
      <h2>Proveedores</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px",
          marginBottom: "20px"
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

      <p style={{ marginBottom: "20px", color: "#555" }}>
        Resultados encontrados: <strong>{proveedoresFiltrados.length}</strong>
      </p>

      {proveedoresFiltrados.length > 0 ? (
        proveedoresFiltrados.map((p) => (
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

            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "10px",
                flexWrap: "wrap"
              }}
            >
              {p.patrocinado && (
                <span
                  style={{
                    backgroundColor: "#fff3cd",
                    color: "#856404",
                    padding: "4px 8px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                >
                  Patrocinado
                </span>
              )}

              {p.verificado && (
                <span
                  style={{
                    backgroundColor: "#d1ecf1",
                    color: "#0c5460",
                    padding: "4px 8px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                >
                  Verificado
                </span>
              )}

              {p.plan && (
                <span
                  style={{
                    backgroundColor: "#e2e3e5",
                    color: "#383d41",
                    padding: "4px 8px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                >
                  {p.plan}
                </span>
              )}

              {String(p.id).startsWith("REG_") && (
                <span
                  style={{
                    backgroundColor: "#d4edda",
                    color: "#155724",
                    padding: "4px 8px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                >
                  Nuevo aprobado
                </span>
              )}
            </div>

            <p><strong>Cobertura:</strong> {p.cobertura}</p>
            <p><strong>País:</strong> {p.pais}</p>
            {p.provincia ? <p><strong>Provincia:</strong> {p.provincia}</p> : null}
            <p><strong>Ciudad:</strong> {p.ciudad}</p>
            <p><strong>Sector:</strong> {p.sector}</p>
            <p><strong>Categoría:</strong> {p.categoria}</p>
            <p><strong>Contacto:</strong> {p.contacto}</p>
            <p><strong>Cargo:</strong> {p.cargo}</p>
            <p><strong>Correo electrónico:</strong> {p.email}</p>
            <p><strong>Teléfono principal:</strong> {p.telefono}</p>
            {p.telefonoSecundario ? (
              <p><strong>Teléfono secundario:</strong> {p.telefonoSecundario}</p>
            ) : null}
            <p><strong>Descripción:</strong> {p.descripcion}</p>

            {(p.brochure || p.presentacion || p.certificaciones || p.catalogo) && (
              <div style={{ marginTop: "12px" }}>
                <p style={{ fontWeight: "bold", marginBottom: "8px" }}>
                  Documentos disponibles
                </p>
                {p.brochure ? <p><strong>Brochure:</strong> {p.brochure}</p> : null}
                {p.presentacion ? <p><strong>Presentación:</strong> {p.presentacion}</p> : null}
                {p.certificaciones ? <p><strong>Certificaciones:</strong> {p.certificaciones}</p> : null}
                {p.catalogo ? <p><strong>Catálogo:</strong> {p.catalogo}</p> : null}
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No se encontraron proveedores con esos filtros.</p>
      )}
    </div>
  );
}

export default Proveedores;