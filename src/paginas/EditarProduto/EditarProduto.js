import { useEffect, useState } from "react";
import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import style from "./EditarProduto.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import ProdutoApi from "../../services/produtoAPI";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/esm/Button";
import Alert from "react-bootstrap/Alert";
import { MdOutlineSave, MdCancel } from "react-icons/md";

export function EditarProduto() {
  const location = useLocation();
  const navigate = useNavigate();

  const [id] = useState(location.state); // Obtém o ID do produto da rota

  const [nome, setNome] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [preco, setPreco] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isFormValid()) {
      try {
        const produtoAtualizar = {
          Id: id,
          Nome: nome,
          Marca: marca,
          Modelo: modelo,
          Preco: parseFloat(preco),
          ClienteId: parseInt(clienteId),
        };
        console.log("Dados enviados:", produtoAtualizar); // Verifique o payload

        await ProdutoApi.atualizarAsync(produtoAtualizar);
        setAlertVariant("success");
        setAlertMessage("Produto atualizado com sucesso!");
        setShowAlert(true);
        setTimeout(() => {
          navigate("/produtos");
        }, 1000);
      } catch (error) {
        console.error("Erro ao atualizar produto", error);
        setAlertVariant("danger");
        setAlertMessage(
          error.response?.data?.message ||
            "Erro ao atualizar produto. Tente novamente."
        );
        setShowAlert(true);
      }
    } else {
      setAlertVariant("danger");
      setAlertMessage("Por favor, preencha todos os campos corretamente.");
      setShowAlert(true);
    }
  };

  const handleCancelar = () => {
    navigate("/produtos");
  };

  useEffect(() => {
    const buscarDadosProduto = async () => {
      try {
        const produto = await ProdutoApi.obterPorIdAsync(id);
        setNome(produto.nome);
        setMarca(produto.marca);
        setModelo(produto.modelo);
        setPreco(produto.preco.toString());
        setClienteId(produto.clienteId.toString());
      } catch (error) {
        console.error("Erro ao buscar dados do produto: ", error);
      }
    };

    buscarDadosProduto();
  }, [id]);

  const isFormValid = () => {
    return nome && marca && modelo && preco && clienteId;
  };

  return (
    <Sidebar>
      <Topbar>
        <div className={style.pagina_conteudo}>
          <h3>Editar Produto</h3>
          <Form onSubmit={handleSubmit}>
            {/* Campo Nome */}
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

            {/* Campo Cliente ID */}
            <Form.Group controlId="formClienteId" className="mb-3">
              <Form.Label>ID do Cliente</Form.Label>
              <Form.Control
                type="number"
                placeholder="Digite o ID do cliente"
                name="clienteId"
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                required
              />
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
