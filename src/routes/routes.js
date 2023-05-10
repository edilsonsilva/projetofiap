const express = require("express");
const bcrypt = require("bcrypt");
const gerarToken = require("../utils/gerartoken")
const router = express.Router();
const Cliente = require("../models/cliente")
const verifica = require("../middleware/verificartoken")


router.get("/", (req, res) => {
    Cliente.find().select("-senha").then((result) => {
        res.status(200).send({ output: "ok", payload: result });
    }).catch((erro) => {
        res.status(500).send({ output: `Erro ao processar dados -> ${erro}` });
    });
});

router.post("/insert", (req, res) => {
    
    bcrypt.hash(req.body.senha, 10, (err,result)=>{
        if(err){
            return res.status(500).send({ retorno: `Erro ao gerar a senha -> ${err}`});
        }
    
    req.body.senha = result;
    
    const dados = new Cliente(req.body);
    
    console.log(dados);

    dados.save().then((result) => {
        res.status(201).send({ output: `Cadastro realizado`, payload: result });
    }).catch((erro) => {
        res.status(500).send({ output: `Erro ao cadastrar -> ${erro}` })
    });
    });
});

router.put("/update/:id", verifica,(req, res) => {
    Cliente.findByIdAndUpdate(req.params.id,req.body,{new:true}).then((result)=>{
        if(!result){
            return res.status(400).send({output:`Não foi possível atualizar`});
        }
        res.status(202).send({output:`Atualizado`,payload:result});
    }).catch((erro)=>{
        res.status(500).send({output:`Erro ao processar a solicitação -> ${erro}`});
    });
});


router.delete("/delete/:id", verifica,(req, res) => {
    Cliente.findByIdAndDelete(req.params.id).then((result)=>{
        res.status(204).send({payload:result});
    }).catch((erro)=>console.log(`Erro ao tentar apagar -> ${erro}`));
});


router.post("/login",(req,res)=>{
    const usuario = req.body.usuario;
    const senha = req.body.senha;
    Cliente.findOne({usuario:usuario}).then((result)=>{
        if(!result){
            return res.status(404).send({output:`Usuário não cadastrado`});
        }
        bcrypt.compare(senha, result.senha).then((rs)=>{
            if(!rs){
                return res.status(400).send({output:`Senha incorreta`});
            }
            const token = gerarToken(result._id,result.usuario,result.email);
            res.status(200).send({output:`Autenticado`,token:token});
        }).catch((err)=>res.status(500).send({output:`Erro ao processar dados -> ${err}`}));
    }).catch((error)=>res.status(500).send({output:`Erro ao tentar efetuar o login -> ${error}`}));
})


router.use((req, res) => {
    res.type("appllication/json");
    res.status(404).send("404 - Not Found");
});

module.exports = router;
