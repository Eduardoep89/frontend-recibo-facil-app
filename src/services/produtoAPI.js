import { HTTPClient } from "./client";

const ProdutoApi = {
  async cadastrarAsync(nome, marca, modelo, preco, clienteId) {
    try {
      const produtoCriar = {
        Nome: nome,
        Marca: marca,
        Modelo: modelo,
        Preco: preco,
        ClienteId: clienteId,
      };
      const response = await HTTPClient.post(
        "/api/Produto/Cadastrar",
        produtoCriar
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao cadastrar produto", error);
      throw error;
    }
  },

  async atualizarAsync(produto) {
    try {
      const response = await HTTPClient.put("/api/Produto/Atualizar", produto);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar produto", error);
      throw error;
    }
  },

  async obterPorIdAsync(produtoId) {
    try {
      const response = await HTTPClient.get(`/api/Produto/Obter/${produtoId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao obter produto por ID", error);
      throw error;
    }
  },

  async deletarAsync(produtoId) {
    try {
      const response = await HTTPClient.delete(
        `/api/Produto/Deletar/${produtoId}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar produto", error);
      throw error;
    }
  },

  async listarAsync(ativo = true) {
    try {
      const response = await HTTPClient.get(
        `/api/Produto/Listar?ativo=${ativo}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao listar produtos", error);
      throw error;
    }
  },

  async listarTop10ProdutosAsync() {
    try {
      const response = await HTTPClient.get("/api/Produto/ListarTop10");
      return response.data;
    } catch (error) {
      console.error("Erro ao listar top 10 produtos", error);
      throw error;
    }
  },

  async listarProdutosPorClienteAsync(clienteId) {
    try {
      const response = await HTTPClient.get(
        `/api/Produto/ListarPorCliente/${clienteId}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao listar produtos por cliente", error);
      throw error;
    }
  },
};

export default ProdutoApi;
