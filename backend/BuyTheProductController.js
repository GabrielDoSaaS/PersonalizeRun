const DatabasePayers = require('./DatabasePayers');
const axios = require('axios');
const Cupom = require('./Cupom');

const BuyTheProductController = async (req, res) => {
    const { userName, email, product, coupon } = req.body;

    const codeCupom = coupon ? coupon.code : null;
    const personalized = product.personalization;
    const arlegies = product.allergies;
    const blood = product.bloodType;
    const code = product.registrationNumber;

    let cupomFound = null;
    if (codeCupom) {
        cupomFound = await Cupom.findOne({ code: codeCupom });
    }

    try {
        const porcent = cupomFound ? cupomFound.porcent : 0;
        const value = 21 - (21 * porcent / 100);

        // Codificar os parâmetros para URL
        const encodedUserName = encodeURIComponent(userName);
        const encodedEmail = encodeURIComponent(email);
        const encodedPersonalized = encodeURIComponent(personalized);
        const encodedArlegies = encodeURIComponent(arlegies);
        const encodedBlood = encodeURIComponent(blood);
        const encodedCode = encodeURIComponent(code);

        // Construir a URL de notificação corretamente
        const notificationUrl = `https://pb-0t3x.onrender.com/webhook?userName=${encodedUserName}&personalized=${encodedPersonalized}&email=${encodedEmail}&code=${encodedCode}&blood=${encodedBlood}&arlegies=${encodedArlegies}`;

        // Configuração do corpo da requisição (VERSÃO EXPLÍCITA)
        const body = {
            items: [
                {
                    id: '1234',
                    title: 'Camiseta Personalizada',
                    quantity: 1,
                    currency_id: 'BRL',
                    unit_price: value,
                },
            ],
            notification_url: notificationUrl,
            payment_methods: {
                excluded_payment_types: [
                    { id: 'ticket' } // Exclui apenas boleto
                ],
                included_payment_types: [
                    { id: 'pix' },           // Garante que PIX está incluído
                    { id: 'credit_card' },   // Garante que cartão de crédito está incluído
                    { id: 'debit_card' }     // Garante que cartão de débito está incluído
                ],
            },
            back_urls: {
                success: 'https://personalizerun.onrender.com',
                failure: 'https://personalizerun.onrender.com',
                pending: 'https://personalizerun.onrender.com'
            },
            auto_return: 'approved'
        };

        // Configuração dos headers
        const config = {
            headers: {
                'Authorization': `Bearer APP_USR-2318029059296176-090609-b825af366da3d4c82a462dad430a08af-2655607003`,
                'Content-Type': 'application/json',
            },
        };

        // Fazendo a requisição POST
        const response = await axios.post('https://api.mercadopago.com/checkout/preferences', body, config);
        
        // Retorna a URL de inicialização do checkout
        res.send({ init_point: response.data.init_point });

    } catch (error) {
        console.error('Erro ao criar preferência:', error.response ? error.response.data : error.message);
        res.status(500).send('Erro interno do servidor');
    }
}

module.exports = BuyTheProductController;