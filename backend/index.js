const express = require('express')
const app = express()
const pool = require('./db/conn')

app.use(express.json())

app.post('/user/register',(req, res)=>{

    const {nome, sobreNome, phone, email, senha} =req.body

    const sql = "INSERT INTO users (??, ??, ??, ??, ??) VALUES (?, ?, ?, ?,?)"
    const dados = ['nome','sobrenome','phone','email','senha',nome,sobreNome,phone,email,senha]

    if(!nome){
        res.status(422)
        .json({
            message:"Por favor insira um email"
        })
        return
    }
    if(!sobreNome){
        res.status(422)
        .json({
            message:"Por favor insira um email"
        })
        return
    }
    if(!email){
        res.status(422)
        .json({
            message:"Por favor insira um email"
        })
        return
    }
    if(!senha){
        res.status(422)
        .json({
            message:"Por favor insira um email"
        })
        return
    }

    pool.query(sql,dados,function(err){
        if(err){
            console.log(err)
        }
        res.status(201).json({
            message:"Registrado com sucesso!"
        })
    })
})

app.post('/user/login',(req,res) => {
    const {email, senha} = req.body

    if(!email){
        res.status(422).json({
            message:"Por favor digite seu email"
        })
    }
    if(!senha){
        res.status(422).json({
            message:'Por favor digite sua senha'
        })
    }

    const sql = "SELECT * FROM users(??,??) VALUES (?,?)"
    const dados = ['email', 'senha', email, senha]

    pool.query(sql,dados,function(err){
        if(err){
            console.log(err)
        }
        res.status(200).json({
            message:"Login realizado com sucesso"
        })
    })
})

app.listen('5000')