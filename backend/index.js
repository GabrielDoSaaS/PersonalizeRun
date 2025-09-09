const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const connectToDb = require('./ConnectToDb');
const mercadopago = require('mercadopago');
const DatabasePayers = require('./DatabasePayers');
const axios = require('axios');
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

app.post("/webhook/mercadopago", async (req, res) => {
    
    try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer APP_USR-7932112160870899-090608-086afe9324ef4d53debb58635846b322-1840600103"
        }
    });

    if (response.ok) {
        const data = await response.json();
        console.log(data);
        if (data.status === "approved") {
            return res.sendStatus(200); // Pagamento aprovado
        } else {
            return res.sendStatus(400); // Pagamento não aprovado
        }
    } else {
        return res.sendStatus(502); // Erro na requisição ao Mercado Pago
    }
} catch (error) {
    console.error(error);
    return res.sendStatus(500); // Erro interno
}


});


connectToDb();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});