import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tf_token');
    const saved = localStorage.getItem('tf_trainer');
    if (token && saved) {
      try { setTrainer(JSON.parse(saved)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  function login(token, trainerData) {
    localStorage.setItem('tf_token', token);
    localStorage.setItem('tf_trainer', JSON.stringify(trainerData));
    setTrainer(trainerData);
  }

  function logout() {
    localStorage.removeItem('tf_token');
    localStorage.removeItem('tf_trainer');
    setTrainer(null);
  }

  return (
    <AuthContext.Provider value={{ trainer, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
