const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const connectToDb = require('./ConnectToDb');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/api', routes);

app.post("/webhook/mercadopago", async (req, res) => {
  try {
    const data = req.body;

    console.log("Webhook recebido:", data);

    // O Mercado Pago envia notificações de diferentes tipos
    if (data.type === "payment") {
      const paymentId = data.data.id;

    

      console.log(`Pagamento recebido. ID: ${paymentId}`);
    }

    // Resposta obrigatória: status 200
    res.sendStatus(200);
  } catch (error) {
    console.error("Erro no webhook:", error);
    res.sendStatus(500);
  }
});

connectToDb();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});