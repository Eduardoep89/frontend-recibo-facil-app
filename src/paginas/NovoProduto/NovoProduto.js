import { useState, useEffect } from "react";
import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import style from "./NovoProduto.module.css";
import { useNavigate } from "react-router-dom";
import ProdutoApi from "../../services/produtoAPI"; // Importe o ProdutoApi
import ClienteApi from "../../services/clienteAPI"; // Importe o ClienteApi para buscar clientes
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert"; // Importação do Alert
import { MdOutlineSave, MdCancel } from "react-icons/md";

export function NovoProduto() {
  const [nome, setNome] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [preco, setPreco] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [clientes, setClientes] = useState([]); // Lista completa de clientes
  const [clientesFiltrados, setClientesFiltrados] = useState([]); // Clientes filtrados pelo nome
  const [buscaCliente, setBuscaCliente] = useState(""); // Texto digitado no campo de busca de cliente
  const [showAlert, setShowAlert] = useState(false); // Estado para controlar o alerta
  const [alertVariant, setAlertVariant] = useState("success"); // Estado para o tipo de alerta
  const [alertMessage, setAlertMessage] = useState(""); // Estado para a mensagem do alerta

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isFormValid()) {
      try {
        // Cria o produto
        await ProdutoApi.cadastrarAsync(nome, marca, modelo, preco, clienteId);
        setAlertVariant("success"); // Alerta de sucesso
        setAlertMessage("Produto criado com sucesso!");
        setShowAlert(true); // Exibe o alerta
        setTimeout(() => {
          navigate("/produtos"); // Redireciona após 1 segundo
        }, 1000);
      } catch (error) {
        console.error("Erro ao criar produto", error);
        setAlertVariant("danger"); // Alerta de erro
        setAlertMessage("Erro ao criar produto. Tente novamente.");
        setShowAlert(true); // Exibe o alerta
      }
    } else {
      setAlertVariant("danger"); // Alerta de erro
      setAlertMessage("Por favor, preencha todos os campos corretamente.");
      setShowAlert(true); // Exibe o alerta
    }
  };

  const handleCancelar = () => {
    navigate("/produtos");
  };

  const isFormValid = () => {
    return nome && marca && modelo && preco && clienteId;
  };

  // Busca a lista de clientes ao carregar o componente
  useEffect(() => {
    const buscarClientes = async () => {
      try {
        const listaClientes = await ClienteApi.listarAsync(true); // Busca todos os clientes ativos
        setClientes(listaClientes);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      }
    };

    buscarClientes();
  }, []);

  // Filtra a lista de clientes conforme o texto digitado
  const handleChangeBuscaCliente = (e) => {
    const valor = e.target.value;
    setBuscaCliente(valor);

    if (valor) {
      const filtrados = clientes.filter((cliente) =>
        cliente.nome.toLowerCase().includes(valor.toLowerCase())
      );
      setClientesFiltrados(filtrados);
    } else {
      setClientesFiltrados([]); // Limpa a lista se o campo estiver vazio
    }
  };

  // Seleciona um cliente da lista
  const handleSelecionarCliente = (cliente) => {
    setClienteId(cliente.id); // Define o ID do cliente
    setBuscaCliente(cliente.nome); // Exibe o nome do cliente no campo de busca
    setClientesFiltrados([]); // Fecha a lista suspensa
  };

  return (
    <Sidebar>
      <Topbar>
        <div className={style.pagina_conteudo}>
          <h3>Novo Produto/Serviço</h3>
          <Form onSubmit={handleSubmit}>
            {/* Campo Nome */}
            <Form.Group controlId="formNome" className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite a descrição "
                name="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </Form.Group>

            {/* Campo Marca */}
            <Form.Group controlId="formMarca" className="mb-3">
              <Form.Label>Marca</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite a marca"
                name="marca"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                required
              />
            </Form.Group>

            {/* Campo Modelo */}
            <Form.Group controlId="formModelo" className="mb-3">
              <Form.Label>Modelo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o modelo"
                name="modelo"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                required
              />
            </Form.Group>

            {/* Campo Preço */}
            <Form.Group controlId="formPreco" className="mb-3">
              <Form.Label>Preço</Form.Label>
              <Form.Control
                type="number"
                placeholder="Digite o preço"
                name="preco"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                required
              />
            </Form.Group>

            {/* Campo Cliente (Busca por nome) */}
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

          {/* Alerta personalizado */}
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
