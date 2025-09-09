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

mercadopago.configurations.setAccessToken('APP_USR-7932112160870899-090608-086afe9324ef4d53debb58635846b322-1840600103');

app.post("/webhook/mercadopago", async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === "payment") {
      const paymentId = data.id;
      
      // Buscar detalhes do pagamento
      const paymentInfo = await mercadopago.payment.findById(paymentId);
      const payment = paymentInfo.body;

      if (payment.status === "approved") {
        // SUA AÇÃO AQUI - Exemplos:
        console.log("✅ Pagamento aprovado! Executando ações...");
        
        // 1. Atualizar banco de dados
        // 2. Enviar email
        // 3. Liberar produto
        // 4. Registrar log
        
        return res.status(200).json({ 
          status: "success", 
          message: "Pagamento aprovado processado" 
        });
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Erro no webhook:", error);
    res.status(500).json({ error: "Erro interno" });
  }
});

connectToDb();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});