import { HTTPClient } from "./client"; // Importe o HTTPClient que você já tem

const ReciboApi = {
  // Cadastrar um novo recibo
  async cadastrarAsync(recibo) {
    try {
      const response = await HTTPClient.post("/api/Recibo/Cadastrar", recibo);
      return response.data;
    } catch (error) {
      console.error("Erro ao cadastrar recibo", error);
      throw error;
    }
  },

  // Atualizar um recibo existente
  async atualizarAsync(recibo) {
    try {
      const response = await HTTPClient.put("/api/Recibo/Atualizar", recibo);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar recibo", error);
      throw error;
    }
  },

  // Obter um recibo por ID
  async obterPorIdAsync(reciboId) {
    try {
      const response = await HTTPClient.get(`/api/Recibo/Obter/${reciboId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao obter recibo por ID", error);
      throw error;
    }
  },

  // Deletar um recibo
  async deletarAsync(reciboId) {
    try {
      const response = await HTTPClient.delete(
        `/api/Recibo/Deletar/${reciboId}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar recibo", error);
      throw error;
    }
  },

  // Listar todos os recibos (com filtro de ativo/inativo)
  async listarAsync(ativo = true) {
    try {
      const response = await HTTPClient.get(
        `/api/Recibo/Listar?ativo=${ativo}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao listar recibos", error);
      throw error;
    }
  },

  // Listar os 10 últimos recibos
  async listarTop10RecibosAsync() {
    try {
      const response = await HTTPClient.get("/api/Recibo/ListarTop10");
      return response.data;
    } catch (error) {
      console.error("Erro ao listar top 10 recibos", error);
      throw error;
    }
  },

  // Listar itens de um recibo por reciboId
  async listarItensPorReciboIdAsync(reciboId) {
    try {
      const response = await HTTPClient.get(
        `/api/ItemRecibo/ListarPorRecibo/${reciboId}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao listar itens do recibo", error);
      throw error;
    }
  },
};

export default ReciboApi;
