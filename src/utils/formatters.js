// Formata CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00)
export const formatarCpfCnpj = (valor) => {
  if (!valor) return "";
  const apenasDigitos = valor.toString().replace(/\D/g, "");

  if (apenasDigitos.length === 11) {
    return apenasDigitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  if (apenasDigitos.length === 14) {
    return apenasDigitos.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  }

  return valor;
};

// Formata Telefone (DD)XXXX-XXXX ou Celular (DD)9XXXX-XXXX
export const formatarTelefone = (numero) => {
  if (!numero) return "";
  const apenasDigitos = numero.toString().replace(/\D/g, "");

  if (apenasDigitos.length === 10) {
    return apenasDigitos.replace(/(\d{2})(\d{4})(\d{4})/, "($1)$2-$3");
  }

  if (apenasDigitos.length === 11) {
    return apenasDigitos.replace(/(\d{2})(\d{5})(\d{4})/, "($1)$2-$3");
  }

  return numero;
};
// Formata valores para Real Brasileiro (R$1.234,56)
export const formatarMoeda = (valor) => {
  if (valor === null || valor === undefined) return "R$ 0,00";

  // Converte para número (caso seja string)
  const numero =
    typeof valor === "string"
      ? parseFloat(valor.replace(/\D/g, "")) / 100
      : Number(valor);

  // Formata para BRL (Real Brasileiro)
  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
};
