import { useState } from "react";
import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import style from "./NovoCliente.module.css";
import { useNavigate } from "react-router-dom";
import ClienteApi from "../../services/clienteAPI";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { MdOutlineSave, MdCancel } from "react-icons/md";

export function NovoCliente() {
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cnpjCpf, setCnpjCpf] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isFormValid()) {
      try {
        await ClienteApi.cadastrarAsync(
          nome,
          endereco,
          bairro,
          cidade,
          telefone,
          cnpjCpf
        );
        setAlertVariant("success");
        setAlertMessage("Cliente criado com sucesso!");
        setShowAlert(true);
        setTimeout(() => {
          navigate("/clientes");
        }, 1000);
      } catch (error) {
        console.error("Erro ao criar cliente", error);
        setAlertVariant("danger");
        setAlertMessage("Erro ao criar cliente. Tente novamente.");
        setShowAlert(true);
      }
    } else {
      setAlertVariant("danger");
      setAlertMessage("Por favor, preencha todos os campos corretamente.");
      setShowAlert(true);
    }
  };

  const handleCancelar = () => {
    navigate("/clientes");
  };

  const isFormValid = () => {
    return nome && endereco && bairro && cidade && telefone && cnpjCpf;
  };

  return (
    <Sidebar>
      <Topbar>
        <div className={style.pagina_conteudo}>
          <h3>Novo Cliente</h3>
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
