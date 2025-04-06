import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import style from "./Cliente.module.css";
import Table from "react-bootstrap/esm/Table";
import ClienteApi from "../../services/clienteAPI";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Paginacao } from "../../componentes/Paginacao/Paginacao";
import { RiEdit2Fill } from "react-icons/ri";
import { MdDeleteForever } from "react-icons/md";
import { formatarCpfCnpj, formatarTelefone } from "../../utils/formatters";

export function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregando, setCarregando] = useState(false);

  const limparFiltro = filtro.length > 0;

  const handleClickDeletar = (cliente) => {
    setClienteSelecionado(cliente);
    setMostrarModal(true);
  };

  const handleDeletar = async () => {
    try {
      await ClienteApi.deletarAsync(clienteSelecionado.id);
      // Recarrega os dados após deletar
      await carregarClientesPaginados();
    } catch (error) {
      console.error("Erro ao deletar cliente", error);
    } finally {
      handleFecharModal();
    }
  };

  const handleFecharModal = () => {
    setMostrarModal(false);
    setClienteSelecionado(null);
  };

  const handlePaginaChange = (novaPagina) => {
    setPaginaAtual(novaPagina);
  };

  const handleItensPorPaginaChange = (novosItens) => {
    setItensPorPagina(novosItens);
    setPaginaAtual(1); // Resetar para a primeira página
  };

  const carregarClientesPaginados = async () => {
    setCarregando(true);
    try {
      const dadosPaginados = await ClienteApi.listarPaginadoAsync(
        paginaAtual,
        itensPorPagina
      );

      setClientes(dadosPaginados.itens);
      setClientesFiltrados(dadosPaginados.itens);
      setTotalRegistros(dadosPaginados.totalRegistros);
      setTotalPaginas(dadosPaginados.totalPaginas);
    } catch (error) {
      console.error("Erro ao carregar clientes paginados:", error);
    } finally {
      setCarregando(false);
    }
  };

  const handleChangeFiltro = async (e) => {
    const valor = e.target.value;
    setFiltro(valor);

    if (valor) {
      try {
        // Para filtros, buscamos todos os clientes que correspondam
        const todosClientes = await ClienteApi.listarAsync(true);
        const filtrados = todosClientes.filter(
          (cliente) =>
            cliente.nome.toLowerCase().includes(valor.toLowerCase()) ||
            cliente.cnpjCpf.toLowerCase().includes(valor.toLowerCase())
        );
        setClientesFiltrados(filtrados);
      } catch (error) {
        console.error("Erro ao filtrar clientes:", error);
      }
    } else {
      // Se o filtro estiver vazio, volta a exibir os clientes paginados
      carregarClientesPaginados();
    }
  };

  const handleClearFiltro = () => {
    setFiltro("");
    carregarClientesPaginados();
  };

  // Carrega os clientes quando a página ou itens por página mudam
  useEffect(() => {
    carregarClientesPaginados();
  }, [paginaAtual, itensPorPagina]);

  return (
    <Sidebar>
      <Topbar>
        <div className={style.pagina_conteudo}>
          <div className={style.pagina_cabecalho}>
            <h3>Clientes</h3>
            <Link to="/cliente/novo" className={style.botao_novo}>
              + Novo
            </Link>
          </div>

          <div className={style.input}>
            <input
              placeholder="Buscar por Nome ou CNPJ/CPF..."
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

          <div className={style.tabela}>
            <Table responsive>
              <thead className={style.tabela_cabecalho}>
                <tr>
                  <th>Nome</th>
                  <th>Endereço</th>
                  <th>Bairro</th>
                  <th>Cidade</th>
                  <th>Telefone</th>
                  <th>CNPJ/CPF</th>
                  <th className={style.tabela_acoes}>Ações</th>
                </tr>
              </thead>

              <tbody className={style.tabela_corpo}>
                {carregando ? (
                  <tr>
                    <td colSpan="7" className={style.sem_registros}>
                      Carregando...
                    </td>
                  </tr>
                ) : clientesFiltrados.length > 0 ? (
                  clientesFiltrados.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>{cliente.nome}</td>
                      <td>{cliente.endereco}</td>
                      <td>{cliente.bairro}</td>
                      <td>{cliente.cidade}</td>
                      <td>{formatarTelefone(cliente.telefone)}</td>
                      <td>{formatarCpfCnpj(cliente.cnpjCpf)}</td>
                      <td>
                        <div className={style.botoes_tabela}>
                          <Link
                            to="/cliente/editar"
                            state={cliente.id}
                            className={style.botao_editar}
                          >
                            <RiEdit2Fill />
                          </Link>
                          <button
                            onClick={() => handleClickDeletar(cliente)}
                            className={style.botao_deletar}
                            aria-label={`Deletar cliente ${cliente.nome}`}
                          >
                            <MdDeleteForever />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className={style.sem_registros}>
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Componente de Paginação - só mostra quando não está filtrando */}
          {!filtro && (
            <Paginacao
              paginaAtual={paginaAtual}
              totalPaginas={totalPaginas}
              itensPorPagina={itensPorPagina}
              totalRegistros={totalRegistros}
              onPaginaChange={handlePaginaChange}
              onItensPorPaginaChange={handleItensPorPaginaChange}
            />
          )}

          <Modal show={mostrarModal} onHide={handleFecharModal}>
            <Modal.Header closeButton>
              <Modal.Title>Confirmar</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Tem certeza que deseja deletar o cliente{" "}
              {clienteSelecionado?.nome}?
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
