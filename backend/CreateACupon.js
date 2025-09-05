const Cupom = require('./Cupom');

const CreateACupon = (req, res) => {
    const { code, porcent } = req.body;

    const newCupom = new Cupom({ code, porcent });

    newCupom.save()
        .then(() => res.status(201).json({ message: 'Cupom created successfully' }))
        .catch((error) => res.status(500).json({ error: 'Error creating cupom', details: error }));

}

module.exports = CreateACupon;