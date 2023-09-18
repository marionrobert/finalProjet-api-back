const jwt = require('jsonwebtoken')
const secret = process.env.SECRET
// console.log("secret from amdinAuth-->", secret)

const adminAuth = (req, res, next) => {
    //on récupère notre token dans le header de la requète HTTP
    const token = req.headers['x-access-token']
    // console.log("token -->", token)

    //si il ne trouve pas de token
    if(token === undefined){
        res.json({status: 404, msg: "Erreur, le token n'a pas été trouvé."})
    } else {
        //sinon il a trouvé un token, utilisation de la fonction de vérification du token
        jwt.verify(token, secret, (err, decoded)=>{
            if(err){
                res.json({status: 401, msg: "Erreur, le token est invalide."})
            } else {
                //le token est vérifié et valide
                //on rajoute une propriété id dans req, qui récupère l'id du token décrypté
                req.id = decoded.id
                // console.log(decoded)
                if(decoded.role === "admin"){
                    //on sort de la fonction, on autorise l'accés à la callback de la route back demandée
                    next()
                } else {
                    res.json({status: 401, msg: "Erreur, vous n'êtes pas administrateur."})
                }
            }
        })
    }
}

module.exports = adminAuth
