import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5076/api",
  withCredentials: true,
  timeout: 10000,
});

const authService = {
  async registrar(nome, email, senha) {
    try {
      const response = await api.post("/autenticacao/registrar", {
        nome,
        email,
        senha,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || error.message || "Erro ao registrar"
      );
    }
  },

  async login(email, senha) {
    try {
      const response = await api.post("/autenticacao/login", { email, senha });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Credenciais inválidas");
    }
  },

  async logout() {
    try {
      await api.post("/autenticacao/logout");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  },

  async verificarSessao() {
    try {
      const response = await api.get("/autenticacao/verificar-sessao");
      return response.data.sessaoAtiva;
    } catch (error) {
      return false;
    }
  },

  async obterUsuario() {
    try {
      const response = await api.get("/autenticacao/usuario");
      return response.data;
    } catch (error) {
      throw new Error("Erro ao obter dados do usuário");
    }
  },
};

export default authService;
