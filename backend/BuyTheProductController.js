const DatabasePayers = require('./DatabasePayers');
const axios = require('axios'); // Use axios ou outra biblioteca para HTTP requests
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

        // Configuração do corpo da requisição para a API do Mercado Pago
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
            notification_url: `https://pb-0t3x.onrender.com/webhook/${userName}/${personalized}/${email}/${code}/${blood}/${arlegies}`,
        };

        // Configuração dos headers
        const config = {
            headers: {
                'Authorization': `Bearer APP_USR-8236944029478650-083009-a7d3d34f12c17b040f58853cb2f6dc9c-2655607003`, // Seu access token
                'Content-Type': 'application/json',
            },
        };

        // Fazendo a requisição POST diretamente para a API
        const response = await axios.post('https://api.mercadopago.com/checkout/preferences', body, config);
        
        // Retorna a URL de inicialização do checkout
        res.send({ init_point: response.data.init_point });

    } catch (error) {
        console.error('Erro ao criar preferência:', error.response ? error.response.data : error.message);
        res.status(500).send('Erro interno do servidor');
    }
}

module.exports = BuyTheProductController;