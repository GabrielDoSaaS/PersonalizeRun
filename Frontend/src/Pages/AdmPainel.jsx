import axios from "axios";
import { useEffect, useState } from "react";
import { FaSearch, FaPlus, FaTicketAlt, FaFileExcel } from "react-icons/fa";

// ⚠️ Altere para o endpoint do seu backend em produção.
const API_BASE_URL = "https://pb-0t3x.onrender.com";

const AdmPainel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [payers, setPayers] = useState([]);
  const [loadingPayers, setLoadingPayers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError("");
    if (loginEmail === "personalizerun@gmail.com" && loginPassword === "1981abcd") {
      setIsAuthenticated(true);
    } else {
      setLoginError("Email ou senha incorretos.");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchPayers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/list-payers`);
        setPayers(response.data);
      } catch (error) {
        console.error("Houve um erro ao buscar os compradores!", error);
      } finally {
        setLoadingPayers(false);
      }
    };
    fetchPayers();
  }, [isAuthenticated]); // Roda o useEffect apenas quando o estado de autenticação muda

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode || !couponDiscount) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/create-cupom`, {
        code: couponCode,
        porcent: parseFloat(couponDiscount),
      });
      alert("Cupom criado com sucesso!");
      setIsCouponModalOpen(false);
      setCouponCode("");
      setCouponDiscount("");
    } catch (error) {
      console.error("Houve um erro ao criar o cupom!", error);
      alert("Não foi possível criar o cupom.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportToCSV = () => {
    const delimiter = ";";
    const headers = [
      "Nome Completo do Comprador",
      "Codigo de Inscricao",
      "Identificador Personalizado",
      "Tipo Sanguineo",
      "Alergias Conhecidas",
    ].join(delimiter);

    const csvContent = payers
      .map((payer) =>
        [
          `"${payer.userName}"`,
          `"${payer.code}"`,
          `"${payer.personalized || "Nenhuma"}"`,
          `"${payer.blood || "Nenhuma"}"`,
          `"${payer.arlegies || "Nenhuma"}"`,
        ].join(delimiter)
      )
      .join("\r\n");

    const finalCsv = `${headers}\r\n${csvContent}`;
    const bom = "\uFEFF";
    const blob = new Blob([bom + finalCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "compradores_detalhado.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPayers = payers.filter(
    (payer) =>
      payer.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payer.code.includes(searchTerm)
  );

  const cardClass =
    "bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-orange-100";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const inputClass =
    "w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition";

  // Renderiza a tela de login se o usuário não estiver autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Acesso Restrito
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Por favor, insira suas credenciais para continuar.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                className={inputClass}
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className={labelClass}>
                Senha
              </label>
              <input
                id="password"
                type="password"
                className={inputClass}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            {loginError && (
              <p className="text-sm text-red-500 text-center">{loginError}</p>
            )}
            <div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Renderiza o painel principal se o usuário estiver autenticado
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white p-4 md:p-8 font-sans">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 md:mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
              Painel Administrativo
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie compradores e crie cupons de desconto.
            </p>
          </div>
          <button
            onClick={() => setIsCouponModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-transform duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
           <FaPlus />
                Criar Cupom
          </button>
        </header>

        {/* Seção de listagem de compradores */}
        <section className={cardClass}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Listagem de Compradores ({payers.length})
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Buscar por nome ou código..."
                  className={`pl-10 pr-4 py-2 ${inputClass}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <button
                onClick={handleExportToCSV}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold transition-transform duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 w-full md:w-auto justify-center"
              >
                <FaFileExcel />
                Exportar Planilha
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[600px] lg:max-h-[800px] overflow-y-auto">
            {loadingPayers ? (
              <p className="text-center text-gray-500 py-8">Carregando compradores...</p>
            ) : filteredPayers.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-200 text-sm font-semibold text-gray-700">
                    <th className="py-3 px-5">Nome</th>
                    <th className="py-3 px-5">Inscrição</th>
                    <th className="py-3 px-5 hidden md:table-cell">Personalização</th>
                    <th className="py-3 px-5 hidden lg:table-cell">Tipo Sanguíneo</th>
                    <th className="py-3 px-5 hidden lg:table-cell">Alergias</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayers.map((payer, index) => (
                    <tr
                      key={payer._id || index}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="py-4 px-5 text-gray-800 font-medium">
                        {payer.userName}
                      </td>
                      <td className="py-4 px-5 text-gray-600">{payer.code}</td>
                      <td className="py-4 px-5 text-gray-600 hidden md:table-cell">
                        {payer.personalized || "N/A"}
                      </td>
                      <td className="py-4 px-5 text-gray-600 hidden lg:table-cell">
                        {payer.blood || "N/A"}
                      </td>
                      <td className="py-4 px-5 text-gray-600 hidden lg:table-cell">
                        {payer.arlegies || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Nenhum comprador encontrado.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Modal de Cupom */}
      {isCouponModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsCouponModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl border border-orange-100">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FaTicketAlt className="text-orange-500" />
                  Criar novo cupom
                </h3>
                <button
                  onClick={() => setIsCouponModalOpen(false)}
                  className="rounded-xl p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  aria-label=" Fechar modal"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleCreateCoupon} className="px-6 py-6 space-y-5">
                <div>
                  <label htmlFor="couponCode" className={labelClass}>
                    Código do Cupom
                  </label>
                  <input
                    id="couponCode"
                    type="text"
                    className={inputClass}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="couponDiscount" className={labelClass}>
                    Porcentagem de Desconto (%)
                  </label>
                  <input
                    id="couponDiscount"
                    type="number"
                    className={inputClass}
                    value={couponDiscount}
                    onChange={(e) => setCouponDiscount(e.target.value)}
                    min="1"
                    max="100"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCouponModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border font-semibold text-gray-700 hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      "Criar Cupom"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmPainel;