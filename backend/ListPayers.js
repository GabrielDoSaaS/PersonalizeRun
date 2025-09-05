const DatabasePayers = require('./DatabasePayers');

const ListPayers = async (req, res) => {
    const payers = await DatabasePayers.find();
     res.json(payers);
}

module.exports = ListPayers;