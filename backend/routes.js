const routes = require('express').Router();
const BuyTheProductController = require('./BuyTheProductController');
const CreateACupon = require('./CreateACupon');
const ListPayers = require('./ListPayers');
const ListCupoms = require('./ListCupoms');
const DatabasePayers = require('./DatabasePayers');
const nodemailer = require('nodemailer')

routes.post('/buy-product', BuyTheProductController);
routes.post('/create-cupom', CreateACupon);
routes.get('/list-payers', ListPayers);
routes.get('/list-cupoms', ListCupoms);


routes.post('/lead', async (req, res) => {
    const { email, subject,  description} = req.body;

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
                user: 'sendermailservice01@gmail.com',
                pass: "slht vdcm pfgi mmru"
            }
        });
            
let mailOptions = {
        from: 'senderemailservice01@gmail.com',
        to: 'personalizerun@gmail.com',
        subject: subject,
        text: `Olá o usuário ${email} enviou ${description}`
};


transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log('Erro:', error);
        } else {
                console.log('Email enviado:', info.response);
        }
});

console.log('Lead recebido:');

res.status(200).json({ message: 'Lead recebido com sucesso!' });
} )




routes.post('/webhook', async (req, res) => {
    try {
        // 1. Verificar se é uma notificação de pagamento
        const { type, id } = req.query;
        
        if (type !== 'payment') {
            return res.status(200).send('Notificação ignorada (não é payment)');
        }

        // 2. Obter o ID do pagamento
        const paymentId = id;
        if (!paymentId) {
            return res.status(400).send('Payment ID não encontrado');
        }

        // 3. Buscar dados do pagamento na API do MP
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer APP_USR-7932112160870899-090608-086afe9324ef4d53debb58635846b322-1840600103`
            }
        });

        if (!response.ok) {
            console.error('Erro ao buscar pagamento:', response.status);
            return res.status(500).send('Erro ao verificar pagamento');
        }

        const paymentData = await response.json();

        // 4. Verificar status do pagamento
        if (paymentData.status === "approved") {
            // 5. Obter dados adicionais (que você estava passando por URL)
            // Esses dados devem estar no metadata do pagamento!
            const { userName, personalized, email, code, blood, allergies } = paymentData.metadata || {};

            await new DatabasePayers({ 
                userName, 
                personalized, 
                email, 
                code, 
                blood, 
                allergies 
            }).save();
            
            return res.status(200).send('ok');
        } else {
            console.log('Pagamento não aprovado:', paymentData.status);
            return res.status(200).send('Pagamento não aprovado');
        }

    } catch (error) {
        console.error('Erro no webhook:', error);
        return res.status(500).send('Erro interno');
    }
});

module.exports = routes;