const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const connectToDb = require('./ConnectToDb');
const mercadopago = require('mercadopago');
const DatabasePayers = require('./DatabasePayers');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/api', routes);

const { MercadoPagoConfig, Payment } = require('mercadopago');

// Configuração
const client = new MercadoPagoConfig({ 
  accessToken: 'APP_USR-7932112160870899-090608-086afe9324ef4d53debb58635846b322-1840600103' 
});

// Crie a instância do Payment
const paymentClient = new Payment(client);

routes.post('/webhook/mercadopago', async (req, res) => {
    const payment = req.query;

    console.log({payment});
    const paymentId = payment.id;

    try {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer APP_USR-7932112160870899-090608-086afe9324ef4d53debb58635846b322-1840600103"
            }
        })

        if(response.ok) {

            const data = await response.json();

            if(data.status == "approved") {
                const metadata = response.metadata;
                console.log({metadata});
                const userName = metadata.userName;
                const personalized = metadata.personalized;
                const email = metadata.email;
                const code = metadata.code;
                const blood = metadata.blood;
                const allergies = metadata.allergies;
            }
                
             return res.sendStatus(200);
                
        }
    } catch {
        res.sendStatus(500);
    }
});

connectToDb();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});