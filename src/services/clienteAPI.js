import { HTTPClient } from "./client";

const ClienteApi = {
  async cadastrarAsync(nome, endereco, bairro, cidade, telefone, cnpjCpf) {
    try {
      const clienteCriar = {
        Nome: nome,
        Endereco: endereco,
        Bairro: bairro,
        Cidade: cidade,
        Telefone: telefone,
        CnpjCpf: cnpjCpf,
      };
      const response = await HTTPClient.post(
        "/api/Cliente/Cadastrar",
        clienteCriar
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao cadastrar cliente", error);
      throw error;
    }
  },

  async atualizarAsync(id, nome, endereco, bairro, cidade, telefone, cnpjCpf) {
    try {
      const clienteAtualizar = {
        Id: id,
        Nome: nome,
        Endereco: endereco,
        Bairro: bairro,
        Cidade: cidade,
        Telefone: telefone,
        CnpjCpf: cnpjCpf,
      };
      const response = await HTTPClient.put(
        "/api/Cliente/Atualizar",
        clienteAtualizar
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar cliente", error);
      throw error;
    }
  },

  async obterPorIdAsync(clienteId) {
    try {
      const response = await HTTPClient.get(`/api/Cliente/Obter/${clienteId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao obter cliente por ID", error);
      throw error;
    }
  },

  async deletarAsync(clienteId) {
    try {
      const response = await HTTPClient.delete(
        `/api/Cliente/Deletar/${clienteId}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar cliente", error);
      throw error;
    }
  },

  // Listar clientes (ativos ou inativos)
  async listarAsync(ativo = true) {
    try {
      const response = await HTTPClient.get(
        `/api/Cliente/Listar?ativo=${ativo}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao listar clientes", error);
      throw error;
    }
  },

  // Minha Procedure para Listar os 10 Primeiros
  async listarTop10Async() {
    try {
      const response = await HTTPClient.get("/api/Cliente/ListarTop10");
      return response.data;
    } catch (error) {
      console.error("Erro ao listar top 10 clientes", error);
      throw error;
    }
  },
  // Minha Procedure de Paginação
  async listarPaginadoAsync(pagina = 1, itensPorPagina = 10) {
    try {
      const response = await HTTPClient.get(
        `/api/Cliente/ListarPaginado?pagina=${pagina}&itensPorPagina=${itensPorPagina}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao listar clientes paginados", error);
      throw error;
    }
  },
};

export default ClienteApi;
