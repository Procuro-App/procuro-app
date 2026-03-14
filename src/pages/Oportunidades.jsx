import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Oportunidades() {
  const [requerimientos, setRequerimientos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarOportunidades();
  }, []);

  const cargarOportunidades = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("requerimientos")
      .select("*")
      .eq("estado", "Abierto")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando oportunidades:", error);
      setCargando(false);
      return;
    }

    setRequerimientos(data || []);
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
      <h2>Oportunidades para proveedores</h2>

      {cargando ? (
        <p>Cargando oportunidades...</p>
      ) : requerimientos.length > 0 ? (
        requerimientos.map((r) => (
          <div
            key={r.id}
            style={{
              border: "1px solid #dcdcdc",
              borderRadius: "10px",
              padding: "15px",
              marginBottom: "12px"
            }}
          >
            <h4 style={{ margin: "0 0 8px 0" }}>
              {r.nombre_requerimiento}
            </h4>

            <p><strong>Sector:</strong> {r.sector}</p>
            <p><strong>Categoría:</strong> {r.categoria}</p>
            {r.cobertura ? <p><strong>Cobertura:</strong> {r.cobertura}</p> : null}
            {r.pais ? <p><strong>País:</strong> {r.pais}</p> : null}
            {r.provincia ? <p><strong>Provincia:</strong> {r.provincia}</p> : null}
            {r.ciudad ? <p><strong>Ciudad:</strong> {r.ciudad}</p> : null}
            {r.descripcion ? <p><strong>Descripción:</strong> {r.descripcion}</p> : null}

            <Link
              to={`/enviar-cotizacion/${r.id}`}
              style={{
                display: "inline-block",
                backgroundColor: "#1f3552",
                color: "white",
                textDecoration: "none",
                padding: "10px 14px",
                borderRadius: "8px",
                marginTop: "10px"
              }}
            >
              Enviar cotización
            </Link>
          </div>
        ))
      ) : (
        <p>No hay oportunidades disponibles.</p>
      )}
    </div>
  );
}

export default Oportunidades;