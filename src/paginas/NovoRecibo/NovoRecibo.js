import { useState, useEffect } from "react";
import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import style from "./NovoRecibo.module.css";
import { useNavigate } from "react-router-dom";
import ReciboApi from "../../services/ReciboAPI";
import ClienteApi from "../../services/clienteAPI";
import ProdutoApi from "../../services/produtoAPI";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { MdOutlineSave, MdCancel } from "react-icons/md";

export function NovoRecibo() {
  const [numeroPedido, setNumeroPedido] = useState("");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [descricao, setDescricao] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [buscaCliente, setBuscaCliente] = useState("");
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [buscaProduto, setBuscaProduto] = useState("");
  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const navigate = useNavigate();

  // Carrega clientes e produtos ao montar o componente
  useEffect(() => {
    const carregarClientes = async () => {
      try {
        const listaClientes = await ClienteApi.listarAsync(true);
        setClientes(listaClientes);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      }
    };

    const carregarProdutos = async () => {
      try {
        const listaProdutos = await ProdutoApi.listarAsync(true);
        setProdutos(listaProdutos);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      }
    };

    carregarClientes();
    carregarProdutos();
  }, []);

  // Filtra clientes pelo nome
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

  // Seleciona um cliente
  const handleSelecionarCliente = (cliente) => {
    setClienteId(cliente.id);
    setBuscaCliente(cliente.nome);
    setClientesFiltrados([]);
  };

  // Filtra produtos pelo nome
  const handleChangeBuscaProduto = (e) => {
    const valor = e.target.value;
    setBuscaProduto(valor);

    if (valor) {
      const filtrados = produtos.filter((produto) =>
        produto.nome.toLowerCase().includes(valor.toLowerCase())
      );
      setProdutosFiltrados(filtrados);
    } else {
      setProdutosFiltrados([]);
    }
  };

  // Adiciona um produto ao recibo
  const handleAdicionarProduto = (produto) => {
    const novoItem = {
      produtoId: produto.id,
      nome: produto.nome,
      quantidade: 1,
      precoUnitario: produto.preco,
      subtotal: produto.preco,
    };

    setItens([...itens, novoItem]);
    setBuscaProduto("");
    setProdutosFiltrados([]);
    calcularTotal([...itens, novoItem]);
  };

  // Atualiza a quantidade de um item
  const handleAtualizarQuantidade = (index, quantidade) => {
    const novosItens = [...itens];
    novosItens[index].quantidade = quantidade;
    novosItens[index].subtotal = quantidade * novosItens[index].precoUnitario;
    setItens(novosItens);
    calcularTotal(novosItens);
  };

  // Remove um item do recibo
  const handleRemoverItem = (index) => {
    const novosItens = itens.filter((_, i) => i !== index);
    setItens(novosItens);
    calcularTotal(novosItens);
  };

  // Calcula o total do recibo
  const calcularTotal = (itens) => {
    const total = itens.reduce((acc, item) => acc + item.subtotal, 0);
    setTotal(total);
  };

  // Submete o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isFormValid()) {
      try {
        const recibo = {
          numeroPedido,
          data,
          descricao,
          clienteId,
          itens,
          total,
        };

        await ReciboApi.cadastrarAsync(recibo);
        setAlertVariant("success");
        setAlertMessage("Recibo criado com sucesso!");
        setShowAlert(true);
        setTimeout(() => {
          navigate("/recibos");
        }, 1000);
      } catch (error) {
        console.error("Erro ao criar recibo:", error);
        setAlertVariant("danger");
        setAlertMessage("Erro ao criar recibo. Tente novamente.");
        setShowAlert(true);
      }
    } else {
      setAlertVariant("danger");
      setAlertMessage("Por favor, preencha todos os campos corretamente.");
      setShowAlert(true);
    }
  };

  const handleCancelar = () => {
    navigate("/recibos");
  };

  const isFormValid = () => {
    return numeroPedido && data && descricao && clienteId && itens.length > 0;
  };

  return (
    <Sidebar>
      <Topbar>
        <div className={style.pagina_conteudo}>
          <h3>Novo Recibo</h3>
          <Form onSubmit={handleSubmit}>
            {/* Campo Número do Pedido */}
            <Form.Group controlId="formNumeroPedido" className="mb-3">
              <Form.Label>Número do Pedido</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o número do pedido"
                value={numeroPedido}
                onChange={(e) => setNumeroPedido(e.target.value)}
                required
              />
            </Form.Group>

            {/* Campo Data */}
            <Form.Group controlId="formData" className="mb-3">
              <Form.Label>Data</Form.Label>
              <Form.Control
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
              />
            </Form.Group>

            {/* Campo Descrição */}
            <Form.Group controlId="formDescricao" className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Digite a descrição do serviço"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
              />
            </Form.Group>

            {/* Campo Cliente */}
            <Form.Group controlId="formCliente" className="mb-3">
              <Form.Label>Cliente</Form.Label>
              <div className={style.buscaCliente}>
                <input
                  type="text"
                  placeholder="Buscar cliente por nome"
                  value={buscaCliente}
                  onChange={handleChangeBuscaCliente}
                  required
                />
                {clientesFiltrados.length > 0 && (
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
            </Form.Group>

            {/* Campo Produtos */}
            <Form.Group controlId="formProduto" className="mb-3">
              <Form.Label>Produtos</Form.Label>
              <div className={style.buscaProduto}>
                <input
                  type="text"
                  placeholder="Buscar produto por nome"
                  value={buscaProduto}
                  onChange={handleChangeBuscaProduto}
                />
                {produtosFiltrados.length > 0 && (
                  <ul className={style.listaProdutos}>
                    {produtosFiltrados.map((produto) => (
                      <li
                        key={produto.id}
                        onClick={() => handleAdicionarProduto(produto)}
                      >
                        {produto.nome} - R$ {produto.preco.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Form.Group>

            {/* Lista de Itens */}
            {itens.length > 0 && (
              <div className={style.listaItens}>
                <h5>Itens do Recibo</h5>
                {itens.map((item, index) => (
                  <div key={index} className={style.item}>
                    <span>{item.nome}</span>
                    <input
                      type="number"
                      value={item.quantidade}
                      onChange={(e) =>
                        handleAtualizarQuantidade(
                          index,
                          parseInt(e.target.value)
                        )
                      }
                      min="1"
                    />
                    <span>R$ {item.precoUnitario.toFixed(2)}</span>
                    <span>R$ {item.subtotal.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoverItem(index)}
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            <div className={style.total}>
              <h5>Total: R$ {total.toFixed(2)}</h5>
            </div>

            {/* Botões Salvar e Cancelar */}
            <Button
              className={style.botao_salvar}
              variant="primary"
              type="submit"
              disabled={!isFormValid()}
            >
              <MdOutlineSave /> Salvar
            </Button>
            <Button
              className={style.botao_cancelar}
              variant="danger"
              onClick={handleCancelar}
            >
              <MdCancel /> Cancelar
            </Button>
          </Form>

          {/* Alerta */}
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
        </div>
      </Topbar>
    </Sidebar>
  );
}
