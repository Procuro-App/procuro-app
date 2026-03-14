import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase";

function SolicitarProveedor() {
  const location = useLocation();
  const navigate = useNavigate();
  const proveedor = location.state?.proveedor;

  const [nombreRequerimiento, setNombreRequerimiento] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [valorReferencial, setValorReferencial] = useState("");
  const [guardando, setGuardando] = useState(false);

  const enviarSolicitud = async () => {
    if (!proveedor) {
      alert("No se encontró el proveedor seleccionado");
      return;
    }

    if (!nombreRequerimiento) {
      alert("Ingresa el nombre del requerimiento");
      return;
    }

    try {
      setGuardando(true);

      const { error } = await supabase
        .from("cotizaciones")
        .insert([
          {
            proveedor_nombre: proveedor.nombre,
            contacto: proveedor.contacto || "",
            email: proveedor.email || "",
            telefono: proveedor.telefono || "",
            requerimiento_nombre: nombreRequerimiento,
            mensaje: mensaje || "Solicitud dirigida desde el directorio de proveedores",
            valor_referencial: valorReferencial || "",
            estado: "Solicitada"
          }
        ]);

      if (error) {
        console.error(error);
        alert("Hubo un problema al enviar la solicitud");
        return;
      }

      alert("Solicitud enviada al proveedor correctamente");
      navigate("/cotizaciones");
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error inesperado");
    } finally {
      setGuardando(false);
    }
  };

  if (!proveedor) {
    return (
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
        }}
      >
        <h2>Solicitud dirigida</h2>
        <p>No se encontró el proveedor seleccionado.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
      }}
    >
      <h2>Solicitar cotización dirigida</h2>

      <div
        style={{
          border: "1px solid #dcdcdc",
          borderRadius: "10px",
          padding: "15px",
          marginBottom: "20px"
        }}
      >
        <h3 style={{ marginTop: 0 }}>{proveedor.nombre}</h3>
        <p><strong>Sector:</strong> {proveedor.sector}</p>
        <p><strong>Categoría:</strong> {proveedor.categoria}</p>
        {proveedor.pais ? <p><strong>País:</strong> {proveedor.pais}</p> : null}
        {proveedor.provincia ? <p><strong>Provincia:</strong> {proveedor.provincia}</p> : null}
        {proveedor.ciudad ? <p><strong>Ciudad:</strong> {proveedor.ciudad}</p> : null}
        {proveedor.contacto ? <p><strong>Contacto:</strong> {proveedor.contacto}</p> : null}
        {proveedor.email ? <p><strong>Email:</strong> {proveedor.email}</p> : null}
        {proveedor.telefono ? <p><strong>Teléfono:</strong> {proveedor.telefono}</p> : null}
      </div>

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

      <input
        type="text"
        placeholder="Valor referencial (opcional)"
        value={valorReferencial}
        onChange={(e) => setValorReferencial(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "12px",
          borderRadius: "10px",
          border: "1px solid #ccc"
        }}
      />

      <textarea
        placeholder="Mensaje para el proveedor"
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        style={{
          width: "100%",
          minHeight: "120px",
          padding: "12px",
          marginBottom: "12px",
          borderRadius: "10px",
          border: "1px solid #ccc"
        }}
      />

      <button
        onClick={enviarSolicitud}
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
        {guardando ? "Enviando..." : "Enviar solicitud"}
      </button>
    </div>
  );
}

export default SolicitarProveedor;