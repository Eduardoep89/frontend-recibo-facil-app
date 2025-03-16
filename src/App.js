import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./paginas/Home/Home";
import { Clientes } from "./paginas/Clientes/Cliente";
import { Produtos } from "./paginas/Produtos/Produto";
import { Recibos } from "./paginas/Recibos/Recibo";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/recibos" element={<Recibos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
