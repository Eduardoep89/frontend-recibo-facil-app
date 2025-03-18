import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./paginas/Home/Home";
import { Clientes } from "./paginas/Clientes/Cliente";
import { Produtos } from "./paginas/Produtos/Produto";
import { Recibos } from "./paginas/Recibos/Recibo";
import { EditarCliente } from "./paginas/EditarCliente/EditarCliente";
import { NovoCliente } from "./paginas/NovoCliente/NovoCliente";
import { EditarProduto } from "./paginas/EditarProduto/EditarProduto";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/recibos" element={<Recibos />} />
        <Route path="/cliente/editar" element={<EditarCliente />} />
        <Route path="/cliente/novo" element={<NovoCliente />} />
        <Route path="/produto/editar" element={<EditarProduto />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
