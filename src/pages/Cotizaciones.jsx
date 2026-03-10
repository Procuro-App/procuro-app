import { useEffect, useState } from "react";

function Cotizaciones() {
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    const dataGuardada = localStorage.getItem("solicitudesCotizacion");
    if (dataGuardada) {
      setSolicitudes(JSON.parse(dataGuardada));
    }
  }, []);

  const limpiarSolicitudes = () => {
    localStorage.removeItem("solicitudesCotizacion");
    setSolicitudes([]);
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
      <h2>Solicitudes de cotización</h2>

      {solicitudes.length > 0 ? (
        <>
          <p style={{ marginBottom: "20px", color: "#555" }}>
            Total de solicitudes enviadas: <strong>{solicitudes.length}</strong>
          </p>

          {solicitudes.map((s, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #dcdcdc",
                borderRadius: "10px",
                padding: "15px",
                marginBottom: "12px"
              }}
            >
              <h4 style={{ margin: "0 0 8px 0" }}>{s.proveedorNombre}</h4>
              <p><strong>Requerimiento:</strong> {s.requerimientoNombre}</p>
              <p><strong>Sector:</strong> {s.sector}</p>
              <p><strong>Categoría:</strong> {s.categoria}</p>
              <p><strong>País:</strong> {s.pais}</p>
              {s.provincia ? <p><strong>Provincia:</strong> {s.provincia}</p> : null}
              {s.ciudad ? <p><strong>Ciudad:</strong> {s.ciudad}</p> : null}
              <p><strong>Contacto proveedor:</strong> {s.contacto}</p>
              <p><strong>Email proveedor:</strong> {s.email}</p>
              <p><strong>Teléfono proveedor:</strong> {s.telefono}</p>
              <p><strong>Fecha de solicitud:</strong> {s.fecha}</p>
            </div>
          ))}

          <button
            onClick={limpiarSolicitudes}
            style={{
              backgroundColor: "#8b1e1e",
              color: "white",
              border: "none",
              padding: "12px 18px",
              borderRadius: "10px",
              cursor: "pointer"
            }}
          >
            Limpiar solicitudes
          </button>
        </>
      ) : (
        <p>No hay solicitudes de cotización registradas todavía.</p>
      )}
    </div>
  );
}

export default Cotizaciones;