const jwt = require("jsonwebtoken");
const config = require("../config/settings");

function verificaToken(req,res,next){
    const token_enviado = req.headers.token;

    if(!token_enviado){
        return res.status(401).send({
            output:`Nãop existe token. realizer o processo de autenticacao",`
        });
    }

    jwt.verify(token_enviado,config.jwt_secret,(err,result)=>{
        if(err){
            return res.status(500).send({output:`Erro interno -> ${err}`});
        }
            req.content = {
                id:result.idusuario,
                usuario:result.nomeusuario,
                email:result.email
            };
            return next();
 
    });
}
module.exports = verificaToken;