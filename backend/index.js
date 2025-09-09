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
    const { type, data } = req.body;

    if (type === "payment") {
      const paymentId = data.id;

      // Consultar o pagamento na API oficial do MP
      const response = await axios.get(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer APP_USR-7932112160870899-090608-086afe9324ef4d53debb58635846b322-1840600103`,
          },
        }
      );

      const payment = response.data;

      if (payment.status === "approved") {
        console.log("✅ Pagamento aprovado:", payment.id);

        // >>> Aqui você executa sua ação (ex: liberar pedido, enviar e-mail, etc)
        // exemplo: liberarProduto(payment.external_reference);

        return res.status(200).send("Pagamento aprovado");
      } else {
        console.log("⚠️ Pagamento não aprovado:", payment.status);
        return res.status(200).send("Pagamento não aprovado");
      }
    }

    res.sendStatus(200); // resposta padrão para outros tipos de evento
  } catch (error) {
    console.error("❌ Erro no webhook:", error.message);
    res.sendStatus(500);
  }
});

connectToDb();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});