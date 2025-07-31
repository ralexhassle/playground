import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { LoginRequest, LoginResponse } from '@/types';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<LoginResponse>('/api/auth/login', {
        email,
        password,
      } as LoginRequest);
      return data;
    },
    onSuccess: data => {
      localStorage.setItem('token', data.token);
      navigate('/users');
    },
    onError: (err: any) => {
      setError(err.message || 'Erreur de connexion');
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate();
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: '300px', margin: '2rem auto' }}>
      <h2>Connexion</h2>
      {error && <div style={{ color: '#f87171' }}>{error}</div>}
      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      <button type="submit">Se connecter</button>
    </form>
  );
}
