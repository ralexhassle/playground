import { Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './app.module.css';
import type { PingResponse, ApiInfo, User } from '@/types';

function App() {
  const [backendStatus, setBackendStatus] = useState<
    'loading' | 'online' | 'offline'
  >('loading');
  const [apiInfo, setApiInfo] = useState<ApiInfo | null>(null);

  useEffect(() => {
    // Test de connexion au backend
    const checkBackendStatus = async () => {
      try {
        const response = await fetch('http://localhost:3000/ping');
        if (response.ok) {
          const data: PingResponse = await response.json();
          setBackendStatus('online');
          console.log('Backend response:', data);
        } else {
          setBackendStatus('offline');
        }
      } catch (error) {
        setBackendStatus('offline');
        console.error('Backend connection failed:', error);
      }
    };

    // Récupération des informations API
    const fetchApiInfo = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/info');
        if (response.ok) {
          const data: ApiInfo = await response.json();
          setApiInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch API info:', error);
      }
    };

    checkBackendStatus();
    fetchApiInfo();
  }, []);

  return (
    <div className={styles.app}>
      <header className={styles['app-header']}>
        <h1>🚀 Monorepo Fullstack</h1>
        <nav>
          <Link to="/" className={styles['nav-link']}>
            Accueil
          </Link>
          <Link to="/users" className={styles['nav-link']}>
            Utilisateurs
          </Link>
        </nav>
        <div className={styles.status}>
          Status Backend:
          <span
            className={
              backendStatus === 'online'
                ? styles['status-ok']
                : styles['status-error']
            }
          >
            {backendStatus === 'loading'
              ? '⏳ Chargement...'
              : backendStatus === 'online'
              ? '✅ En ligne'
              : '❌ Hors ligne'}
          </span>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage apiInfo={apiInfo} />} />
          <Route path="/users" element={<UsersPage />} />
        </Routes>
      </main>
    </div>
  );
}

function HomePage({ apiInfo }: { apiInfo: ApiInfo | null }) {
  return (
    <div>
      <h2>🎉 Bienvenue dans votre monorepo Nx !</h2>
      <p>
        Cette application démontre une architecture fullstack moderne avec :
      </p>
      <ul>
        <li>
          ⚡ <strong>Frontend React</strong> avec Vite et TypeScript
        </li>
        <li>
          🚀 <strong>Backend Fastify</strong> avec hot reload (tsx)
        </li>
        <li>
          🗄️ <strong>Base PostgreSQL</strong> dockerisée
        </li>
        <li>
          🔗 <strong>Drizzle ORM</strong> pour la gestion des données
        </li>
        <li>
          📦 <strong>Types partagés</strong> entre frontend et backend
        </li>
        <li>
          🛠️ <strong>Outils de développement</strong> (ESLint, Prettier)
        </li>
      </ul>

      {apiInfo && (
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
          }}
        >
          <h3>📋 API Information</h3>
          <p>
            <strong>Nom:</strong> {apiInfo.name}
          </p>
          <p>
            <strong>Version:</strong> {apiInfo.version}
          </p>
          <p>
            <strong>Description:</strong> {apiInfo.description}
          </p>

          <h4>Endpoints disponibles :</h4>
          <ul>
            {apiInfo.endpoints.map((endpoint, index) => (
              <li key={index}>
                <code>
                  {endpoint.method} {endpoint.path}
                </code>{' '}
                - {endpoint.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          setError('Erreur lors du chargement des utilisateurs');
        }
      } catch {
        setError('Impossible de se connecter au backend');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>⏳ Chargement des utilisateurs...</div>;
  if (error) return <div style={{ color: '#f87171' }}>❌ {error}</div>;

  return (
    <div>
      <h2>👥 Gestion des utilisateurs</h2>
      <p>Cette page démontre l'utilisation de Drizzle ORM avec PostgreSQL.</p>

      {users.length === 0 ? (
        <p>
          Aucun utilisateur trouvé. Assurez-vous que la base de données est
          démarrée et initialisée.
        </p>
      ) : (
        <div>
          <h3>Utilisateurs ({users.length})</h3>
          <ul>
            {users.map(user => (
              <li key={user.id} style={{ marginBottom: '0.5rem' }}>
                <strong>{user.name}</strong> - {user.email}
                <br />
                <small>
                  Créé le {new Date(user.createdAt).toLocaleDateString()}
                </small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
