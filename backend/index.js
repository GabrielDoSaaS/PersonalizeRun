const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const connectToDb = require('./ConnectToDb');
const mercadopago = require('mercadopago');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/api', routes);

const { MercadoPagoConfig, Payment } = require('mercadopago');

// Configuração
const client = new MercadoPagoConfig({ 
  accessToken: 'APP_USR-7932112160870899-090608-086afe9324d53debb58635846b322-1840600103' 
});

// Crie a instância do Payment
const paymentClient = new Payment(client);

app.post("/webhook/mercadopago", async (req, res) => {
  try {
    const { type, data } = req.body;
    console.log("Webhook recebido:", { type, data });

    if (type === "payment") {
      const paymentId = data.id;
      
      // FORMA CORRETA - usando a instância do Payment
      const payment = await paymentClient.get({ id: paymentId });
      
      console.log(`Status do pagamento ${paymentId}: ${payment.status}`);

      if (payment.status === "approved") {
        console.log("✅ PAGAMENTO APROVADO!");
        
        // Suas ações aqui
        await handleApprovedPayment(payment);
        
        return res.status(200).json({ 
          message: "Pagamento aprovado processado",
          payment_id: paymentId
        });
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Erro no webhook:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

async function handleApprovedPayment(payment) {
  console.log("🎯 Processando pagamento aprovado:", payment.id);
  // Sua lógica de negócio aqui
}

connectToDb();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});