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
          const { type, id } = req.query;
          
          if (type !== 'payment') return res.status(200).send('Ignored');
          
          // Buscar dados COMPLETOS do pagamento
          const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
              headers: { "Authorization": "Bearer APP_USR-7932112160870899-090608-086afe9324ef4d53debb58635846b322-1840600103" }
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

connectToDb();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});