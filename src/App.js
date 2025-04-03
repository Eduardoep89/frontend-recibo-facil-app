import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./paginas/Login/Login";
import { Home } from "./paginas/Home/Home";
import { Clientes } from "./paginas/Clientes/Cliente";
import { Produtos } from "./paginas/Produtos/Produto";
import { Recibos } from "./paginas/Recibos/Recibo";
import { EditarCliente } from "./paginas/EditarCliente/EditarCliente";
import { NovoCliente } from "./paginas/NovoCliente/NovoCliente";
import { EditarProduto } from "./paginas/EditarProduto/EditarProduto";
import { NovoProduto } from "./paginas/NovoProduto/NovoProduto";
import { Relatorios } from "./paginas/Relatorios/RelatorioIA";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./componentes/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clientes"
            element={
              <ProtectedRoute>
                <Clientes />
              </ProtectedRoute>
            }
          />

          {/* Proteja todas as outras rotas da mesma forma */}
          <Route
            path="/produtos"
            element={
              <ProtectedRoute>
                <Produtos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recibos"
            element={
              <ProtectedRoute>
                <Recibos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cliente/editar"
            element={
              <ProtectedRoute>
                <EditarCliente />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cliente/novo"
            element={
              <ProtectedRoute>
                <NovoCliente />
              </ProtectedRoute>
            }
          />

          <Route
            path="/produto/editar"
            element={
              <ProtectedRoute>
                <EditarProduto />
              </ProtectedRoute>
            }
          />

          <Route
            path="/produto/novo"
            element={
              <ProtectedRoute>
                <NovoProduto />
              </ProtectedRoute>
            }
          />

          <Route
            path="/relatorios"
            element={
              <ProtectedRoute>
                <Relatorios />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
