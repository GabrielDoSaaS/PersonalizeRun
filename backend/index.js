const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const connectToDb = require('./ConnectToDb');
const mercadopago = require('mercadopago');
const app = express();
const PORT = 3000;
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

app.use(cors());
app.use(express.json());
app.use('/api', routes);

const mp = new MercadoPagoConfig({accessToken: 'APP_USR-7932112160870899-090608-086afe9324ef4d53debb58635846b322-1840600103'});

app.post("/webhook/mercadopago", async (req, res) => {
  try {
    const { type, data } = req.body;
    console.log("Webhook recebido:", { type, data });

    if (type === "payment") {
      const paymentId = data.id;
      
      // FORMA CORRETA de buscar pagamento na SDK atualizada
      const payment = await mercadopago.payment.get(paymentId);
      
      console.log(`Status do pagamento ${paymentId}: ${payment.response.status}`);

      if (payment.response.status === "approved") {
        console.log("✅ PAGAMENTO APROVADO!");
        
        // Suas ações aqui
        await handleApprovedPayment(payment.response);
        
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