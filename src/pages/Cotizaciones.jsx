import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarCotizaciones();
  }, []);

  const cargarCotizaciones = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("cotizaciones")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando cotizaciones:", error);
      setCargando(false);
      return;
    }

    setCotizaciones(data || []);
    setCargando(false);
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
      <h2>Cotizaciones</h2>

      {cargando ? (
        <p>Cargando cotizaciones...</p>
      ) : cotizaciones.length > 0 ? (
        <>
          <p style={{ marginBottom: "20px", color: "#555" }}>
            Total de cotizaciones: <strong>{cotizaciones.length}</strong>
          </p>

          {cotizaciones.map((c) => (
            <div
              key={c.id}
              style={{
                border: "1px solid #dcdcdc",
                borderRadius: "10px",
                padding: "15px",
                marginBottom: "12px"
              }}
            >
              <h4 style={{ margin: "0 0 8px 0" }}>
                {c.requerimiento_nombre || "Sin requerimiento"}
              </h4>

              <p><strong>Estado:</strong> {c.estado}</p>
              {c.proveedor_nombre ? (
                <p><strong>Proveedor:</strong> {c.proveedor_nombre}</p>
              ) : null}
              {c.contacto ? <p><strong>Contacto:</strong> {c.contacto}</p> : null}
              {c.email ? <p><strong>Email:</strong> {c.email}</p> : null}
              {c.telefono ? <p><strong>Teléfono:</strong> {c.telefono}</p> : null}
              {c.valor_referencial ? (
                <p><strong>Valor referencial:</strong> {c.valor_referencial}</p>
              ) : null}
              {c.mensaje ? <p><strong>Mensaje:</strong> {c.mensaje}</p> : null}

              {c.archivo_url ? (
                <div style={{ marginTop: "10px" }}>
                  <a
                    href={c.archivo_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-block",
                      backgroundColor: "#1f3552",
                      color: "white",
                      textDecoration: "none",
                      padding: "10px 14px",
                      borderRadius: "8px"
                    }}
                  >
                    Ver archivo adjunto
                  </a>
                </div>
              ) : (
                <p style={{ color: "#777" }}>
                  <strong>Archivo:</strong> No adjunto
                </p>
              )}
            </div>
          ))}
        </>
      ) : (
        <p>No hay cotizaciones registradas todavía.</p>
      )}
    </div>
  );
}

export default Cotizaciones;