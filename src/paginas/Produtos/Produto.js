import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import style from "./Produto.module.css";
import Table from "react-bootstrap/esm/Table";
import ProdutoApi from "../../services/produtoAPI";
import ClienteApi from "../../services/clienteAPI";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { RiEdit2Fill } from "react-icons/ri";
import { MdDeleteForever } from "react-icons/md";
import { formatarMoeda } from "../../utils/formatters";

export function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [filtro, setFiltro] = useState(""); // Filtro por marca e modelo
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [buscaCliente, setBuscaCliente] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const limparFiltro = filtro.length > 0 || clienteSelecionado !== null;

  const handleClickDeletar = (produto) => {
    setProdutoSelecionado(produto);
    setMostrarModal(true);
  };

  const handleDeletar = async () => {
    try {
      await ProdutoApi.deletarAsync(produtoSelecionado.id);
      setProdutos((prevProdutos) =>
        prevProdutos.filter((p) => p.id !== produtoSelecionado.id)
      );
      setProdutosFiltrados((prevFiltrados) =>
        prevFiltrados.filter((p) => p.id !== produtoSelecionado.id)
      );
    } catch (error) {
      console.error("Erro ao deletar produto", error);
    } finally {
      handleFecharModal();
    }
  };

  const handleFecharModal = () => {
    setMostrarModal(false);
    setProdutoSelecionado(null);
  };

  const handleChangeFiltro = async (e) => {
    const valor = e.target.value;
    setFiltro(valor);

    if (valor) {
      try {
        // Busca todos os produtos ativos
        const produtosAtivos = await ProdutoApi.listarAsync(true);
        const filtrados = produtosAtivos.filter(
          (produto) =>
            produto.ativo && // Filtra apenas produtos ativos
            (produto.marca.toLowerCase().includes(valor.toLowerCase()) ||
              produto.modelo.toLowerCase().includes(valor.toLowerCase()))
        );
        setProdutosFiltrados(filtrados);
      } catch (error) {
        console.error("Erro ao filtrar produtos:", error);
      }
    } else {
      // Se o filtro estiver vazio, mostra todos os produtos ativos ou filtra por cliente
      if (clienteSelecionado) {
        filtrarPorCliente(clienteSelecionado.id);
      } else {
        const produtosAtivos = await ProdutoApi.listarAsync(true); // Busca apenas produtos ativos
        setProdutosFiltrados(produtosAtivos);
      }
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
    filtrarPorCliente(cliente.id);
  };

  const filtrarPorCliente = async (clienteId) => {
    try {
      const produtosDoCliente = await ProdutoApi.listarProdutosPorClienteAsync(
        clienteId
      );
      setProdutosFiltrados(produtosDoCliente);
    } catch (error) {
      console.error("Erro ao filtrar produtos por cliente:", error);
    }
  };

  const handleClearFiltro = () => {
    setFiltro("");
    setBuscaCliente("");
    setClienteSelecionado(null);
    setProdutosFiltrados(produtos); // Volta a exibir os 10 primeiros produtos
  };

  async function carregarProdutos() {
    try {
      // Busca os 10 primeiros produtos é o Procedure que criei no sql
      const listaProdutos = await ProdutoApi.listarTop10ProdutosAsync();
      console.log("Produtos retornados:", listaProdutos);

      if (listaProdutos && listaProdutos.length > 0) {
        setProdutos(listaProdutos);
        setProdutosFiltrados(listaProdutos);
      } else {
        console.error("A resposta da API não contém produtos válidos.");
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
  }

  // Usando useEffect para carregar os 10 primeiros produtos ao montar o componente
  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarClientes() {
    try {
      const listaClientes = await ClienteApi.listarAsync(true);
      setClientes(listaClientes);
    } catch (error) {
      console.error("Erro ao carregar clientes: ", error);
    }
  }

  useEffect(() => {
    carregarProdutos();
    carregarClientes();
  }, []);

  return (
    <Sidebar>
      <Topbar>
        <div className={style.pagina_conteudo}>
          <div className={style.pagina_cabecalho}>
            <h3>Produtos/Serviços</h3>
            <Link to="/produto/novo" className={style.botao_novo}>
              + Novo
            </Link>
          </div>

          <div className={style.filtros}>
            <div className={style.input}>
              <input
                placeholder="Buscar por Marca ou Modelo..."
                type="text"
                name="filtro"
                value={filtro}
                onChange={handleChangeFiltro}
              />
              {limparFiltro && (
                <button className={style.button} onClick={handleClearFiltro}>
                  X
                </button>
              )}
            </div>

            <div className={style.buscaCliente}>
              <input
                placeholder="Buscar Cliente por Nome..."
                type="text"
                value={buscaCliente}
                onChange={handleChangeBuscaCliente}
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
          </div>

          <div className={style.tabela}>
            <Table responsive>
              <thead className={style.tabela_cabecalho}>
                <tr>
                  <th>Descrição</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Preço</th>
                  <th className={style.tabela_acoes}>Ações</th>
                </tr>
              </thead>

              <tbody className={style.tabela_corpo}>
                {produtosFiltrados.length > 0 ? (
                  produtosFiltrados.map((produto) => (
                    <tr key={produto.id}>
                      <td>{produto.nome}</td>
                      <td>{produto.marca}</td>
                      <td>{produto.modelo}</td>
                      <td>{formatarMoeda(produto.preco)}</td>
                      <td>
                        <div className={style.botoes_tabela}>
                          <Link
                            to="/produto/editar"
                            state={produto.id}
                            className={style.botao_editar}
                          >
                            <RiEdit2Fill />
                          </Link>
                          <button
                            onClick={() => handleClickDeletar(produto)}
                            className={style.botao_deletar}
                            aria-label={`Deletar produto ${produto.marca} ${produto.modelo}`}
                          >
                            <MdDeleteForever />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className={style.sem_registros}>
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          <Modal show={mostrarModal} onHide={handleFecharModal}>
            <Modal.Header closeButton>
              <Modal.Title>Confirmar</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Tem certeza que deseja deletar o produto{" "}
              {produtoSelecionado?.marca} {produtoSelecionado?.modelo}?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleFecharModal}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleDeletar}>
                Deletar
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </Topbar>
    </Sidebar>
  );
}
