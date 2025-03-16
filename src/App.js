import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./paginas/Home/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
