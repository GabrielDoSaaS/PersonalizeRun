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

  // Novos estados para o filtro e as abas
  const [activeTab, setActiveTab] = useState("all");
  const [payersOnOffer, setPayersOnOffer] = useState([]);
  const [payersAfterOffer, setPayersAfterOffer] = useState([]);

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
        const allPayers = response.data;
        setPayers(allPayers);
      } catch (error) {
        console.error("Houve um erro ao buscar os compradores!", error);
      } finally {
        setLoadingPayers(false);
      }
    };
    fetchPayers();
  }, [isAuthenticated]);

  // Novo useEffect para filtrar os pagadores quando a lista principal mudar
  useEffect(() => {
    const onOffer = payers.filter(payer => !payer.afterOffer);
    const afterOffer = payers.filter(payer => payer.afterOffer);
    setPayersOnOffer(onOffer);
    setPayersAfterOffer(afterOffer);
  }, [payers]);

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

  // Filtra a lista de exibição com base na aba ativa e no termo de busca
  const filteredPayers = (activeTab === "all" ? payers : activeTab === "onOffer" ? payersOnOffer : payersAfterOffer).filter(
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
                name="email"
                type="email"
                autoComplete="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="password" className={labelClass}>
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            {loginError && (
              <p className="text-sm font-medium text-red-600 text-center">
                {loginError}
              </p>
            )}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-300"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="bg-orange-600 text-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <h1 className="text-3xl font-bold">Painel de Administração</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
              />
            </div>
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="flex items-center space-x-2 bg-white text-orange-600 font-bold py-2 px-4 rounded-xl shadow-lg hover:bg-gray-100 transition duration-300"
            >
              <FaPlus />
              <span>Criar Cupom</span>
            </button>
            <button
              onClick={handleExportToCSV}
              className="flex items-center space-x-2 bg-white text-orange-600 font-bold py-2 px-4 rounded-xl shadow-lg hover:bg-gray-100 transition duration-300"
            >
              <FaFileExcel />
              <span>Exportar</span>
            </button>
          </div>
        </header>

        {/* Tabs de filtro */}
        <div className="flex justify-center border-b border-gray-200">
          <button
            className={`px-4 py-2 -mb-px font-semibold text-lg transition-colors duration-300 ${
              activeTab === "all"
                ? "border-b-2 border-orange-500 text-orange-600"
                : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("all")}
          >
            Todos ({payers.length})
          </button>
          <button
            className={`px-4 py-2 -mb-px font-semibold text-lg transition-colors duration-300 ${
              activeTab === "onOffer"
                ? "border-b-2 border-orange-500 text-orange-600"
                : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("onOffer")}
          >
            Compraram na Oferta ({payersOnOffer.length})
          </button>
          <button
            className={`px-4 py-2 -mb-px font-semibold text-lg transition-colors duration-300 ${
              activeTab === "afterOffer"
                ? "border-b-2 border-orange-500 text-orange-600"
                : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("afterOffer")}
          >
            Compraram após Oferta ({payersAfterOffer.length})
          </button>
        </div>

        <div className={cardClass}>
          <h3 className="text-xl font-bold mb-4 text-orange-600 flex items-center gap-2">
            <FaTicketAlt /> Lista de Compradores
          </h3>
          {loadingPayers ? (
            <p className="text-center text-gray-500">
              Carregando compradores...
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      Nome
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      Código
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      Tipo Sanguíneo
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      Alergias
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayers.length > 0 ? (
                    filteredPayers.map((payer, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payer.userName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payer.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payer.blood || "Nenhuma"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payer.arlegies || "Nenhuma"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payer.afterOffer ? "Comprou após a oferta" : "Comprou na oferta"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        Nenhum comprador encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Criação de Cupom */}
        {isCouponModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
            <div className="relative p-8 bg-white w-96 rounded-2xl shadow-xl border border-orange-100">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Criar Novo Cupom
                </h3>
              </div>
              <form onSubmit={handleCreateCoupon}>
                <div className="mb-4">
                  <label htmlFor="couponCode" className={labelClass}>
                    Código do Cupom
                  </label>
                  <input
                    id="couponCode"
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="couponDiscount" className={labelClass}>
                    Desconto (%)
                  </label>
                  <input
                    id="couponDiscount"
                    type="number"
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
                    className="px-5 py-2.5 rounded-xl border font-semibold text-gray-700 hover:bg-gray-50 transition duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 transition duration-300"
                  >
                    {loading ? "Criando..." : "Criar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdmPainel;