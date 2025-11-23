const path = require('path');

// Sirve la vista de Login
const getLoginView = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/login.html'));
};

// Sirve la vista de Registro
const getRegisterView = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/register.html'));
};

module.exports = {
    getLoginView,
    getRegisterView
};