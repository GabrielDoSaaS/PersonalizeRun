const routes = require('express').Router();
const BuyTheProductController = require('./BuyTheProductController');
const CreateACupon = require('./CreateACupon');
const ListPayers = require('./ListPayers');
const ListCupoms = require('./ListCupoms');
const DatabasePayers = require('./DatabasePayers');

routes.post('/buy-product', BuyTheProductController);
routes.post('/create-cupom', CreateACupon);
routes.get('/list-payers', ListPayers);
routes.get('/list-cupoms', ListCupoms);



routes.post('/webhook/:userName/:personalized/:email/:code/:blood/:arlegies', async (req, res) => {
    const payment = req.query;
    const p = req.body;
    console.log({payment});
    const paymentId = payment.id;
    const {} = req.params;

        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer APP_USR-1767806761428068-070620-771a230aa8ff67512387deefe1bd14ef-192552961"
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