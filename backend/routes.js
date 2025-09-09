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
        const { type, id } = req.query;
        
        if (type !== 'payment') return res.status(200).send('Ignored');
        
        // Buscar dados COMPLETOS do pagamento
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
            headers: { "Authorization": "Bearer SEU_TOKEN" }
        });
        
        const paymentData = await response.json();
        
        // Pegar dados do METADATA
        const { userName, personalized, email, code, blood, allergies } = paymentData.metadata || {};
        
        if (paymentData.status === "approved") {
            await new DatabasePayers({ 
                userName, 
                personalized, 
                email, 
                code, 
                blood, 
                allergies 
            }).save();
        }
        
        return res.status(200).send('ok');
    } catch (error) {
        return res.status(200).send('ok'); // SEMPRE retorne 200 para o MP
    }
});

module.exports = routes;