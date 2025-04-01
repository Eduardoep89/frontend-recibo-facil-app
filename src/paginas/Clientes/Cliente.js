import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import { Link } from "react-router-dom";
import { MdDelete, MdEdit } from "react-icons/md";
import { useState, useEffect, useCallback } from "react";
import style from "./Cliente.module.css";
import Table from "react-bootstrap/esm/Table";
import ClienteApi from "../../services/clienteAPI";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Paginacao } from "../../componentes/Paginacao/Paginacao";

export function Clientes() {
  const [todosClientes, setTodosClientes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina] = useState(10);
  const [totalRegistros, setTotalRegistros] = useState(0);

  const totalPaginas = Math.ceil(totalRegistros / itensPorPagina);
  const limparFiltro = filtro.length > 0;

  const carregarClientes = useCallback(async () => {
    try {
      setCarregando(true);
      const todosClientesAtivos = await ClienteApi.listarAsync(true);
      setTodosClientes(todosClientesAtivos);
      setTotalRegistros(todosClientesAtivos.length);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setCarregando(false);
    }
  }, []);

  const aplicarPaginacaoEFiltro = useCallback(() => {
    let clientesFiltrados = todosClientes;

    if (filtro) {
      clientesFiltrados = todosClientes.filter(
        (cliente) =>
          cliente.nome.toLowerCase().includes(filtro.toLowerCase()) ||
          cliente.cnpjCpf.toLowerCase().includes(filtro.toLowerCase())
      );
    }

    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    setClientes(clientesFiltrados.slice(inicio, fim));
    setTotalRegistros(clientesFiltrados.length);
  }, [todosClientes, filtro, paginaAtual, itensPorPagina]);

  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

  useEffect(() => {
    aplicarPaginacaoEFiltro();
  }, [aplicarPaginacaoEFiltro]);

  const handleClickDeletar = (cliente) => {
    setClienteSelecionado(cliente);
    setMostrarModal(true);
  };

  const handleDeletar = async () => {
    try {
      await ClienteApi.deletarAsync(clienteSelecionado.id);
      setTodosClientes((prev) =>
        prev.filter((c) => c.id !== clienteSelecionado.id)
      );
      setTotalRegistros((prev) => prev - 1);
    } catch (error) {
      console.error("Erro ao deletar cliente", error);
    } finally {
      setMostrarModal(false);
      setClienteSelecionado(null);
    }
  };

  const handleChangeFiltro = (e) => {
    setFiltro(e.target.value);
    setPaginaAtual(1);
  };

  const handleClearFiltro = () => {
    setFiltro("");
    setPaginaAtual(1);
  };

  const mudarPagina = (novaPagina) => {
    setPaginaAtual(novaPagina);
  };

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
            {carregando ? (
              <div className={style.carregando}>Carregando clientes...</div>
            ) : (
              <>
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
                    {clientes.length > 0 ? (
                      clientes.map((cliente) => (
                        <tr key={cliente.id}>
                          <td>{cliente.nome}</td>
                          <td>{cliente.endereco}</td>
                          <td>{cliente.bairro}</td>
                          <td>{cliente.cidade}</td>
                          <td>{cliente.telefone}</td>
                          <td>{cliente.cnpjCpf}</td>
                          <td>
                            <div className={style.botoes_tabela}>
                              <Link
                                to="/cliente/editar"
                                state={cliente.id}
                                className={style.botao_editar}
                              >
                                <MdEdit />
                              </Link>
                              <button
                                onClick={() => handleClickDeletar(cliente)}
                                className={style.botao_deletar}
                                aria-label={`Deletar cliente ${cliente.nome}`}
                              >
                                <MdDelete />
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

                {totalRegistros > 0 && (
                  <div className={style.paginacao_container}>
                    <div className={style.contador_registros}>
                      Mostrando {(paginaAtual - 1) * itensPorPagina + 1} a{" "}
                      {Math.min(paginaAtual * itensPorPagina, totalRegistros)}{" "}
                      de {totalRegistros} clientes
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

          <Modal show={mostrarModal} onHide={() => setMostrarModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Confirmar</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Tem certeza que deseja deletar o cliente{" "}
              {clienteSelecionado?.nome}?
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setMostrarModal(false)}
              >
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
