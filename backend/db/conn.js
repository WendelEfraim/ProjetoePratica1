const { Sequelize } = require('sequelize')
const sequelize = new Sequelize ('Escola', 'root', '',{
    host: 'localhost',
    dialect: 'mysql'
})

try{
    sequelize.authenticate()
    console.log('Conectado')
} catch(err){
    console.log('Não foi possivel conectar devido ao erro :', error)
}

module.exports = sequelize