import { HTTPClient } from "./client"; // Importe o HTTPClient que você já tem

const ProdutoApi = {
  // Cadastrar um novo produto
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

  // Atualizar um produto existente
  async atualizarAsync(produto) {
    try {
      const response = await HTTPClient.put("/api/Produto/Atualizar", produto);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar produto", error);
      throw error;
    }
  },

  // Obter um produto por ID
  async obterPorIdAsync(produtoId) {
    try {
      const response = await HTTPClient.get(`/api/Produto/Obter/${produtoId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao obter produto por ID", error);
      throw error;
    }
  },

  // Deletar um produto
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

  // Listar produtos (ativos ou inativos)
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

  // Listar top 10 produtos
  async listarTop10ProdutosAsync() {
    try {
      const response = await HTTPClient.get("/api/Produto/ListarTop10");
      return response.data;
    } catch (error) {
      console.error("Erro ao listar top 10 produtos", error);
      throw error;
    }
  },

  // Listar produtos por cliente
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
  async listarPaginadoAsync(pagina = 1, itensPorPagina = 10) {
    try {
      const response = await HTTPClient.get("/api/Produto/ListarPaginado", {
        params: { pagina, itensPorPagina },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao listar produtos paginados:", error);
      throw error;
    }
  },
};

export default ProdutoApi;
