const DatabasePayers = require('./DatabasePayers');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const Cupom = require('./Cupom');

const BuyTheProductController = async (req, res) => {
    const { userName, email, product, coupon } = req.body; // coupon pode ser null aqui

    // Verifique se 'coupon' existe e tem a propriedade 'code'
    const codeCupom = coupon ? coupon.code : null; // Se coupon for null, codeCupom será null

    const personalized = product.personalization;
    const arlegies = product.allergies;
    const blood = product.bloodType;
    const code = product.registrationNumber;

    let cupomFound = null;
    if (codeCupom) { // Só busca o cupom se houver um código
        cupomFound = await Cupom.findOne({ code: codeCupom });
    }

    try {
        // Use um valor padrão se o cupom não for encontrado ou não existir
        const porcent = cupomFound ? cupomFound.porcent : 0;

        const value = 21 - (21 * porcent / 100);
        const client = new MercadoPagoConfig({ accessToken: 'TEST-8001012963880387-060323-cdb26a9b2c52877f4a0ae4bc256d8912-1840600103' });

        const preference = new Preference(client);

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
            notification_url: `https://server-2-4fun.onrender.com/webhook/${userName}/${personalized}/${email}/${code}/${blood}/${arlegies}`,
        };

        await preference.create({ body }).then((response) => {
            return res.send({ init_point: response.init_point });
        });

    } catch (error) {
        res.send('error');
        console.error(error);
    }
}


    

module.exports = BuyTheProductController



