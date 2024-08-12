const { DataTypes } = require('sequelize')

const db = require('../db/conn')

const User = db.define('User',{
    name:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        required: true,
    },
    password: {
        type: DataTypes.STRING,
        required: true,
    },
    confirmpassword:{
        type: DataTypes.STRING,

    }

})

module.exports = User