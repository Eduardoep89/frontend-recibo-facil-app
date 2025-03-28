import React, { useState, useEffect } from "react";
import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import style from "./RelatorioIA.module.css";
import Table from "react-bootstrap/esm/Table";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { FaFilter, FaChartLine, FaLightbulb } from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import ClienteApi from "../../services/clienteAPI";
import ProdutoApi from "../../services/produtoAPI";
import ReciboApi from "../../services/reciboAPI";
import ItemReciboApi from "../../services/itemReciboAPI";
import iaAPI from "../../services/iaAPI";

export function Relatorios() {
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroCliente, setFiltroCliente] = useState("");
  const [clientes, setClientes] = useState([]);
  const [recibos, setRecibos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [mostrarModalSugestoes, setMostrarModalSugestoes] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [sugestoes, setSugestoes] = useState(null);

  // Carrega dados iniciais
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        setLoading(true);
        await Promise.all([
          carregarClientes(),
          carregarRecibos(),
          carregarProdutos(),
        ]);
        await carregarRelatorio();
      } catch (err) {
        setError("Erro ao carregar dados iniciais");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    carregarDadosIniciais();
  }, []);

  const carregarClientes = async () => {
    try {
      const data = await ClienteApi.listarAsync(true);
      setClientes(
        data.map((c) => ({ ...c, nome: c.nome || "Cliente sem nome" }))
      );
    } catch (err) {
      console.error("Erro ao carregar clientes", err);
      setClientes([]);
    }
  };

  const carregarRecibos = async () => {
    try {
      const data = await ReciboApi.listarAsync(true);
      setRecibos(data);
    } catch (err) {
      console.error("Erro ao carregar recibos", err);
      setRecibos([]);
    }
  };

  const carregarProdutos = async () => {
    try {
      const data = await ProdutoApi.listarAsync(true);
      setProdutos(data);
    } catch (err) {
      console.error("Erro ao carregar produtos", err);
      setProdutos([]);
    }
  };

  const carregarRelatorio = async () => {
    try {
      const data = await gerarRelatorioAnalitico();
      setRelatorio(data);
      setError(null);
    } catch (err) {
      setError("Erro ao gerar relatório");
      console.error(err);
    }
  };

  const gerarRelatorioAnalitico = async () => {
    // Calcula métricas básicas
    const totalClientes = clientes.length;
    const totalRecibos = recibos.length;
    const totalVendasMes = calcularVendasMes();
    const topClientes = identificarTopClientes();
    const topProdutos = await identificarTopProdutos(); // Agora é async

    return {
      totalClientes,
      totalRecibos,
      totalVendasMes,
      topClientes,
      topProdutos,
      insights: gerarInsights(topClientes, topProdutos),
      tempoGeracao: new Date().toISOString(),
    };
  };

  const calcularVendasMes = () => {
    const primeiroDiaMes = new Date();
    primeiroDiaMes.setDate(1);
    primeiroDiaMes.setHours(0, 0, 0, 0);

    return recibos
      .filter((r) => new Date(r.data) >= primeiroDiaMes)
      .reduce((total, recibo) => total + (recibo.total || 0), 0);
  };

  const identificarTopClientes = (limite = 5) => {
    const clientesComGasto = clientes.map((cliente) => {
      const recibosCliente = recibos.filter((r) => r.clienteId === cliente.id);
      const totalGasto = recibosCliente.reduce(
        (sum, r) => sum + (r.total || 0),
        0
      );
      return { ...cliente, totalGasto, qtdRecibos: recibosCliente.length };
    });

    return clientesComGasto
      .sort((a, b) => b.totalGasto - a.totalGasto)
      .slice(0, limite);
  };

  const identificarTopProdutos = async (limite = 5) => {
    try {
      // Primeiro obtemos todos os itens de todos os recibos
      const todosItens = await Promise.all(
        recibos.map(async (recibo) => {
          const itens = await ItemReciboApi.listarPorReciboIdAsync(recibo.id);
          return itens;
        })
      ).then((results) => results.flat());

      // Agora calculamos as vendas por produto
      const produtosComVendas = produtos.map((produto) => {
        const itensDoProduto = todosItens.filter(
          (item) => item.produtoId === produto.id
        );
        const totalVendido = itensDoProduto.reduce(
          (sum, item) => sum + (item.quantidade || 0),
          0
        );
        return { ...produto, totalVendido };
      });

      return produtosComVendas
        .sort((a, b) => b.totalVendido - a.totalVendido)
        .slice(0, limite);
    } catch (error) {
      console.error("Erro ao identificar top produtos:", error);
      return [];
    }
  };

  // ... (restante do código permanece igual)

  const gerarInsights = (topClientes, topProdutos) => {
    const insights = [];

    if (topClientes.length > 0) {
      insights.push(
        `Cliente top: ${
          topClientes[0].nome
        } gastou R$ ${topClientes[0].totalGasto.toFixed(2)}`
      );
    }

    if (topProdutos.length > 0) {
      insights.push(
        `Produto top: ${topProdutos[0].nome} (${topProdutos[0].totalVendido} unidades vendidas)`
      );
    }

    const mediaVenda =
      recibos.length > 0
        ? recibos.reduce((sum, r) => sum + r.total, 0) / recibos.length
        : 0;
    insights.push(`Ticket médio: R$ ${mediaVenda.toFixed(2)}`);

    return insights;
  };

  const filtrarClientes = (termo) => {
    const termoBusca = termo?.toLowerCase() || "";
    return clientes.filter((cliente) => {
      const nomeCliente = cliente?.nome?.toLowerCase() || "";
      return nomeCliente.includes(termoBusca);
    });
  };

  const gerarSugestoesCliente = async (clienteId) => {
    try {
      setLoading(true);
      const cliente = clientes.find((c) => c.id === clienteId);
      if (!cliente) throw new Error("Cliente não encontrado");

      // 1. Obter produtos já comprados pelo cliente
      const produtosCliente = await ProdutoApi.listarProdutosPorClienteAsync(
        clienteId
      );

      // 2. Montar o prompt
      const prompt = `Sugira 3 produtos para ${cliente.nome}...`; // Seu prompt completo

      // 3. Chamar API (usando a Opção 1)
      const respostaIA = await iaAPI.gerarSugestoesProdutosAsync(
        clienteId,
        produtosCliente
      );

      // 4. Processar resposta
      setSugestoes({
        clienteId,
        sugestoes: respostaIA.sugestoes, // Ajuste conforme o formato da sua API
        timestamp: new Date().toISOString(),
      });

      setMostrarModalSugestoes(true);
    } catch (err) {
      setError("Erro ao gerar sugestões: " + err.message);
      console.error("Erro:", err);

      // Fallback
      setSugestoes({
        clienteId,
        sugestoes: [
          `1. Produto A - Complemento para suas compras`,
          `2. Produto B - Frequentemente comprado junto`,
          `3. Produto C - Novidade exclusiva`,
        ].join("\n"),
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Sidebar>
      <Topbar>
        <div className={style.pagina_conteudo}>
          <div className={style.pagina_cabecalho}>
            <h3>
              <FaChartLine className={style.icone_titulo} /> Relatórios IA
            </h3>
            <div className={style.botoes_acao}>
              <button
                onClick={carregarRelatorio}
                className={style.botao_atualizar}
                disabled={loading}
              >
                <MdRefresh /> Atualizar
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className={style.filtros_container}>
            <div className={style.filtro_grupo}>
              <FaFilter className={style.icone_filtro} />
              <input
                placeholder="Buscar cliente por nome..."
                type="text"
                value={filtroCliente}
                onChange={(e) => setFiltroCliente(e.target.value)}
                className={style.input_filtro}
              />
              {filtroCliente && (
                <button
                  onClick={() => setFiltroCliente("")}
                  className={style.botao_limpar}
                >
                  X
                </button>
              )}
            </div>
          </div>

          {/* Resultados do filtro */}
          {filtroCliente && (
            <div className={style.resultados_filtro}>
              <h5>Clientes encontrados:</h5>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrarClientes(filtroCliente).map((cliente) => (
                    <tr key={cliente.id}>
                      <td>{cliente.nome}</td>
                      <td>
                        <button
                          onClick={() => {
                            setClienteSelecionado(cliente);
                            gerarSugestoesCliente(cliente.id);
                          }}
                          className={style.botao_sugestoes}
                        >
                          <FaLightbulb /> Sugestões IA
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {/* Relatório Analítico */}
          <div className={style.relatorio_container}>
            {loading ? (
              <div className={style.carregando}>Carregando relatório...</div>
            ) : error ? (
              <div className={style.erro}>{error}</div>
            ) : relatorio ? (
              <>
                <div className={style.relatorio_cabecalho}>
                  <h4>Análise Consolidada</h4>
                  <span className={style.tempo_geracao}>
                    Gerado em:{" "}
                    {new Date(relatorio.tempoGeracao).toLocaleString()}
                  </span>
                </div>

                <div className={style.relatorio_metricas}>
                  <div className={style.metrica}>
                    <h5>Clientes Ativos</h5>
                    <p>{relatorio.totalClientes}</p>
                  </div>

                  <div className={style.metrica}>
                    <h5>Recibos Emitidos</h5>
                    <p>{relatorio.totalRecibos}</p>
                  </div>

                  <div className={style.metrica}>
                    <h5>Vendas do Mês</h5>
                    <p>R$ {relatorio.totalVendasMes.toFixed(2)}</p>
                  </div>
                </div>

                <div className={style.relatorio_secao}>
                  <h5>Top 5 Clientes com maior gasto mensal</h5>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Cliente</th>
                        <th>Total Gasto</th>
                        <th>Recibos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatorio.topClientes.map((cliente, i) => (
                        <tr key={i}>
                          <td>{cliente.nome}</td>
                          <td>R$ {cliente.totalGasto.toFixed(2)}</td>
                          <td>{cliente.qtdRecibos}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                <div className={style.relatorio_secao}>
                  <h5>Top 5 Produtos ou Serviços mais vendidos</h5>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Unidades Vendidas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatorio.topProdutos.map((produto, i) => (
                        <tr key={i}>
                          <td>
                            {produto.nome} ({produto.marca})
                          </td>
                          <td>{produto.totalVendido}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                <div className={style.relatorio_secao}>
                  <h5>Insights</h5>
                  <ul>
                    {relatorio.insights.map((insight, i) => (
                      <li key={i}>{insight}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}
          </div>

          {/* Modal de Sugestões */}
          <Modal
            show={mostrarModalSugestoes}
            onHide={() => setMostrarModalSugestoes(false)}
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>
                <FaLightbulb /> Sugestões de IA para {clienteSelecionado?.nome}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {sugestoes ? (
                <div className={style.sugestoes_conteudo}>
                  {sugestoes.sugestoes.split("\n").map((item, i) => (
                    <p key={i}>{item}</p>
                  ))}
                </div>
              ) : (
                <div>Carregando sugestões...</div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setMostrarModalSugestoes(false)}
                className={style.botaoFechar}
              >
                Fechar
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </Topbar>
    </Sidebar>
  );
}
