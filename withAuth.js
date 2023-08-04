const jwt = require('jsonwebtoken')
const secret = "pbio8451*$"

const withAuth = (req, res, next) => {
    //on récupère notre token dans le header de la requète HTTP
    const token = req.headers['x-access-token']

    //s'il ne trouve pas de token
    if(token === undefined){
        res.json({status: 404, msg: "Erreur: aucun token n'a été trouvé."})
    } else {
        //sinon il a trouvé un token, utilisation de la fonction de vérification du token
        jwt.verify(token, secret, (err, decoded)=>{
            if(err){
                res.json({status: 401, msg: "Erreur: le token est invalide."})
            } else {
                //le token est vérifié et valide
                //on rajoute une propriété id dans req, qui récupère l'id du token décrypté
                req.id = decoded.id
                //on sort de la fonction, on autorise l'accés à la callback de la route back demandée
                next()
            }
        })
    }
}

module.exports = withAuth
