import { useEffect, useState } from "react";
import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import style from "./EditarCliente.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import ClienteApi from "../../services/clienteAPI"; // Importe o ClienteApi
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/esm/Button";
import Alert from "react-bootstrap/Alert"; // Importação do Alert
import { MdOutlineSave, MdCancel } from "react-icons/md";

export function EditarCliente() {
  const location = useLocation();
  const navigate = useNavigate();

  const [id] = useState(location.state); // Obtém o ID do cliente da rota

  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cnpjCpf, setCnpjCpf] = useState("");
  const [showAlert, setShowAlert] = useState(false); // Estado para controlar o alerta
  const [alertVariant, setAlertVariant] = useState("success"); // Estado para o tipo de alerta
  const [alertMessage, setAlertMessage] = useState(""); // Estado para a mensagem do alerta

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isFormValid()) {
      try {
        // Atualiza o cliente
        await ClienteApi.atualizarAsync(
          id,
          nome,
          endereco,
          bairro,
          cidade,
          telefone,
          cnpjCpf
        );
        setAlertVariant("success"); // Alerta de sucesso
        setAlertMessage("Cliente atualizado com sucesso!");
        setShowAlert(true); // Exibe o alerta
        setTimeout(() => {
          navigate("/clientes"); // Redireciona após 1 segundo
        }, 1000);
      } catch (error) {
        console.error("Erro ao atualizar cliente", error);
        setAlertVariant("danger"); // Alerta de erro
        setAlertMessage("Erro ao atualizar cliente. Tente novamente.");
        setShowAlert(true); // Exibe o alerta
      }
    } else {
      setAlertVariant("danger"); // Alerta de erro
      setAlertMessage("Por favor, preencha todos os campos corretamente.");
      setShowAlert(true); // Exibe o alerta
    }
  };

  const handleCancelar = () => {
    navigate("/clientes");
  };

  useEffect(() => {
    const buscarDadosCliente = async () => {
      try {
        const cliente = await ClienteApi.obterPorIdAsync(id); // Busca os dados do cliente
        setNome(cliente.nome);
        setEndereco(cliente.endereco);
        setBairro(cliente.bairro);
        setCidade(cliente.cidade);
        setTelefone(cliente.telefone);
        setCnpjCpf(cliente.cnpjCpf);
      } catch (error) {
        console.error("Erro ao buscar dados do cliente: ", error);
      }
    };

    buscarDadosCliente();
  }, [id]);

  const isFormValid = () => {
    return nome && endereco && bairro && cidade && telefone && cnpjCpf;
  };

  return (
    <Sidebar>
      <Topbar>
        <div className={style.pagina_conteudo}>
          <h3>Editar Cliente</h3>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formNome" className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o nome"
                name="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formEndereco" className="mb-3">
              <Form.Label>Endereço</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o endereço"
                name="endereco"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formBairro" className="mb-3">
              <Form.Label>Bairro</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o bairro"
                name="bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formCidade" className="mb-3">
              <Form.Label>Cidade</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite a cidade"
                name="cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formTelefone" className="mb-3">
              <Form.Label>Telefone</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o telefone"
                name="telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formCnpjCpf" className="mb-3">
              <Form.Label>CNPJ/CPF</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o CNPJ/CPF"
                name="cnpjCpf"
                value={cnpjCpf}
                onChange={(e) => setCnpjCpf(e.target.value)}
                required
              />
            </Form.Group>

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
