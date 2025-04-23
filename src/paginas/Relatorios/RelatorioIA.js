import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import style from "./RelatorioIA.module.css";
import Table from "react-bootstrap/esm/Table";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import {
  FaFilter,
  FaChartLine,
  FaLightbulb,
  FaChartPie,
  FaStar,
  FaDollarSign,
  FaCalendarAlt,
  FaBoxOpen,
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import ClienteApi from "../../services/clienteAPI";
import ProdutoApi from "../../services/produtoAPI";
import ReciboApi from "../../services/reciboAPI";
import ItemReciboApi from "../../services/itemReciboAPI";
import iaAPI from "../../services/iaAPI";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { formatarMoeda } from "../../utils/formatters";
import { FaTag, FaBarcode } from "react-icons/fa";
import { FaEnvelope } from "react-icons/fa";

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

  // Adicionado useRef para o container do relatório
  const relatorioContainerRef = useRef(null);

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

      // Objeto para agrupar produtos por nome+marca+modelo
      const produtosAgrupados = {};

      produtos.forEach((produto) => {
        const chave = `${produto.nome}_${produto.marca}_${produto.modelo}`;
        if (!produtosAgrupados[chave]) {
          produtosAgrupados[chave] = { ...produto, totalVendido: 0 };
        }
      });

      // Soma as quantidades vendidas para cada produto agrupado
      todosItens.forEach((item) => {
        const produto = produtos.find((p) => p.id === item.produtoId);
        if (produto) {
          const chave = `${produto.nome}_${produto.marca}_${produto.modelo}`;
          if (produtosAgrupados[chave]) {
            produtosAgrupados[chave].totalVendido += item.quantidade || 0;
          }
        }
      });

      // Converte o objeto de volta para array e ordena
      const produtosComVendas = Object.values(produtosAgrupados)
        .sort((a, b) => b.totalVendido - a.totalVendido)
        .slice(0, limite);

      return produtosComVendas;
    } catch (error) {
      console.error("Erro ao identificar top produtos:", error);
      return [];
    }
  };

  const gerarInsights = (topClientes, topProdutos) => {
    const insights = [];
    const mediaVenda =
      recibos.length > 0
        ? recibos.reduce((sum, r) => sum + r.total, 0) / recibos.length
        : 0;

    // Calcula a frequência e formata corretamente
    const frequenciaDias = calcularFrequenciaMediaCompra();
    const frequenciaTexto =
      frequenciaDias === 1 ? "1 dia" : `${frequenciaDias} dias`;

    insights.push({
      titulo: "Ticket Médio",
      valor: formatarMoeda(mediaVenda),
      descricao:
        mediaVenda > 500
          ? "Ótimo valor! Continue incentivando compras maiores"
          : "Você pode aumentar oferecendo combos ou pacotes",
      icone: <FaDollarSign />,
    });

    insights.push({
      titulo: "Frequência de Compra",
      valor: frequenciaTexto,
      descricao:
        frequenciaDias === 1
          ? "Frequência diária! Programas de fidelidade podem aumentar o ticket médio"
          : frequenciaDias < 30
          ? "Excelente fidelidade! Considere um programa de recompensas"
          : "Oportunidade para criar campanhas de retenção",
      icone: <FaCalendarAlt />,
    });

    if (topProdutos.length > 0) {
      insights.push({
        titulo: "Produto em Destaque",
        valor: topProdutos[0].nome,
        descricao: "O produto mais vendido neste período",
        icone: <FaBoxOpen />,
      });
    }

    return insights;
  };
  const filtrarClientes = (termo) => {
    const termoBusca = termo?.toLowerCase() || "";
    return clientes.filter((cliente) => {
      const nomeCliente = cliente?.nome?.toLowerCase() || "";
      return nomeCliente.includes(termoBusca);
    });
  };

  // 2. Depois declare calcularFrequenciaMediaCompra
  const calcularFrequenciaMediaCompra = () => {
    if (recibos.length < 2) return "N/A";

    const datasOrdenadas = recibos
      .map((r) => new Date(r.data))
      .sort((a, b) => a - b);

    const diferencas = [];
    for (let i = 1; i < datasOrdenadas.length; i++) {
      diferencas.push(datasOrdenadas[i] - datasOrdenadas[i - 1]);
    }

    const mediaMs = diferencas.reduce((a, b) => a + b, 0) / diferencas.length;
    return Math.round(mediaMs / (1000 * 60 * 60 * 24));
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

  // Função gerarPDF corrigida usando useRef
  const gerarPDF = async () => {
    if (!relatorioContainerRef.current || !relatorio) {
      alert(
        "Aguarde o carregamento completo do relatório antes de gerar o PDF."
      );
      return;
    }

    // Elementos que devem ser ocultos
    const elementosParaOcultar = [
      ...relatorioContainerRef.current.querySelectorAll(
        `.${style.botao_atualizar}`
      ),
      ...relatorioContainerRef.current.querySelectorAll(
        `.${style.botao_grafico}`
      ),
      document.querySelector(`.${style.filtros_container}`),
      document.querySelector(`.${style.resultados_filtro}`),
      document.querySelector(`.${style.botoes_acao}`),
    ].filter((el) => el !== null);

    // Armazenar estilos originais
    const estilosOriginais = elementosParaOcultar.map((el) => {
      return {
        element: el,
        original: {
          visibility: el.style.visibility,
          position: el.style.position,
          height: el.style.height,
          margin: el.style.margin,
          padding: el.style.padding,
          display: el.style.display, // Adicionado display
        },
      };
    });

    // Aplicar estilos de ocultação
    elementosParaOcultar.forEach((el) => {
      el.style.visibility = "hidden";
      el.style.position = "absolute";
      el.style.height = "0";
      el.style.margin = "0";
      el.style.padding = "0";
      el.style.display = "none"; // Garantir que não ocupem espaço
    });

    try {
      const opcoes = {
        scale: 2,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: relatorioContainerRef.current.scrollWidth,
        windowHeight: relatorioContainerRef.current.scrollHeight,
      };

      const canvas = await html2canvas(relatorioContainerRef.current, opcoes);
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("relatorio_analitico.pdf");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Verifique o console para detalhes.");
    } finally {
      // Restaurar estilos originais de TODOS os elementos
      estilosOriginais.forEach(({ element, original }) => {
        element.style.visibility = original.visibility;
        element.style.position = original.position;
        element.style.height = original.height;
        element.style.margin = original.margin;
        element.style.padding = original.padding;
        element.style.display = original.display || ""; // Restaurar display
      });
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
              <button
                onClick={gerarPDF}
                className={style.botao_pdf}
                disabled={loading || !relatorio}
              >
                Gerar PDF
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

          {/* Adicionada ref ao container do relatório */}
          <div
            className={style.relatorio_container}
            ref={relatorioContainerRef}
          >
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
                    <p>{formatarMoeda(relatorio.totalVendasMes)}</p>
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
                  <Table
                    striped
                    bordered
                    hover
                    className={style.tabela_clientes}
                  >
                    <thead>
                      <tr>
                        <th>Cliente</th>
                        <th className={style.coluna_valor}>Total Gasto</th>
                        <th className={style.coluna_quantidade}>Recibos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatorio.topClientes.map((cliente, i) => (
                        <tr key={i}>
                          <td>
                            <div className={style.cliente_info}>
                              <div className={style.cliente_nome}>
                                {i === 0 && (
                                  <span className={style.medalha}>🥇</span>
                                )}
                                {i === 1 && (
                                  <span className={style.medalha}>🥈</span>
                                )}
                                {i === 2 && (
                                  <span className={style.medalha}>🥉</span>
                                )}
                                <strong>{cliente.nome}</strong>
                              </div>
                              {cliente.email && (
                                <div className={style.cliente_detalhes}>
                                  <span>
                                    <FaEnvelope className={style.icone} />{" "}
                                    {cliente.email}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className={style.coluna_valor}>
                            <span className={style.valor}>
                              {formatarMoeda(cliente.totalGasto)}
                            </span>
                            {i === 0 && (
                              <span className={style.destaque}>
                                Maior cliente!
                              </span>
                            )}
                          </td>
                          <td className={style.coluna_quantidade}>
                            <span className={style.quantidade}>
                              {cliente.qtdRecibos}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                <div className={style.relatorio_secao}>
                  <div className={style.secao_cabecalho}>
                    <h5>Top 3 Produtos ou Serviços mais vendidos</h5>
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

                  <Table
                    striped
                    bordered
                    hover
                    className={style.tabela_produtos}
                  >
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th className={style.coluna_quantidade}>
                          Unidades Vendidas
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatorio.topProdutos.map((produto, i) => (
                        <tr key={i}>
                          <td>
                            <div className={style.produto_info}>
                              <div className={style.produto_nome}>
                                {i === 0 && (
                                  <span className={style.medalha}>🥇</span>
                                )}
                                {i === 1 && (
                                  <span className={style.medalha}>🥈</span>
                                )}
                                {i === 2 && (
                                  <span className={style.medalha}>🥉</span>
                                )}
                                <strong>{produto.nome}</strong>
                              </div>
                              <div className={style.produto_detalhes}>
                                {produto.marca && (
                                  <span>
                                    <FaTag className={style.icone} />{" "}
                                    {produto.marca}
                                  </span>
                                )}
                                {produto.modelo && (
                                  <span>
                                    <FaBarcode className={style.icone} />{" "}
                                    {produto.modelo}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className={style.coluna_quantidade}>
                            <span className={style.quantidade}>
                              {produto.totalVendido.toLocaleString()}
                            </span>
                            {i === 0 && (
                              <span className={style.destaque}>
                                Mais vendido!
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                <div className={style.relatorio_secao}>
                  <h5>
                    <FaStar className={style.icone_titulo} /> Insights Valiosos
                  </h5>
                  <div className={style.insights_container}>
                    {relatorio.insights.map((insight, i) => (
                      <div key={i} className={style.insight_card}>
                        <div className={style.insight_icone}>
                          {insight.icone}
                        </div>
                        <div className={style.insight_conteudo}>
                          <h6>{insight.titulo}</h6>
                          <p className={style.insight_valor}>{insight.valor}</p>
                          <p className={style.insight_descricao}>
                            {insight.descricao}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
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
                  {sugestoes.sugestoes
                    .split("\n")
                    .filter((line) => line.trim() !== "") // Remove linhas vazias
                    .map((item, i) => {
                      // Extrai o número e o texto da sugestão
                      const match = item.match(/^(\d+\.\s*)?(.*)/);
                      const text = match ? match[2] : item;

                      return (
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
                          <p className={style.sugestao_texto}>{text.trim()}</p>
                        </div>
                      );
                    })}
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
