export function App() {
  return (
    <div
      style={{
        padding: '20px',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <h1 style={{ margin: '0 0 20px 0', color: '#333' }}>Zone de Travail</h1>
        <p style={{ color: '#666', marginBottom: '40px' }}>
          Voici votre espace vide pour commencer à développer étape par étape.
        </p>

        <div
          style={{
            border: '2px dashed #ddd',
            borderRadius: '8px',
            padding: '60px 20px',
            textAlign: 'center',
            backgroundColor: '#fafafa',
          }}
        >
          <p style={{ color: '#999', fontSize: '18px', margin: 0 }}>
            Votre contenu ici...
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
