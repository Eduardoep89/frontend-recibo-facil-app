import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import { Link } from "react-router-dom";
import { MdDelete, MdEdit } from "react-icons/md";
import { useState, useEffect } from "react";
import style from "./Cliente.module.css";
import Table from "react-bootstrap/esm/Table";
import ClienteApi from "../../services/clienteAPI";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export function Clientes() {
  const [clientes, setClientes] = useState([]); // Armazena os 10 primeiros clientes
  const [clientesFiltrados, setClientesFiltrados] = useState([]); // Armazena os clientes filtrados
  const [filtro, setFiltro] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const limparFiltro = filtro.length > 0;

  const handleClickDeletar = (cliente) => {
    setClienteSelecionado(cliente);
    setMostrarModal(true);
  };

  const handleDeletar = async () => {
    try {
      await ClienteApi.deletarAsync(clienteSelecionado.id);
      setClientes((prevClientes) =>
        prevClientes.filter((c) => c.id !== clienteSelecionado.id)
      );
      setClientesFiltrados((prevFiltrados) =>
        prevFiltrados.filter((c) => c.id !== clienteSelecionado.id)
      );
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

  const handleChangeFiltro = async (e) => {
    const valor = e.target.value;
    setFiltro(valor);

    if (valor) {
      // Se houver filtro, busca todos os clientes que correspondam ao critério
      try {
        const clientesFiltrados = await ClienteApi.listarAsync(true); // Busca todos os clientes
        const filtrados = clientesFiltrados.filter(
          (cliente) =>
            cliente.nome.toLowerCase().includes(valor.toLowerCase()) ||
            cliente.cnpjCpf.toLowerCase().includes(valor.toLowerCase())
        );
        setClientesFiltrados(filtrados);
      } catch (error) {
        console.error("Erro ao filtrar clientes:", error);
      }
    } else {
      // Se o filtro estiver vazio, volta a exibir os 10 primeiros clientes
      setClientesFiltrados(clientes);
    }
  };

  const handleClearFiltro = () => {
    setFiltro("");
    setClientesFiltrados(clientes); // Volta a exibir os 10 primeiros clientes
  };

  async function carregarClientes() {
    try {
      // Busca os 10 primeiros clientes
      const listaClientes = await ClienteApi.listarTop10Async(); // Correção para chamar o método correto
      console.log("Clientes retornados:", listaClientes); // Log para depuração

      if (listaClientes && listaClientes.length > 0) {
        setClientes(listaClientes); // Atualiza o estado com os 10 primeiros clientes
        setClientesFiltrados(listaClientes); // Exibe os 10 primeiros clientes inicialmente
      } else {
        console.error("A resposta da API não contém clientes válidos.");
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    }
  }

  // Usando useEffect para carregar os 10 primeiros clientes ao montar o componente
  useEffect(() => {
    carregarClientes();
  }, []);

  // Verifica se o filtro está vazio para voltar os clientes iniciais
  useEffect(() => {
    if (filtro === "") {
      setClientesFiltrados(clientes); // Restaura a lista de clientes filtrados para os 10 primeiros
    }
  }, [clientes, filtro]); // Atualiza clientesFiltrados quando 'clientes' ou 'filtro' mudar

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
              placeholder="Buscar por Nome ou CNPJ/CPF"
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
                {clientesFiltrados.length > 0 ? (
                  clientesFiltrados.map((cliente) => (
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
          </div>

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
