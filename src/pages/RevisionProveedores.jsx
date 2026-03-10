import { useEffect, useState } from "react";

function RevisionProveedores() {
  const [proveedoresPendientes, setProveedoresPendientes] = useState([]);

  useEffect(() => {
    const dataGuardada = localStorage.getItem("proveedoresPendientes");
    if (dataGuardada) {
      setProveedoresPendientes(JSON.parse(dataGuardada));
    }
  }, []);

  const limpiarPendientes = () => {
    localStorage.removeItem("proveedoresPendientes");
    setProveedoresPendientes([]);
  };

  const aprobarProveedor = (proveedor) => {
    const proveedoresAprobados =
      JSON.parse(localStorage.getItem("proveedoresAprobados")) || [];

    const proveedorAprobado = {
      ...proveedor,
      verificado: true,
      estado: "Aprobado"
    };

    proveedoresAprobados.push(proveedorAprobado);

    localStorage.setItem(
      "proveedoresAprobados",
      JSON.stringify(proveedoresAprobados)
    );

    const pendientesActualizados = proveedoresPendientes.filter(
      (p) => p.id !== proveedor.id
    );

    localStorage.setItem(
      "proveedoresPendientes",
      JSON.stringify(pendientesActualizados)
    );

    setProveedoresPendientes(pendientesActualizados);
    alert(`Proveedor aprobado: ${proveedor.nombre}`);
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
      <h2>Revisión de proveedores</h2>

      {proveedoresPendientes.length > 0 ? (
        <>
          <p style={{ marginBottom: "20px", color: "#555" }}>
            Proveedores pendientes: <strong>{proveedoresPendientes.length}</strong>
          </p>

          {proveedoresPendientes.map((p) => (
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
              <p><strong>Estado:</strong> {p.estado}</p>
              <p><strong>Cobertura:</strong> {p.cobertura}</p>
              <p><strong>País:</strong> {p.pais}</p>
              {p.provincia ? <p><strong>Provincia:</strong> {p.provincia}</p> : null}
              {p.ciudad ? <p><strong>Ciudad:</strong> {p.ciudad}</p> : null}
              <p><strong>Sector:</strong> {p.sector}</p>
              <p><strong>Categoría:</strong> {p.categoria}</p>
              <p><strong>Descripción:</strong> {p.descripcion}</p>
              <p><strong>Contacto:</strong> {p.contacto}</p>
              <p><strong>Cargo:</strong> {p.cargo}</p>
              <p><strong>Correo electrónico:</strong> {p.email}</p>
              <p><strong>Teléfono principal:</strong> {p.telefono}</p>
              {p.telefonoSecundario ? (
                <p><strong>Teléfono secundario:</strong> {p.telefonoSecundario}</p>
              ) : null}
              {p.brochure ? <p><strong>Brochure:</strong> {p.brochure}</p> : null}
              {p.presentacion ? <p><strong>Presentación:</strong> {p.presentacion}</p> : null}
              {p.certificaciones ? <p><strong>Certificaciones:</strong> {p.certificaciones}</p> : null}
              {p.catalogo ? <p><strong>Catálogo:</strong> {p.catalogo}</p> : null}
              <p><strong>Fecha de registro:</strong> {p.fechaRegistro}</p>

              <button
                onClick={() => aprobarProveedor(p)}
                style={{
                  backgroundColor: "#1f3552",
                  color: "white",
                  border: "none",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginTop: "10px"
                }}
              >
                Aprobar proveedor
              </button>
            </div>
          ))}

          <button
            onClick={limpiarPendientes}
            style={{
              backgroundColor: "#8b1e1e",
              color: "white",
              border: "none",
              padding: "12px 18px",
              borderRadius: "10px",
              cursor: "pointer"
            }}
          >
            Limpiar bandeja
          </button>
        </>
      ) : (
        <p>No hay proveedores pendientes de revisión.</p>
      )}
    </div>
  );
}

export default RevisionProveedores;