function Home() {
const cardStyle = {
backgroundColor: "white",
borderRadius: "16px",
padding: "20px",
boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
minHeight: "120px"
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
<h2>Panel de control</h2>
<p>
Bienvenido a PROCURO, tu marketplace de compras y proveedores.
</p>
<p>
Desde aquí podrás visualizar el estado general de la plataforma y navegar a los módulos principales.
</p>
</div>

<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
gap: "16px"
}}
>
<div style={cardStyle}>
<h3>Proveedores</h3>
<p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>21</p>
<p>Base inicial registrada</p>
</div>

<div style={cardStyle}>
<h3>Requerimientos</h3>
<p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>1</p>
<p>Simulación activa del MVP</p>
</div>

<div style={cardStyle}>
<h3>Cotizaciones</h3>
<p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>1</p>
<p>Flujo básico probado</p>
</div>

<div style={cardStyle}>
<h3>Estado</h3>
<p style={{ fontWeight: "bold", margin: "10px 0" }}>MVP en construcción</p>
<p>Estructura lista para conectar datos reales</p>
</div>
</div>
</div>
);
}

export default Home;