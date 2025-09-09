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
    const paymentId = req.body?.data?.id;
    console.log(req.body);
      // Mercado Pago manda o id do pagamento na query
    if (!paymentId) {
      return res.status(400).json({ error: "paymentId não informado" });
    }

    // Consulta o pagamento na API do Mercado Pago
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer APP_USR-7932112160870899-090608-086afe9324ef4d53debb58635846b322-1840600103` // coloque no .env
      }
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Falha ao consultar pagamento" });
    }

    const data = await response.json();

    // Valida status
    if (data.status === "approved") {
      console.log("Pagamento aprovado:", data.id);
      // aqui poderia salvar no banco, enviar email, etc...
    } else {
      console.log("Pagamento não aprovado:", data.status);
    }

    // Sempre responda 200 para o Mercado Pago não reenviar a notificação
    return res.sendStatus(200);

  } catch (err) {
    console.error("Erro no webhook:", err);
    return res.sendStatus(500);
  }


});


connectToDb();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});