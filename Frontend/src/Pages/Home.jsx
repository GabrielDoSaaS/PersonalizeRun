import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

// Imagens locais (substitua pelos seus seus caminhos reais, se desejar)
import camisetaLaranja from "../assets/Laranja-3.jpg";
import camisetaRosa from "../assets/Rosa-1.jpg";
import camisetaAzul from "../assets/Azul-2.jpg";

import exemplePersonalizacao from "../assets/Exemple-1.jpg";
import exempleExemploPersonalizacaoOpcional from "../assets/Exemple-2.jpg";

const PROMO_DEADLINE = { day: 21, month: 9 }; // 21/09 (dd/mm)
const PROMO_PRICE = 20.0;
const REGULAR_PRICE = 25.0;
const PERSONALIZATION_LIMIT = 12;

// ⚠️ Altere para o endpoint do seu backend em produção.
// Ex.: const API_BASE_URL = "https://seu-dominio.com";
const API_BASE_URL = "https://pb-0t3x.onrender.com";

const COLORS = [
  { id: "rosa", label: " 5K-Rosa ", src: camisetaRosa, hex: "#ec4899" },
  { id: "azul", label: " 10K-Azul ", src: camisetaAzul, hex: "#3b82f6" },
  { id: "laranja", label: " 21K-Laranja ", src: camisetaLaranja, hex: "#f97316" },
  { id: "personalizacao", label: "Personalização Opcional", src: exemplePersonalizacao, hex: "#4a5568" },
  { id: "personalizacao-opcional", label: "Personalização Opcional", src: exempleExemploPersonalizacaoOpcional, hex: "#4a5568" },
];

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false); // Estado para o modal de cupom
  const [selectedColor, setSelectedColor] = useState(COLORS[0]); // Cor inicial para visualização
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Form state
  const [fullName, setFullName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [personalization, setPersonalization] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [couponCode, setCouponCode] = useState(""); // Estado para o código do cupom

  // Cálculo do preço e contagem regressiva
  const { isPromo, price, daysLeft, deadlineDate } = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const deadline = new Date(currentYear, PROMO_DEADLINE.month - 1, PROMO_DEADLINE.day, 23, 59, 59, 999);
    const stillPromo = now.getTime() <= deadline.getTime();
    const millis = Math.max(0, deadline.getTime() - now.getTime());
    const days = Math.ceil(millis / (1000 * 60 * 60 * 24));
    return {
      isPromo: stillPromo,
      price: stillPromo ? PROMO_PRICE : REGULAR_PRICE,
      daysLeft: stillPromo ? days : 0,
      deadlineDate: deadline,
    };
  }, []);

  useEffect(() => {
    // Fechar modal com Esc
    const onKey = (e) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setIsCouponModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const resetForm = () => {
    setFullName("");
    setRegistrationNumber("");
    setPersonalization("");
    setBloodType("");
    setAllergies("");
    setCouponCode(""); // Limpa o cupom ao resetar
    setErrors({});
    setTouched({});
  };

  const validate = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = "Informe o nome completo.";
    if (!registrationNumber.trim()) newErrors.registrationNumber = "Informe o número de inscrição.";
    if (personalization.length > PERSONALIZATION_LIMIT)
      newErrors.personalization = `Máx. ${PERSONALIZATION_LIMIT} caracteres.`;
    return newErrors;
  };

  const handleBuyClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleCloseCouponModal = () => {
    setIsCouponModalOpen(false);
    // Não reseta o formulário principal aqui, apenas fecha o modal de cupom
    // O formulário principal será resetado ao fechar o modal de compra
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    setTouched({
      fullName: true,
      registrationNumber: true,
      personalization: true,
    });
    if (Object.keys(v).length > 0) return;

    setIsCouponModalOpen(true); // Abre o modal de cupom ao invés de prosseguir direto
  };

  const confirmPurchaseWithCoupon = async () => {
    setLoading(true);
    try {
      const payload = {
        userName: fullName,
        email: "gabrieldosaas@gmail.com", // se tornará dinâmico no futuro
        product: {
          name: "Camiseta personalizada",
          personalization,
          bloodType,
          allergies,
          registrationNumber,
          price,
        },
        coupon: couponCode ? { code: couponCode } : null, // Envia o cupom se houver, senão null
      };

      const { data } = await axios.post(`${API_BASE_URL}/api/buy-product`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error("Resposta inesperada do servidor.");
      }
    } catch (err) {
      console.error(err);
      alert(
        "Não foi possível iniciar o pagamento.\n" +
        "Verifique se o backend está acessível e tente novamente."
      );
    } finally {
      setLoading(false);
      setIsCouponModalOpen(false); // Fecha o modal de cupom após a tentativa de pagamento
      handleCloseModal(); // Fecha o modal principal também
    }
  };

  const priceBadge = isPromo
    ? `R$ ${PROMO_PRICE.toFixed(2).replace(".", ",")} (promo até ${String(
        PROMO_DEADLINE.day
      ).padStart(2, "0")}/${String(PROMO_DEADLINE.month).padStart(2, "0")})`
    : `R$ ${REGULAR_PRICE.toFixed(2).replace(".", ",")}`;

  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const inputClass =
    "w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition";

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white p-4 md:p-8 font-sans">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                Personalize sua Camisa da Corrida
              </h1>
              <p className="text-gray-600 mt-1">
                Para a 12ª Meia Maratona Eu Amo Recife. Qualidade premium, personalização opcional e retirada no local.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isPromo ? (
                <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm font-semibold">
                  Promo ativa · {daysLeft} {daysLeft === 1 ? "dia" : "dias"} restantes
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-sm font-semibold">
                  Valor padrão
                </span>
              )}
              <span className="inline-flex items-center rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-sm font-bold">
                {priceBadge}
              </span>
            </div>
          </div>
        </header>

        {/* Card principal */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Galeria */}
          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-orange-100">
            <div className="relative group">
              <img
                src={selectedColor.src}
                alt={`Camiseta ${selectedColor.label}`}
                className="w-full aspect-[4/3] object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 rounded-xl ring-1 ring-black/5 pointer-events-none" />
            </div>

            {/* Seletor de cores (apenas para visualização) */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Cores disponíveis para visualização</p>
              <div className="flex gap-3">
                {COLORS.map((c) => {
                  const isActive = c.id === selectedColor.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`relative rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                        isActive ? "border-orange-500" : "border-gray-200"
                      }`}
                      aria-pressed={isActive}
                      aria-label={`Visualizar cor ${c.label}`}
                    >
                      <img
                        src={c.src}
                        alt={c.label}
                        className="w-20 h-16 md:w-24 md:h-20 object-cover rounded-xl"
                      />
                      <span
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs px-2 py-0.5 rounded-full bg-white shadow border"
                        style={{ color: c.hex }}
                      >
                        {c.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Benefícios */}
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <li className="rounded-xl border bg-white p-3 text-gray-700 shadow-sm">
                ✅ Tecido de alta qualidade
              </li>
              <li className="rounded-xl border bg-white p-3 text-gray-700 shadow-sm">
                ✍️ Personalização opcional
              </li>
              <li className="rounded-xl border bg-white p-3 text-gray-700 shadow-sm">
                🚚 Retirada no local
              </li>
            </ul>
          </div>

          {/* Conteúdo e CTA */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-orange-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Seu nome, Sua corrida, Sua história
            </h2>
            <p className="text-gray-600 mt-2">
              Personalização com acabamento e impressão premium
            </p>

            <div className="mt-6 flex items-center gap-3">
              <div className="text-3xl font-extrabold text-gray-900">
                R$ {price.toFixed(2).replace(".", ",")}
              </div>
              {isPromo && (
                <div className="text-sm text-gray-500">
                  até {deadlineDate.toLocaleDateString("pt-BR")}
                </div>
              )}
            </div>

            <button
              onClick={handleBuyClick}
              className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-4 rounded-2xl transition-transform duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Comprar agora
            </button>

            <div className="mt-4 text-xs text-gray-500">
              * Após o prazo promocional, o valor passa para R$ {REGULAR_PRICE.toFixed(2).replace(".", ",")}.
            </div>
          </div>
        </section>

        {/* Informações da Retirada e Personalização */}
        <section className="mt-8 md:mt-12 bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-orange-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Detalhes para Retirada e Personalização
          </h2>
          <p className="text-gray-600 mb-4">
            Sua personalização será realizada no stand da <strong className="text-orange-600">PersonalizeRun</strong> na <strong className="text-orange-600">EXPORUN MMEAR</strong>, evento da <strong className="text-orange-600">12ª Meia Maratona Eu Amo Recife</strong>.
            Não haverá personalização no dia da prova.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Local e Horário</h3>
              <p className="mt-2 text-gray-700">
                A personalização acontecerá em local e datas específicas:
              </p>
              <ul className="mt-2 text-gray-600 space-y-1 list-disc list-inside">
                <li>
                  <strong className="font-medium">Local:</strong> Av. Rio Branco – Recife/PE (em frente ao Marco Zero)
                </li>
                <li>
                  <strong className="font-medium">Datas:</strong> 24, 25 e 26 de setembro de 2025
                </li>
                <li>
                  <strong className="font-medium">Horário:</strong> Das 12h às 20h
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Processo de Personalização</h3>
              <p className="mt-2 text-gray-700">
                Após retirar seu Kit, dirija-se ao nosso stand com os seguintes itens para a personalização:
              </p>
              <ul className="mt-2 text-gray-600 space-y-1 list-disc list-inside">
                <li>Documento com foto</li>
                <li>Comprovante de aquisição (impresso ou digital)</li>
                <li>Camisa do evento</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800">Sobre a Personalização</h3>
            <ul className="mt-2 text-gray-600 space-y-1 list-disc list-inside">
              <li>O nome terá até 12 caracteres e 1 espaço. Exemplo: JOAO HENRIQUE.</li>
              <li>Dimensões: 4cm de altura por 20cm de comprimento.</li>
              <li>Fonte: Bebas Neue, Negrito.</li>
              <li>Opções adicionais: seu tipo sanguíneo e alergias podem ser afixados na manga direita ou na borda frontal da camisa.</li>
              <li>Dimensões: 2cm de altura por 10cm de comprimento.</li>
            </ul>
          </div>
        </section>

        {/* Banner de Divulgação do Evento */}
        <section className="mt-8 md:mt-12 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-2xl shadow-xl p-6 md:p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">12ª Meia Maratona Eu Amo Recife</h2>
          <p className="text-lg mb-4">
            Prepare-se para mais uma edição emocionante!
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <a
              href="https://euamorecife.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-white text-orange-600 font-semibold py-2 px-5 rounded-xl hover:bg-gray-100 transition-colors shadow"
            >
              Visite o site oficial
              <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path></svg>
            </a>
            <a
              href="https://www.instagram.com/meiamaratonaeuamorecife/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-white text-orange-600 font-semibold py-2 px-5 rounded-xl hover:bg-gray-100 transition-colors shadow"
            >
              Siga no Instagram
              <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 3a7 7 0 00-7 7c0 2.053.791 3.935 2.106 5.347A7.001 7.001 0 0010 17c3.866 0 7-3.134 7-7s-3.134-7-7-7zm0 12a5 5 0 100-10 5 5 0 000 10zM10 7a3 1 110 6 3 3 0 010-6zm-4.75 2.75a.75.75 0 100 1.5.75.75 0 000-1.5zM14.75 9.75a.75.75 0 100 1.5.75.75 0 000-1.5z" clipRule="evenodd"></path></svg>
            </a>
          </div>
        </section>

        {/* Rodapé simples */}
        <footer className="mt-10 text-center text-sm text-gray-500">
          Precisa de ajuda? Fale com a gente pelo suporte.
        </footer>
      </div>

      {/* Modal Principal de Compra */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          {/* Conteúdo do modal */}
          <div className="relative z-10 w-full max-w-xl">
            <div className="bg-white rounded-2xl shadow-2xl border border-orange-100">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">Finalizar compra</h3>
                <button
                  onClick={handleCloseModal}
                  className="rounded-xl p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  aria-label="Fechar modal"
                >
                  ✕
                </button>
              </div>

              <form className="px-6 py-6 space-y-5" onSubmit={handlePayment} noValidate>
                {/* Nome completo */}
                <div>
                  <label htmlFor="fullName" className={labelClass}>
                    Nome completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    className={`${inputClass} ${touched.fullName && errors.fullName ? "border-red-400 ring-red-300" : ""}`}
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
                    required
                  />
                  {touched.fullName && errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                  )}
                </div>

                {/* Número de inscrição */}
                <div>
                  <label htmlFor="registrationNumber" className={labelClass}>
                    Utilize a númeração informada no e-mail de confirmação da sua inscrição na corrida <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="registrationNumber"
                    type="text"
                    className={`${inputClass} ${touched.registrationNumber && errors.registrationNumber ? "border-red-400 ring-red-300" : ""}`}
                    placeholder="Seu número de inscrição"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, registrationNumber: true }))}
                    required
                  />
                  {touched.registrationNumber && errors.registrationNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.registrationNumber}</p>
                  )}
                </div>

                {/* Personalização */}
                <div>
                  <label htmlFor="personalization" className={labelClass}>
                    Texto da personalização (Até {PERSONALIZATION_LIMIT} caracteres e 1 espaço)
                  </label>
                  <input
                    id="personalization"
                    type="text"
                    maxLength={PERSONALIZATION_LIMIT}
                    className={`${inputClass} ${touched.personalization && errors.personalization ? "border-red-400 ring-red-300" : ""}`}
                    placeholder="Ex.: G. Oliveira"
                    value={personalization}
                    onChange={(e) => setPersonalization(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, personalization: true }))}
                  />
                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>Dica: personalize com nome, apelido ou número.</span>
                    <span>
                      {personalization.length}/{PERSONALIZATION_LIMIT}
                    </span>
                  </div>
                  {touched.personalization && errors.personalization && (
                    <p className="mt-1 text-sm text-red-600">{errors.personalization}</p>
                  )}
                </div>

                {/* Tipo sanguíneo */}
                <div>
                  <label htmlFor="bloodType" className={labelClass}>
                    Tipo sanguíneo (opcional)
                  </label>
                  <input
                    id="bloodType"
                    type="text"
                    className={inputClass}
                    placeholder="Ex.: O+"
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                  />
                </div>

                {/* Alergias */}
                <div>
                  <label htmlFor="allergies" className={labelClass}>
                    Especifique, se houver, o tipo de alergia (opcional)
                  </label>
                  <textarea
                    id="allergies"
                    rows={2}
                    className={inputClass}
                    placeholder="EX. Dipirona"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                  />
                </div>

                {/* Ações */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 rounded-xl border font-semibold text-gray-700 hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Continuar
                  </button>
                </div>
              </form>
            </div>

            {/* Sombra decorativa */}
            <div className="mx-auto h-6 w-40 -mt-2 bg-gradient-to-r from-transparent via-black/10 to-transparent rounded-full blur-md" />
          </div>
        </div>
      )}

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
            onClick={handleCloseCouponModal}
          />

          {/* Conteúdo do modal */}
          <div className="relative z-10 w-full max-w-xl">
            <div className="bg-white rounded-2xl shadow-2xl border border-orange-100">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">Cupom de Desconto</h3>
                <button
                  onClick={handleCloseCouponModal}
                  className="rounded-xl p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  aria-label="Fechar modal de cupom"
                >
                  ✕
                </button>
              </div>

              <div className="px-6 py-6 space-y-5">
                <p className="text-gray-700">Você gostaria de aplicar um cupom de desconto?</p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      // Se não tiver cupom, chama a confirmação direto
                      if (!couponCode) {
                        confirmPurchaseWithCoupon();
                      } else {
                        // Se já houver um código (caso o usuário volte atrás), confirma com ele
                        confirmPurchaseWithCoupon();
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl border font-semibold text-gray-700 hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Não, obrigado
                  </button>
                  <div className="flex-grow">
                    <input
                      type="text"
                      className={`${inputClass} w-full`}
                      placeholder="Digite seu cupom aqui"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={confirmPurchaseWithCoupon}
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      "Aplicar e comprar"
                    )}
                  </button>
                </div>
              </div>
            </div>
            {/* Sombra decorativa */}
            <div className="mx-auto h-6 w-40 -mt-2 bg-gradient-to-r from-transparent via-black/10 to-transparent rounded-full blur-md" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;