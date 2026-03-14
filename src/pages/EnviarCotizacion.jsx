import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function EnviarCotizacion() {
  const { id } = useParams();

  const [requerimiento, setRequerimiento] = useState(null);
  const [proveedorNombre, setProveedorNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [valorReferencial, setValorReferencial] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarRequerimiento();
  }, []);

  const cargarRequerimiento = async () => {
    const { data, error } = await supabase
      .from("requerimientos")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error cargando requerimiento:", error);
      return;
    }

    setRequerimiento(data);
  };

  const subirArchivo = async () => {
    if (!archivo) return "";

    const nombreArchivo = `${Date.now()}-${archivo.name}`;
    const ruta = `${id}/${nombreArchivo}`;

    const { error } = await supabase.storage
      .from("cotizaciones")
      .upload(ruta, archivo);

    if (error) {
      console.error("Error subiendo archivo:", error);
      throw error;
    }

    const { data } = supabase.storage
      .from("cotizaciones")
      .getPublicUrl(ruta);

    return data.publicUrl;
  };

  const enviarCotizacion = async () => {
    if (!proveedorNombre || !contacto || !email) {
      alert("Completa los campos obligatorios");
      return;
    }

    try {
      setGuardando(true);

      let archivoUrl = "";

      if (archivo) {
        archivoUrl = await subirArchivo();
      }

      const { error } = await supabase.from("cotizaciones").insert([
        {
          requerimiento_id: requerimiento.id,
          requerimiento_nombre: requerimiento.nombre_requerimiento,
          proveedor_nombre: proveedorNombre,
          contacto,
          email,
          telefono,
          mensaje,
          valor_referencial: valorReferencial,
          archivo_url: archivoUrl,
          estado: "Enviada"
        }
      ]);

      if (error) {
        console.error(error);
        alert("Error al guardar la cotización");
        return;
      }

      alert("Cotización enviada correctamente");

      setProveedorNombre("");
      setContacto("");
      setEmail("");
      setTelefono("");
      setMensaje("");
      setValorReferencial("");
      setArchivo(null);

    } catch (err) {
      console.error(err);
      alert("Error subiendo archivo");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
    }}>
      <h2>Enviar cotización</h2>

      {requerimiento && (
        <div style={{ marginBottom: "20px" }}>
          <h3>{requerimiento.nombre_requerimiento}</h3>
          <p><strong>Sector:</strong> {requerimiento.sector}</p>
          <p><strong>Categoría:</strong> {requerimiento.categoria}</p>
        </div>
      )}

      <input
        type="text"
        placeholder="Nombre del proveedor"
        value={proveedorNombre}
        onChange={(e) => setProveedorNombre(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      <input
        type="text"
        placeholder="Contacto"
        value={contacto}
        onChange={(e) => setContacto(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      <input
        type="text"
        placeholder="Teléfono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      <input
        type="text"
        placeholder="Valor referencial"
        value={valorReferencial}
        onChange={(e) => setValorReferencial(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      <textarea
        placeholder="Mensaje"
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      <input
        type="file"
        accept=".pdf,.xlsx,.docx"
        onChange={(e) => setArchivo(e.target.files[0])}
        style={{ marginBottom: "12px" }}
      />

      <button
        onClick={enviarCotizacion}
        disabled={guardando}
        style={{
          backgroundColor: "#1f3552",
          color: "white",
          border: "none",
          padding: "12px 18px",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        {guardando ? "Enviando..." : "Enviar cotización"}
      </button>
    </div>
  );
}

export default EnviarCotizacion;