const withAuth = require("../withAuth")
const jwt = require("jsonwebtoken")
const secret = process.env.SECRET
// console.log("secret from adminRoutes-->", secret)

// route permettant la gestion de la connexion par token (avec le front qui jouera avec redux)
module.exports = (app, db)=>{
  const userModel = require("../models/UserModel")(db)

  // route de récupération des infos de l'utilisateur par son token (permet la reconnexion automatique du front)
  app.get('/api/v1/user/checkToken', withAuth, async (req, res, next) => {
    // console.log("req.id -->", req.id)
    let user = await userModel.getOneUserById(req.id)
    // console.log("user -->", user)
    if(user.code){
        res.json({status: 500, err: user})
    } else {
        let myUser = {
          id: user[0].id,
          email: user[0].email,
          firstName: user[0].firstName,
          lastName: user[0].lastName,
          role: user[0].role,
          phone: user[0].phone,
          avatar: user[0].avatar,
          key_id: user[0].key_id,
          points: user[0].points
        }
        res.json({status: 200, user: myUser})
    }
  })
}
