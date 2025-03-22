import React, { useState, useEffect } from "react";
import { Sidebar } from "../../componentes/Sidebar/Sidebar";
import { Topbar } from "../../componentes/Topbar/Topbar";
import style from "./Recibo.module.css";
import ClienteApi from "../../services/clienteAPI";
import ProdutoApi from "../../services/produtoAPI"; // Importe a API de produtos
import microservice from "../../assets/microservice.png"; // Importe a logo

export function Recibos() {
  // Estados para clientes
  const [clientes, setClientes] = useState([]); // Lista completa de clientes
  const [clientesFiltrados, setClientesFiltrados] = useState([]); // Clientes filtrados pelo nome
  const [clienteSelecionado, setClienteSelecionado] = useState(null); // Cliente selecionado
  const [buscaCliente, setBuscaCliente] = useState(""); // Texto digitado no campo de busca de cliente
  const [mostrarFiltro, setMostrarFiltro] = useState(true); // Controla a exibição do filtro

  // Estados para produtos
  const [produtosCliente, setProdutosCliente] = useState([]); // Lista de produtos do cliente
  const [produtosFiltrados, setProdutosFiltrados] = useState([]); // Produtos filtrados pelo nome
  const [produtoSelecionado, setProdutoSelecionado] = useState(null); // Produto selecionado
  const [buscaProduto, setBuscaProduto] = useState(""); // Texto digitado no campo de busca de produto
  const [produtos, setProdutos] = useState([]); // Lista de produtos adicionados
  const [total, setTotal] = useState(0); // Total do recibo

  // Carregar clientes ao montar o componente
  useEffect(() => {
    carregarClientes();
  }, []);

  // Função para carregar clientes
  const carregarClientes = async () => {
    try {
      const listaClientes = await ClienteApi.listarAsync(true); // Listar clientes ativos
      setClientes(listaClientes);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    }
  };

  // Função para carregar produtos do cliente
  const carregarProdutosCliente = async (clienteId) => {
    try {
      const produtos = await ProdutoApi.listarProdutosPorClienteAsync(
        clienteId
      ); // Usando a função correta da API
      setProdutosCliente(produtos);
      setProdutosFiltrados(produtos); // Inicialmente, exibe todos os produtos
    } catch (error) {
      console.error("Erro ao carregar produtos do cliente:", error);
    }
  };

  // Função para filtrar clientes pelo nome
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

  // Função para selecionar um cliente
  const handleSelecionarCliente = (cliente) => {
    setClienteSelecionado(cliente);
    setBuscaCliente(cliente.nome); // Preenche o campo de busca com o nome do cliente
    setClientesFiltrados([]); // Fecha a lista suspensa
    setMostrarFiltro(false); // Oculta o filtro após selecionar o cliente
    carregarProdutosCliente(cliente.id); // Carrega os produtos do cliente selecionado
  };

  // Função para reabrir o filtro
  const reabrirFiltro = () => {
    setMostrarFiltro(true);
    setBuscaCliente("");
    setClienteSelecionado(null);
    setProdutosCliente([]); // Limpa a lista de produtos
    setProdutoSelecionado(null); // Limpa o produto selecionado
  };

  // Função para filtrar produtos pelo nome
  const handleChangeBuscaProduto = (e) => {
    const valor = e.target.value;
    setBuscaProduto(valor);

    if (valor) {
      const filtrados = produtosCliente.filter((produto) =>
        produto.nome.toLowerCase().includes(valor.toLowerCase())
      );
      setProdutosFiltrados(filtrados);
    } else {
      setProdutosFiltrados([]); // Fecha a lista se o campo estiver vazio
    }
  };

  // Função para selecionar um produto
  const handleSelecionarProduto = (produto) => {
    setProdutoSelecionado(produto);
    setBuscaProduto(""); // Limpa o campo de busca
    setProdutosFiltrados([]); // Fecha a lista suspensa

    // Adiciona o produto à lista de produtos
    const novoProduto = {
      ...produto,
      quantidade: 1,
      subtotal: produto.preco * 1,
    };
    setProdutos([...produtos, novoProduto]);
    calcularTotal([...produtos, novoProduto]);
  };

  // Função para atualizar um produto na lista
  const atualizarProduto = (index, campo, valor) => {
    const novosProdutos = [...produtos];
    novosProdutos[index][campo] = valor;

    // Recalcula o subtotal se a quantidade ou o valor unitário mudar
    if (campo === "quantidade" || campo === "preco") {
      novosProdutos[index].subtotal =
        novosProdutos[index].quantidade * novosProdutos[index].preco;
    }

    setProdutos(novosProdutos);
    calcularTotal(novosProdutos);
  };

  // Função para calcular o total
  const calcularTotal = (produtos) => {
    const total = produtos.reduce((acc, produto) => acc + produto.subtotal, 0);
    setTotal(total);
  };

  // Função para cancelar o recibo e limpar todos os dados
  const cancelarRecibo = () => {
    setClienteSelecionado(null);
    setProdutos([]);
    setTotal(0);
    setBuscaCliente("");
    setBuscaProduto("");
    setProdutosFiltrados([]);
    setMostrarFiltro(true);
  };

  return (
    <Sidebar>
      <Topbar>
        <div className={style.pagina_conteudo}>
          <div className={style.recibo_container}>
            {/* Logo no canto superior esquerdo */}
            <img src={microservice} alt="Logo" className={style.logo} />

            {/* Botão "Alterar Cliente" no topo */}
            {clienteSelecionado && (
              <button onClick={reabrirFiltro} className={style.botao_alterar}>
                Alterar Cliente
              </button>
            )}

            {/* Filtro de cliente */}
            {mostrarFiltro && (
              <div className={style.filtros}>
                <div className={style.buscaCliente}>
                  <input
                    placeholder="Buscar Cliente por Nome..."
                    type="text"
                    value={buscaCliente}
                    onChange={handleChangeBuscaCliente}
                  />
                  {buscaCliente && clientesFiltrados.length > 0 && (
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
            )}

            {/* Dados do cliente selecionado */}
            {clienteSelecionado && (
              <div className={style.dados_cliente}>
                <div className={style.coluna}>
                  <div className={style.campo_cliente}>
                    <span className={style.rotulo}>Nome:</span>
                    <span className={style.valor}>
                      {clienteSelecionado.nome}
                    </span>
                  </div>
                  <div className={style.campo_cliente}>
                    <span className={style.rotulo}>Endereço:</span>
                    <span className={style.valor}>
                      {clienteSelecionado.endereco}
                    </span>
                  </div>
                  <div className={style.campo_cliente}>
                    <span className={style.rotulo}>Bairro:</span>
                    <span className={style.valor}>
                      {clienteSelecionado.bairro}
                    </span>
                  </div>
                </div>
                <div className={style.coluna}>
                  <div className={style.campo_cliente}>
                    <span className={style.rotulo}>Cidade:</span>
                    <span className={style.valor}>
                      {clienteSelecionado.cidade}
                    </span>
                  </div>
                  <div className={style.campo_cliente}>
                    <span className={style.rotulo}>Telefone:</span>
                    <span className={style.valor}>
                      {clienteSelecionado.telefone}
                    </span>
                  </div>
                  <div className={style.campo_cliente}>
                    <span className={style.rotulo}>CNPJ/CPF:</span>
                    <span className={style.valor}>
                      {clienteSelecionado.cnpjCpf}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Filtro de produtos */}
            {clienteSelecionado && (
              <div className={style.filtros}>
                <div className={style.buscaProduto}>
                  <input
                    placeholder="Buscar Produto..."
                    type="text"
                    value={buscaProduto}
                    onChange={handleChangeBuscaProduto}
                  />
                  {buscaProduto && produtosFiltrados.length > 0 && (
                    <ul className={style.listaProdutos}>
                      {produtosFiltrados.map((produto) => (
                        <li
                          key={produto.id}
                          onClick={() => handleSelecionarProduto(produto)}
                        >
                          {produto.nome} - {produto.modelo}{" "}
                          {/* Exibe descrição e modelo */}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Tabela de produtos */}
            <table className={style.tabela_produtos}>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Quantidade</th>
                  <th>Valor Unitário</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((produto, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={produto.nome}
                        onChange={(e) =>
                          atualizarProduto(index, "nome", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={produto.marca}
                        onChange={(e) =>
                          atualizarProduto(index, "marca", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={produto.modelo}
                        onChange={(e) =>
                          atualizarProduto(index, "modelo", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={produto.quantidade}
                        onChange={(e) =>
                          atualizarProduto(index, "quantidade", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={produto.preco}
                        onChange={(e) =>
                          atualizarProduto(index, "preco", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={produto.subtotal.toFixed(2)}
                        readOnly
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Botão Cancelar */}
            <button onClick={cancelarRecibo} className={style.botaoCancelar}>
              Cancelar
            </button>

            {/* Total */}
            <div className={style.total}>
              <strong>Total: R${total.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </Topbar>
    </Sidebar>
  );
}
