import { useEffect, useState } from "react";
import { sectores } from "../data/categorias";
import { paises } from "../data/paises";
import { provinciasEcuador } from "../data/provinciasEcuador";
import { ciudadesEcuador } from "../data/ciudadesEcuador";
import { supabase } from "../lib/supabase";

function Requerimientos() {
  const [nombreRequerimiento, setNombreRequerimiento] = useState("");
  const [cobertura, setCobertura] = useState("");
  const [pais, setPais] = useState("");
  const [provincia, setProvincia] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [sector, setSector] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [requerimientos, setRequerimientos] = useState([]);

  const categoriasDisponibles = sector ? sectores[sector] || [] : [];
  const ciudadesDisponibles = provincia ? ciudadesEcuador[provincia] || [] : [];

  useEffect(() => {
    cargarRequerimientos();
  }, []);

  const cargarRequerimientos = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("requerimientos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando requerimientos:", error);
      setCargando(false);
      return;
    }

    setRequerimientos(data || []);
    setCargando(false);
  };

  const registrarRequerimiento = async () => {
    if (!nombreRequerimiento || !sector || !categoria) {
      alert("Completa los campos obligatorios");
      return;
    }

    try {
      setGuardando(true);

      const { error } = await supabase.from("requerimientos").insert([
        {
          nombre_requerimiento: nombreRequerimiento,
          cobertura,
          pais,
          provincia,
          ciudad,
          sector,
          categoria,
          descripcion
        }
      ]);

      if (error) {
        console.error(error);
        alert("Error al guardar el requerimiento");
        return;
      }

      alert("Requerimiento publicado correctamente");

      setNombreRequerimiento("");
      setCobertura("");
      setPais("");
      setProvincia("");
      setCiudad("");
      setSector("");
      setCategoria("");
      setDescripcion("");

      cargarRequerimientos();
    } catch (err) {
      console.error(err);
      alert("Error inesperado");
    } finally {
      setGuardando(false);
    }
  };

  const solicitarCotizacion = async (requerimiento) => {
    try {
      const { error } = await supabase.from("cotizaciones").insert([
        {
          requerimiento_id: requerimiento.id,
          requerimiento_nombre: requerimiento.nombre_requerimiento,
          proveedor_nombre: "Pendiente de asignar",
          contacto: "",
          email: "",
          telefono: "",
          mensaje: "Solicitud inicial generada desde el requerimiento",
          valor_referencial: "",
          estado: "Enviada"
        }
      ]);

      if (error) {
        console.error(error);
        alert("Error al crear la cotización");
        return;
      }

      alert("Cotización creada correctamente");
    } catch (err) {
      console.error(err);
      alert("Error inesperado al crear la cotización");
    }
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
          border: "1px solid #ccc"
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
          onChange={(e) => setCobertura(e.target.value)}
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
          onChange={(e) => setPais(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ccc"
          }}
        >
          <option value="">País</option>
          {paises.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={provincia}
          onChange={(e) => setProvincia(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ccc"
          }}
        >
          <option value="">Provincia</option>
          {provinciasEcuador.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ccc"
          }}
        >
          <option value="">Ciudad</option>
          {ciudadesDisponibles.map((c) => (
            <option key={c} value={c}>
              {c}
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
          {Object.keys(sectores).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ccc"
          }}
        >
          <option value="">Categoría</option>
          {categoriasDisponibles.map((c) => (
            <option key={c} value={c}>
              {c}
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
          border: "1px solid #ccc"
        }}
      />

      <button
        onClick={registrarRequerimiento}
        disabled={guardando}
        style={{
          backgroundColor: "#1f3552",
          color: "white",
          border: "none",
          padding: "12px 18px",
          borderRadius: "10px",
          cursor: "pointer"
        }}
      >
        {guardando ? "Guardando..." : "Publicar requerimiento"}
      </button>

      <div style={{ marginTop: "30px" }}>
        <h3>Requerimientos publicados</h3>

        {cargando ? (
          <p>Cargando requerimientos...</p>
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
              <h4 style={{ margin: "0 0 8px 0" }}>{r.nombre_requerimiento}</h4>

              <p><strong>Estado:</strong> {r.estado}</p>
              {r.cobertura ? <p><strong>Cobertura:</strong> {r.cobertura}</p> : null}
              {r.pais ? <p><strong>País:</strong> {r.pais}</p> : null}
              {r.provincia ? <p><strong>Provincia:</strong> {r.provincia}</p> : null}
              {r.ciudad ? <p><strong>Ciudad:</strong> {r.ciudad}</p> : null}
              <p><strong>Sector:</strong> {r.sector}</p>
              <p><strong>Categoría:</strong> {r.categoria}</p>
              {r.descripcion ? <p><strong>Descripción:</strong> {r.descripcion}</p> : null}

              <button
                onClick={() => solicitarCotizacion(r)}
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
                Solicitar cotización
              </button>
            </div>
          ))
        ) : (
          <p>No hay requerimientos publicados todavía.</p>
        )}
      </div>
    </div>
  );
}

export default Requerimientos;