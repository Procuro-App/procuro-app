import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function RevisionProveedores() {
  const [proveedoresPendientes, setProveedoresPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPendientes();
  }, []);

  const cargarPendientes = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("proveedores")
      .select("*")
      .eq("estado", "Pendiente")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando proveedores pendientes:", error);
      setCargando(false);
      return;
    }

    setProveedoresPendientes(data || []);
    setCargando(false);
  };

  const aprobarProveedor = async (proveedorId) => {
    const { error } = await supabase
      .from("proveedores")
      .update({
        estado: "Aprobado",
        verificado: true
      })
      .eq("id", proveedorId);

    if (error) {
      console.error("Error aprobando proveedor:", error);
      alert("Hubo un problema al aprobar el proveedor");
      return;
    }

    alert("Proveedor aprobado correctamente");
    cargarPendientes();
  };

  const limpiarPendientes = async () => {
    const ids = proveedoresPendientes.map((p) => p.id);

    if (ids.length === 0) return;

    const { error } = await supabase
      .from("proveedores")
      .delete()
      .in("id", ids);

    if (error) {
      console.error("Error limpiando pendientes:", error);
      alert("Hubo un problema al limpiar la bandeja");
      return;
    }

    alert("Bandeja limpiada");
    cargarPendientes();
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

      {cargando ? (
        <p>Cargando proveedores pendientes...</p>
      ) : proveedoresPendientes.length > 0 ? (
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
              {p.telefono_secundario ? (
                <p><strong>Teléfono secundario:</strong> {p.telefono_secundario}</p>
              ) : null}
              {p.brochure ? <p><strong>Brochure:</strong> {p.brochure}</p> : null}
              {p.presentacion ? <p><strong>Presentación:</strong> {p.presentacion}</p> : null}
              {p.certificaciones ? <p><strong>Certificaciones:</strong> {p.certificaciones}</p> : null}
              {p.catalogo ? <p><strong>Catálogo:</strong> {p.catalogo}</p> : null}
              <p><strong>Fecha de registro:</strong> {p.fecha_registro}</p>

              <button
                onClick={() => aprobarProveedor(p.id)}
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