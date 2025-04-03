import { HTTPClient } from "./client";

const itemReciboApi = {
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
