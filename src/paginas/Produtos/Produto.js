import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import { Link } from "react-router-dom";
import { MdDelete, MdEdit } from "react-icons/md";
import { useState, useEffect, useCallback } from "react";
import style from "./Produto.module.css";
import Table from "react-bootstrap/esm/Table";
import ProdutoApi from "../../services/produtoAPI";
import ClienteApi from "../../services/clienteAPI";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Paginacao } from "../../componentes/Paginacao/Paginacao";

export function Produtos() {
  const [todosProdutos, setTodosProdutos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [buscaCliente, setBuscaCliente] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina] = useState(10);
  const [totalRegistros, setTotalRegistros] = useState(0);

  const totalPaginas = Math.ceil(totalRegistros / itensPorPagina);
  const limparFiltro = filtro.length > 0 || clienteSelecionado !== null;

  const carregarProdutos = useCallback(async () => {
    try {
      setCarregando(true);
      const response = await ProdutoApi.listarPaginadoAsync(
        paginaAtual,
        itensPorPagina
      );
      setTodosProdutos(response.itens);
      setProdutos(response.itens);
      setTotalRegistros(response.totalRegistros);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setCarregando(false);
    }
  }, [paginaAtual, itensPorPagina]);

  const aplicarPaginacaoEFiltro = useCallback(() => {
    let produtosFiltrados = todosProdutos;

    // Aplica filtro por marca/modelo se existir
    if (filtro) {
      produtosFiltrados = todosProdutos.filter(
        (produto) =>
          produto.marca.toLowerCase().includes(filtro.toLowerCase()) ||
          produto.modelo.toLowerCase().includes(filtro.toLowerCase())
      );
    }

    // Aplica filtro por cliente se selecionado
    if (clienteSelecionado) {
      produtosFiltrados = produtosFiltrados.filter(
        (produto) => produto.clienteId === clienteSelecionado.id
      );
    }

    setProdutos(produtosFiltrados);
    setTotalRegistros(produtosFiltrados.length);
  }, [todosProdutos, filtro, clienteSelecionado]);

  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  useEffect(() => {
    aplicarPaginacaoEFiltro();
  }, [aplicarPaginacaoEFiltro, paginaAtual]);

  const handleClickDeletar = (produto) => {
    setProdutoSelecionado(produto);
    setMostrarModal(true);
  };

  const handleDeletar = async () => {
    try {
      await ProdutoApi.deletarAsync(produtoSelecionado.id);
      setTodosProdutos((prev) =>
        prev.filter((p) => p.id !== produtoSelecionado.id)
      );
      setTotalRegistros((prev) => prev - 1);
      aplicarPaginacaoEFiltro();
    } catch (error) {
      console.error("Erro ao deletar produto", error);
    } finally {
      setMostrarModal(false);
      setProdutoSelecionado(null);
    }
  };

  const handleFecharModal = () => {
    setMostrarModal(false);
    setProdutoSelecionado(null);
  };

  const handleChangeFiltro = (e) => {
    setFiltro(e.target.value);
    setPaginaAtual(1);
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
    setPaginaAtual(1);
  };

  const handleClearFiltro = () => {
    setFiltro("");
    setBuscaCliente("");
    setClienteSelecionado(null);
    setPaginaAtual(1);
  };

  const mudarPagina = (novaPagina) => {
    setPaginaAtual(novaPagina);
  };

  const carregarClientes = useCallback(async () => {
    try {
      const listaClientes = await ClienteApi.listarAsync(true);
      setClientes(listaClientes);
    } catch (error) {
      console.error("Erro ao carregar clientes: ", error);
    }
  }, []);

  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

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
            {carregando ? (
              <div className={style.carregando}>Carregando produtos...</div>
            ) : (
              <>
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
                    {produtos.length > 0 ? (
                      produtos.map((produto) => (
                        <tr key={produto.id}>
                          <td>{produto.nome}</td>
                          <td>{produto.marca}</td>
                          <td>{produto.modelo}</td>
                          <td>R$ {(produto.preco || 0).toFixed(2)}</td>
                          <td>
                            <div className={style.botoes_tabela}>
                              <Link
                                to="/produto/editar"
                                state={produto.id}
                                className={style.botao_editar}
                              >
                                <MdEdit />
                              </Link>
                              <button
                                onClick={() => handleClickDeletar(produto)}
                                className={style.botao_deletar}
                                aria-label={`Deletar produto ${produto.marca} ${produto.modelo}`}
                              >
                                <MdDelete />
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

                {totalRegistros > 0 && (
                  <div className={style.paginacao_container}>
                    <div className={style.contador_registros}>
                      Mostrando {(paginaAtual - 1) * itensPorPagina + 1} a{" "}
                      {Math.min(paginaAtual * itensPorPagina, totalRegistros)}{" "}
                      de {totalRegistros} produtos
                    </div>
                    <Paginacao
                      paginaAtual={paginaAtual}
                      totalPaginas={totalPaginas}
                      onMudarPagina={mudarPagina}
                    />
                  </div>
                )}
              </>
            )}
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
