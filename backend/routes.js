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




routes.post('/webhook/:userName/:personalized/:email/:code/:blood/:arlegies', async (req, res) => {
    try {
        const { userName, personalized, email, code, blood, arlegies } = req.params;
        const paymentId = req.query.id;

        if (!paymentId) {
            return res.status(400).send('Payment ID não encontrado');
        }

        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer APP_USR-7932112160870899-090608-086afe9324ef4d53debb58635846b322-1840600103" // Use o mesmo token
            }
        });

        if (response.ok) {
            const data = await response.json();

            if (data.status === "approved") {
                await new DatabasePayers({ 
                    userName, 
                    personalized, 
                    email, 
                    code, 
                    blood, 
                    arlegies 
                }).save();
                
                return res.send('ok');
            } else {
                console.log('Pagamento não aprovado:', data.status);
                return res.send('Pagamento não aprovado');
            }
        } else {
            console.error('Erro ao buscar pagamento:', response.status);
            return res.status(500).send('Erro ao verificar pagamento');
        }

    } catch (error) {
        console.error('Erro no webhook:', error);
        return res.status(500).send('Erro interno');
    }
});

module.exports = routes;