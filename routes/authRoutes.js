const withAuth = require("../withAuth")
const jwt = require("jsonwebtoken")
const secret = process.env.SECRET
// console.log("secret from adminRoutes-->", secret)

// route permettant la gestion de la connexion par token (avec le front qui jouera avec redux)
module.exports = (app, db)=>{
  const userModel = require("../models/UserModel")(db)

  // route de récupération des infos de l'utilisateur par son token (permet la reconnexion automatique du front)
  app.get('/api/v1/user/checkToken', withAuth, async (req, res, next) => {
    console.log("coucou")
    let user = await userModel.getOneUser(req.id)
    if(user.code){
        res.json({status: 500, err: user})
    } else {
        res.json({status: 200, user: user[0]})
    }
  })
}
