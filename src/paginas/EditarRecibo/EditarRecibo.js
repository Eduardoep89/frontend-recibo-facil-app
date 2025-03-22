import { useEffect, useState } from "react";
import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import style from "./EditarRecibo.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import ReciboApi from "../../services/ReciboAPI";
import ClienteApi from "../../services/clienteAPI";
import ProdutoApi from "../../services/produtoAPI";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { MdOutlineSave, MdCancel } from "react-icons/md";

export function EditarRecibo() {
  const location = useLocation();
  const navigate = useNavigate();
  const [id] = useState(location.state); // Obtém o ID do recibo da rota

  const [numeroPedido, setNumeroPedido] = useState("");
  const [data, setData] = useState("");
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

  // Carrega os dados do recibo ao montar o componente
  useEffect(() => {
    const carregarRecibo = async () => {
      try {
        const recibo = await ReciboApi.obterPorIdAsync(id);
        setNumeroPedido(recibo.numeroPedido);
        setData(recibo.data.split("T")[0]);
        setDescricao(recibo.descricao);
        setClienteId(recibo.clienteId);
        setItens(recibo.itens);
        setTotal(recibo.total);
      } catch (error) {
        console.error("Erro ao carregar recibo:", error);
      }
    };

    carregarRecibo();
  }, [id]);

  // Restante do código semelhante ao NovoRecibo.js...
  // (Implemente as mesmas funções de filtro, adição de produtos, etc.)

  return (
    <Sidebar>
      <Topbar>
        <div className={style.pagina_conteudo}>
          <h3>Editar Recibo</h3>
          <Form onSubmit={handleSubmit}>
            {/* Campos e lógica semelhantes ao NovoRecibo.js */}
          </Form>
        </div>
      </Topbar>
    </Sidebar>
  );
}
