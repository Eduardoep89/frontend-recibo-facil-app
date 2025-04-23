import { createContext, useState, useContext, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para verificar autenticação
  const verificarAutenticacao = async () => {
    try {
      const sessaoAtiva = await authService.verificarSessao();
      if (sessaoAtiva) {
        const userData = await authService.obterUsuario();
        setUser({ ...userData, authenticated: true });
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Efeito para verificar autenticação ao carregar
  useEffect(() => {
    verificarAutenticacao();
  }, []);

  const login = async (email, senha) => {
    setLoading(true);
    try {
      const userData = await authService.login(email, senha);
      setUser({
        email: userData.email,
        nome: userData.nome,
        authenticated: true,
      });
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registrar = async (nome, email, senha) => {
    setLoading(true);
    try {
      await authService.registrar(nome, email, senha);
      // Removido o login automático
      // await login(email, senha);  // ⚠️ Isso fazia o login direto
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        registrar,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
