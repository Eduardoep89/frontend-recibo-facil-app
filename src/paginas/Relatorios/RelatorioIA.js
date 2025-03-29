import React, { useState, useEffect } from "react";
import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import style from "./RelatorioIA.module.css";
import Table from "react-bootstrap/esm/Table";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { FaFilter, FaChartLine, FaLightbulb, FaChartPie } from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import ClienteApi from "../../services/clienteAPI";
import ProdutoApi from "../../services/produtoAPI";
import ReciboApi from "../../services/reciboAPI";
import ItemReciboApi from "../../services/itemReciboAPI";
import iaAPI from "../../services/iaAPI";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

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
  const [mostrarGraficoClientes, setMostrarGraficoClientes] = useState(false);
  const [mostrarGraficoProdutos, setMostrarGraficoProdutos] = useState(false);

  const getClientesChartData = () => {
    if (!relatorio?.topClientes) return null;

    return {
      labels: relatorio.topClientes.map((c) => c.nome),
      datasets: [
        {
          data: relatorio.topClientes.map((c) => c.totalGasto),
          backgroundColor: ["#FFD700", "#3498DB", "#FF5733"],
          borderColor: "#fff",
          borderWidth: 1,
        },
      ],
    };
  };

  const getProdutosChartData = () => {
    if (!relatorio?.topProdutos) return null;

    return {
      labels: relatorio.topProdutos.map((p) => p.nome),
      datasets: [
        {
          data: relatorio.topProdutos.map((p) => p.totalVendido),
          backgroundColor: ["#FFD700", "#3498DB", "#FF5733"],
          borderColor: "#fff",
          borderWidth: 1,
        },
      ],
    };
  };

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
    const totalClientes = clientes.length;
    const totalRecibos = recibos.length;
    const totalVendasMes = calcularVendasMes();
    const topClientes = identificarTopClientes();
    const topProdutos = await identificarTopProdutos();

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

  const identificarTopClientes = (limite = 3) => {
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

  const identificarTopProdutos = async (limite = 3) => {
    try {
      const todosItens = await Promise.all(
        recibos.map(async (recibo) => {
          const itens = await ItemReciboApi.listarPorReciboIdAsync(recibo.id);
          return itens;
        })
      ).then((results) => results.flat());

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

  const gerarInsights = (topClientes, topProdutos) => {
    const insights = [];

    if (topClientes.length > 0) {
      insights.push(
        `Cliente que mais comprou: ${
          topClientes[0].nome
        } gastou R$ ${topClientes[0].totalGasto.toFixed(2)}`
      );
    }

    if (topProdutos.length > 0) {
      insights.push(
        `Produto/Serviço mais Vendido: ${topProdutos[0].nome} (${topProdutos[0].totalVendido} unidades vendidas)`
      );
    }

    const mediaVenda =
      recibos.length > 0
        ? recibos.reduce((sum, r) => sum + r.total, 0) / recibos.length
        : 0;
    insights.push(`Média de gasto por recibo : R$ ${mediaVenda.toFixed(2)}`);

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

      const produtosCliente = await ProdutoApi.listarProdutosPorClienteAsync(
        clienteId
      );

      const respostaIA = await iaAPI.gerarSugestoesProdutosAsync(
        clienteId,
        produtosCliente
      );

      setSugestoes({
        clienteId,
        sugestoes: respostaIA.sugestoes,
        timestamp: new Date().toISOString(),
      });

      setMostrarModalSugestoes(true);
    } catch (err) {
      setError("Erro ao gerar sugestões: " + err.message);
      console.error("Erro:", err);

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
                  <div className={style.secao_cabecalho}>
                    <h5>Top 3 Clientes com maior gasto mensal</h5>
                    <button
                      onClick={() =>
                        setMostrarGraficoClientes(!mostrarGraficoClientes)
                      }
                      className={style.botao_grafico}
                    >
                      <FaChartPie />{" "}
                      {mostrarGraficoClientes
                        ? "Ocultar Gráfico"
                        : "Mostrar Gráfico"}
                    </button>
                  </div>

                  {mostrarGraficoClientes && (
                    <div className={style.grafico_pizza}>
                      <Pie
                        data={getClientesChartData()}
                        options={{
                          responsive: true,
                          plugins: { legend: { position: "top" } },
                        }}
                      />
                    </div>
                  )}

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
                  <div className={style.secao_cabecalho}>
                    <h5>Top Produtos ou Serviços mais vendidos</h5>
                    <button
                      onClick={() =>
                        setMostrarGraficoProdutos(!mostrarGraficoProdutos)
                      }
                      className={style.botao_grafico}
                    >
                      <FaChartPie />{" "}
                      {mostrarGraficoProdutos
                        ? "Ocultar Gráfico"
                        : "Mostrar Gráfico"}
                    </button>
                  </div>

                  {mostrarGraficoProdutos && (
                    <div className={style.grafico_pizza}>
                      <Pie
                        data={getProdutosChartData()}
                        options={{
                          responsive: true,
                          plugins: { legend: { position: "top" } },
                        }}
                      />
                    </div>
                  )}

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
                  <h5>Destaques</h5>
                  <ul>
                    {relatorio.insights.map((insight, i) => (
                      <li key={i}>{insight}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}
          </div>
          <Modal
            show={mostrarModalSugestoes}
            onHide={() => setMostrarModalSugestoes(false)}
            size="lg"
            centered
            className={style.modal_personalizado}
          >
            <Modal.Header className={style.modal_header}>
              <Modal.Title className={style.modal_title}>
                <FaLightbulb className={style.icone_titulo_modal} />
                Sugestões Personalizadas para {clienteSelecionado?.nome}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className={style.modal_body}>
              {sugestoes ? (
                <div className={style.sugestoes_conteudo}>
                  {sugestoes.sugestoes.split("\n").map((item, i) => (
                    <div key={i} className={style.sugestao_item}>
                      <div className={style.sugestao_icone}>
                        {i === 0 && (
                          <span className={style.icone_destaque}>🌟</span>
                        )}
                        {i === 1 && (
                          <span className={style.icone_destaque}>✨</span>
                        )}
                        {i === 2 && (
                          <span className={style.icone_destaque}>💡</span>
                        )}
                      </div>
                      <p className={style.sugestao_texto}>{item}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={style.carregando_sugestoes}>
                  <div className={style.spinner}></div>
                  <p>Gerando sugestões personalizadas...</p>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer className={style.modal_footer}>
              <Button
                variant="danger"
                onClick={() => setMostrarModalSugestoes(false)}
                className={style.botao_fechar}
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
