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
        port: 587,
        secure: false,
        auth: {
                user: 'senderemailservice01@gmail.com',
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

console.log('Lead recebido:', lead);

res.status(200).json({ message: 'Lead recebido com sucesso!' });
} )



routes.post('/webhook/:userName/:personalized/:email/:code/:blood/:arlegies', async (req, res) => {
    const payment = req.query;
    const p = req.body;
    console.log({payment});
    const paymentId = payment.id;
    const {} = req.params;

        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer APP_USR-8236944029478650-083009-a7d3d34f12c17b040f58853cb2f6dc9c-2655607003"
            }
        })

        if(response.ok) {

            const data = await response.json();

            if(data.status == "approved") {
                
                  await new DatabasePayers({ userName, personalized, email, code, blood, arlegies }).save();


                  res.send('ok');

            }
                
        }

    });


module.exports = routes;