import { HTTPClient } from "./client";

const iaAPI = {
  /**
   * Gera um relatório analítico com dados consolidados
   * @returns {Promise<{relatorio: string, tempoMs: number}>}
   */
  async gerarRelatorioAnaliticoAsync() {
    try {
      const response = await HTTPClient.get("/api/relatorios/analitico");
      return {
        relatorio: response.data.relatorio,
        tempoMs: response.data.tempoMs,
        dataGeracao: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Erro ao gerar relatório analítico", error);
      throw error;
    }
  },

  /**
   * Obtém sugestões de produtos para um cliente específico
   * @param {number} clienteId - ID do cliente
   * @returns {Promise<{sugestoes: string, clienteId: number, dataGeracao: string}>}
   */
  async gerarSugestoesProdutosAsync(clienteId) {
    try {
      const response = await HTTPClient.get(
        `/api/relatorios/sugestoes/${clienteId}`
      );
      return {
        sugestoes: response.data.sugestoes,
        clienteId: clienteId,
        dataGeracao: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Erro ao gerar sugestões de produtos", error);
      throw error;
    }
  },

  /**
   * Gera um relatório personalizado baseado em um prompt
   * @param {string} prompt - Texto com as instruções para a IA
   * @returns {Promise<{resultado: string, dataGeracao: string}>}
   */
  async gerarRelatorioPersonalizadoAsync(prompt) {
    try {
      // Envia como raw string (conforme seu controller espera)
      const response = await HTTPClient.post(
        "/api/relatorios/personalizado",
        prompt,
        {
          headers: {
            "Content-Type": "text/plain",
          },
        }
      );
      return {
        resultado: response.data.resultado,
        dataGeracao: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Erro ao gerar relatório personalizado", error);
      throw error;
    }
  },

  /**
   * Método combinado para obter dados para dashboard
   * @returns {Promise<{analitico: object, sugestoes: object[]}>}
   */
  async obterDashboardDataAsync() {
    try {
      const [analitico, sugestoes] = await Promise.all([
        this.gerarRelatorioAnaliticoAsync(),
        this.gerarSugestoesParaClientesTop(),
      ]);

      return { analitico, sugestoes };
    } catch (error) {
      console.error("Erro ao obter dados do dashboard", error);
      throw error;
    }
  },

  /**
   * Método auxiliar privado para obter sugestões para os top clientes
   * @private
   */
  async gerarSugestoesParaClientesTop() {
    try {
      // Primeiro obtém os top clientes (você precisará implementar este endpoint)
      const topClientes = await HTTPClient.get("/api/clientes/top");

      // Gera sugestões para cada cliente
      const sugestoesPromises = topClientes.data.map((cliente) =>
        this.gerarSugestoesProdutosAsync(cliente.id)
      );

      return await Promise.all(sugestoesPromises);
    } catch (error) {
      console.error("Erro ao gerar sugestões para top clientes", error);
      return [];
    }
  },
};

export default iaAPI;
