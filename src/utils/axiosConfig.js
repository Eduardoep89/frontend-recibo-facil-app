import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // Para enviar cookies de sessão
});

// Interceptador para adicionar headers ou tratar erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Você pode redirecionar para login aqui se quiser
      console.error("Não autorizado - redirecionar para login");
    }
    return Promise.reject(error);
  }
);

export default api;
