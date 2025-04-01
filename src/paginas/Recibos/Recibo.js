import React, { useState, useEffect } from "react";
import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import style from "./Recibo.module.css";
import ClienteApi from "../../services/clienteAPI";
import ProdutoApi from "../../services/produtoAPI";
import ReciboApi from "../../services/reciboAPI";
import microservice from "../../assets/microservice.png";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Alert from "react-bootstrap/Alert";

export function Recibos() {
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, "0");
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const ano = hoje.getFullYear();
  const dataFormatada = `${dia}-${mes}-${ano}`;
  const [data, setData] = useState(dataFormatada);

  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [buscaCliente, setBuscaCliente] = useState("");
  const [mostrarFiltro, setMostrarFiltro] = useState(true);

  const [produtosCliente, setProdutosCliente] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [, setProdutoSelecionado] = useState(null);
  const [buscaProduto, setBuscaProduto] = useState("");
  const [produtos, setProdutos] = useState([]);
  const [total, setTotal] = useState(0);

  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  // Novo estado para controlar se o recibo foi salvo
  const [reciboSalvo, setReciboSalvo] = useState(false);

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      const listaClientes = await ClienteApi.listarAsync(true);
      setClientes(listaClientes);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    }
  };

  const carregarProdutosCliente = async (clienteId) => {
    try {
      const produtos = await ProdutoApi.listarProdutosPorClienteAsync(
        clienteId
      );
      setProdutosCliente(produtos);
      setProdutosFiltrados(produtos);
    } catch (error) {
      console.error("Erro ao carregar produtos do cliente:", error);
    }
  };

  const handleChangeBuscaCliente = (e) => {
    const valor = e.target.value;
    setBuscaCliente(valor);

    if (valor) {
      const filtrados = clientes.filter((cliente) =>
        cliente.nome.toLowerCase().includes(valor.toLowerCase())
      );
      setClientesFiltrados(filtrados);
    } else {
      setClientesFiltrados([]);
    }
  };

  const handleSelecionarCliente = (cliente) => {
    setClienteSelecionado(cliente);
    setBuscaCliente(cliente.nome);
    setClientesFiltrados([]);
    setMostrarFiltro(false);
    carregarProdutosCliente(cliente.id);
  };

  // eslint-disable-next-line no-unused-vars
  const reabrirFiltro = () => {
    setMostrarFiltro(true);
    setBuscaCliente("");
    setClienteSelecionado(null);
    setProdutosCliente([]);
    setProdutoSelecionado(null);
  };

  const handleChangeBuscaProduto = (e) => {
    const valor = e.target.value;
    setBuscaProduto(valor);

    if (valor) {
      const filtrados = produtosCliente.filter((produto) =>
        produto.nome.toLowerCase().includes(valor.toLowerCase())
      );
      setProdutosFiltrados(filtrados);
    } else {
      setProdutosFiltrados([]);
    }
  };

  const handleSelecionarProduto = (produto) => {
    setProdutoSelecionado(produto);
    setBuscaProduto("");
    setProdutosFiltrados([]);

    const novoProduto = {
      ...produto,
      quantidade: 1,
      subtotal: produto.preco * 1,
    };
    setProdutos([...produtos, novoProduto]);
    calcularTotal([...produtos, novoProduto]);
  };

  const atualizarProduto = (index, campo, valor) => {
    const novosProdutos = [...produtos];
    novosProdutos[index][campo] = valor;

    if (campo === "quantidade" || campo === "preco") {
      novosProdutos[index].subtotal =
        novosProdutos[index].quantidade * novosProdutos[index].preco;
    }

    setProdutos(novosProdutos);
    calcularTotal(novosProdutos);
  };

  const calcularTotal = (produtos) => {
    const total = produtos.reduce((acc, produto) => acc + produto.subtotal, 0);
    setTotal(total);
  };

  const salvarRecibo = async () => {
    if (!clienteSelecionado || produtos.length === 0) {
      setAlertVariant("danger");
      setAlertMessage(
        "Selecione um cliente e adicione pelo menos um produto antes de salvar."
      );
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 1000); // Fecha após 1 segundo
      return;
    }

    try {
      const recibo = {
        numeroPedido: `PED${Date.now()}`,
        data: new Date(data.split("-").reverse().join("-")).toISOString(),
        descricao: "Recibo de venda",
        clienteId: clienteSelecionado.id,
        subtotal: total,
        total: total,
        itens: produtos.map((produto) => ({
          produtoId: produto.id,
          quantidade: produto.quantidade,
          precoUnitario: produto.preco,
          subtotal: produto.subtotal,
        })),
      };

      const reciboSalvo = await ReciboApi.cadastrarAsync(recibo);
      setAlertVariant("success");
      setAlertMessage("Recibo salvo com sucesso!");
      setShowAlert(true);
      console.log("Recibo salvo:", reciboSalvo);
      setReciboSalvo(true);

      // Fecha o alerta após 1 segundo
      setTimeout(() => setShowAlert(false), 1000);
    } catch (error) {
      console.error("Erro ao salvar recibo:", error);
      setAlertVariant("danger");
      setAlertMessage("Erro ao salvar recibo. Por favor, tente novamente.");
      setShowAlert(true);

      // Fecha o alerta de erro após 1 segundo
      setTimeout(() => setShowAlert(false), 1000);
    }
  };

  const cancelarRecibo = () => {
    setClienteSelecionado(null);
    setProdutos([]);
    setTotal(0);
    setBuscaCliente("");
    setBuscaProduto("");
    setProdutosFiltrados([]);
    setMostrarFiltro(true);
    setReciboSalvo(false); // Reseta o estado de recibo salvo
  };

  const gerarPDF = () => {
    const reciboContainer = document.querySelector(
      `.${style.recibo_container}`
    );

    const filtroProduto = document.querySelector(`.${style.buscaProduto}`);
    const filtroCliente = document.querySelector(`.${style.buscaCliente}`);
    const campoData = document.querySelector(
      `.${style.campoData} input[type="date"]`
    );

    const dataOriginal = campoData.value;
    const [ano, mes, dia] = dataOriginal.split("-");
    const dataFormatada = `${dia}/${mes}/${ano}`;

    const spanData = document.createElement("span");
    spanData.textContent = dataFormatada;
    spanData.style.fontSize = "14px";
    spanData.style.padding = "5px";
    spanData.style.border = "1px solid #ccc";
    spanData.style.borderRadius = "4px";
    spanData.style.backgroundColor = "#ffffff";
    spanData.style.display = "inline-block";

    campoData.replaceWith(spanData);

    if (filtroProduto) filtroProduto.classList.add(style.ocultoParaPDF);
    if (filtroCliente) filtroCliente.classList.add(style.ocultoParaPDF);

    const opcoes = {
      scale: 6,
      useCORS: true,
      logging: true,
      allowTaint: true,
    };

    html2canvas(reciboContainer, opcoes).then((canvas) => {
      const imgData = canvas.toDataURL("image/png", 6.0);
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("recibo.pdf");

      if (filtroProduto) filtroProduto.classList.remove(style.ocultoParaPDF);
      if (filtroCliente) filtroCliente.classList.remove(style.ocultoParaPDF);

      spanData.replaceWith(campoData);
      campoData.value = dataOriginal;
    });
  };

  return (
    <Sidebar>
      <Topbar>
        {showAlert && (
          <div className={style.alertContainer}>
            <Alert
              variant={alertVariant}
              onClose={() => setShowAlert(false)}
              dismissible
            >
              {alertMessage}
            </Alert>
          </div>
        )}
        <div className={style.pagina_conteudo}>
          <div className={style.recibo_container}>
            <img src={microservice} alt="Logo" className={style.logo} />

            <div className={style.camposSuperiores}>
              <div className={style.campoPedido}>
                <label>N° Pedido:</label>
                <input type="text" value={`PED${Date.now()}`} readOnly />
              </div>
              <div className={style.campoData}>
                <label>Data:</label>
                <input
                  type="date"
                  value={data.split("-").reverse().join("-")}
                  onChange={(e) =>
                    setData(e.target.value.split("-").reverse().join("-"))
                  }
                />
              </div>
            </div>

            {mostrarFiltro && (
              <div className={style.filtros}>
                <div className={style.buscaCliente}>
                  <input
                    placeholder="Buscar Cliente por Nome..."
                    type="text"
                    value={buscaCliente}
                    onChange={handleChangeBuscaCliente}
                  />
                  {buscaCliente && clientesFiltrados.length > 0 && (
                    <ul className={style.listaClientes}>
                      {clientesFiltrados.map((cliente) => (
                        <li
                          key={cliente.id}
                          onClick={() => handleSelecionarCliente(cliente)}
                        >
                          {cliente.nome}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {clienteSelecionado && (
              <div className={style.dados_cliente}>
                <div className={style.coluna}>
                  <div className={style.campo_cliente}>
                    <span className={style.rotulo}>Nome:</span>
                    <span className={style.valor}>
                      {clienteSelecionado.nome}
                    </span>
                  </div>
                  <div className={style.campo_cliente}>
                    <span className={style.rotulo}>Endereço:</span>
                    <span className={style.valor}>
                      {clienteSelecionado.endereco}
                    </span>
                  </div>
                  <div className={style.campo_cliente}>
                    <span className={style.rotulo}>Bairro:</span>
                    <span className={style.valor}>
                      {clienteSelecionado.bairro}
                    </span>
                  </div>
                </div>
                <div className={style.coluna}>
                  <div className={style.campo_cliente}>
                    <span className={style.rotulo}>Cidade:</span>
                    <span className={style.valor}>
                      {clienteSelecionado.cidade}
                    </span>
                  </div>
                  <div className={style.campo_cliente}>
                    <span className={style.rotulo}>Telefone:</span>
                    <span className={style.valor}>
                      {clienteSelecionado.telefone}
                    </span>
                  </div>
                  <div className={style.campo_cliente}>
                    <span className={style.rotulo}>CNPJ/CPF:</span>
                    <span className={style.valor}>
                      {clienteSelecionado.cnpjCpf}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {clienteSelecionado && (
              <div className={style.filtros}>
                <div className={style.buscaProduto}>
                  <input
                    placeholder="Buscar Produto..."
                    type="text"
                    value={buscaProduto}
                    onChange={handleChangeBuscaProduto}
                  />
                  {buscaProduto && produtosFiltrados.length > 0 && (
                    <ul className={style.listaProdutos}>
                      {produtosFiltrados.map((produto) => (
                        <li
                          key={produto.id}
                          onClick={() => handleSelecionarProduto(produto)}
                        >
                          {produto.nome} - {produto.modelo}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <table className={style.tabela_produtos}>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Quantidade</th>
                  <th>Valor Unitário</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((produto, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={produto.nome}
                        onChange={(e) =>
                          atualizarProduto(index, "nome", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={produto.marca}
                        onChange={(e) =>
                          atualizarProduto(index, "marca", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={produto.modelo}
                        onChange={(e) =>
                          atualizarProduto(index, "modelo", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={produto.quantidade}
                        onChange={(e) =>
                          atualizarProduto(index, "quantidade", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={produto.preco}
                        onChange={(e) =>
                          atualizarProduto(index, "preco", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={produto.subtotal.toFixed(2)}
                        readOnly
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={style.total}>
              <strong>Total: R${total.toFixed(2)}</strong>
            </div>
          </div>

          <div className={style.botoes}>
            <button onClick={salvarRecibo} className={style.botaoSalvar}>
              Salvar
            </button>
            <button onClick={cancelarRecibo} className={style.botaoCancelar}>
              Cancelar
            </button>
            <button
              onClick={gerarPDF}
              className={style.botaoPDF}
              disabled={!reciboSalvo} // Desabilita o botão se o recibo não foi salvo
            >
              Gerar PDF
            </button>
          </div>
        </div>
      </Topbar>
    </Sidebar>
  );
}
