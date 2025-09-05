const Cupom = require('./Cupom');

const ListCupoms = (req, res) => {
    const cupoms = Cupom.find();    
    res.send(cupoms);
}

module.exports = ListCupoms;