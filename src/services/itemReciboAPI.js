import { HTTPClient } from "./client"; // Importe o HTTPClient que você já tem

const itemReciboApi = {
  // Cadastrar um novo item de recibo
  async cadastrarAsync(itemRecibo) {
    try {
      const response = await HTTPClient.post(
        "/api/ItemRecibo/Cadastrar",
        itemRecibo
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao cadastrar item de recibo", error);
      throw error;
    }
  },

  // Atualizar um item de recibo existente
  async atualizarAsync(itemRecibo) {
    try {
      const response = await HTTPClient.put(
        "/api/ItemRecibo/Atualizar",
        itemRecibo
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar item de recibo", error);
      throw error;
    }
  },

  // Obter um item de recibo por ID
  async obterPorIdAsync(itemReciboId) {
    try {
      const response = await HTTPClient.get(
        `/api/ItemRecibo/Obter/${itemReciboId}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao obter item de recibo por ID", error);
      throw error;
    }
  },

  // Deletar um item de recibo
  async deletarAsync(itemReciboId) {
    try {
      const response = await HTTPClient.delete(
        `/api/ItemRecibo/Deletar/${itemReciboId}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar item de recibo", error);
      throw error;
    }
  },

  // Listar itens de recibo por reciboId
  async listarPorReciboIdAsync(reciboId) {
    try {
      const response = await HTTPClient.get(
        `/api/ItemRecibo/ListarPorRecibo/${reciboId}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao listar itens de recibo", error);
      throw error;
    }
  },
};

export default itemReciboApi;
