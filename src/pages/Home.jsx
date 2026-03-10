function Home() {
  const cardStyle = {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
  };

  const metricStyle = {
    ...cardStyle,
    minHeight: "140px"
  };

  return (
    <div>
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
          marginBottom: "20px"
        }}
      >
        <h2 style={{ marginTop: 0 }}>Panel de control</h2>
        <p>Bienvenido a PROCURO, tu marketplace de compras y proveedores.</p>
        <p>
          Desde aquí podrás visualizar el estado general de la plataforma y navegar
          a los módulos principales.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "20px"
        }}
      >
        <div style={metricStyle}>
          <h3 style={{ marginTop: 0 }}>Proveedores</h3>
          <p style={{ fontSize: "36px", fontWeight: "bold", color: "#1f3552", margin: 0 }}>
            21
          </p>
          <p style={{ marginTop: "10px", color: "#555" }}>
            Base inicial registrada
          </p>
        </div>

        <div style={metricStyle}>
          <h3 style={{ marginTop: 0 }}>Requerimientos</h3>
          <p style={{ fontSize: "36px", fontWeight: "bold", color: "#1f3552", margin: 0 }}>
            1
          </p>
          <p style={{ marginTop: "10px", color: "#555" }}>
            Simulación activa del MVP
          </p>
        </div>

        <div style={metricStyle}>
          <h3 style={{ marginTop: 0 }}>Cotizaciones</h3>
          <p style={{ fontSize: "36px", fontWeight: "bold", color: "#1f3552", margin: 0 }}>
            1
          </p>
          <p style={{ marginTop: "10px", color: "#555" }}>
            Flujo básico probado
          </p>
        </div>

        <div style={metricStyle}>
          <h3 style={{ marginTop: 0 }}>Estado</h3>
          <p style={{ fontSize: "20px", fontWeight: "bold", color: "#1f3552", margin: 0 }}>
            MVP en construcción
          </p>
          <p style={{ marginTop: "10px", color: "#555" }}>
            Estructura lista para conectar datos reales
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "16px"
        }}
      >
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Siguiente objetivo</h3>
          <p>
            Conectar la base real de proveedores desde tu Google Sheet para dejar de
            usar datos simulados.
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Módulos actuales</h3>
          <p>✔ Inicio con dashboard</p>
          <p>✔ Proveedores</p>
          <p>✔ Requerimientos</p>
          <p>✔ Cotizaciones</p>
        </div>
      </div>
    </div>
  );
}

export default Home;