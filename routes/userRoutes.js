const bcrypt = require("bcrypt")
const saltRounds = 10

// librairie qui va générer un token de connexion
const jwt = require("jsonwebtoken")
const secret = process.env.SECRET
// console.log("secret from userRoutes -->", secret)
const withAuth = require("../withAuth")

module.exports = (app, db) => {
  const userModel = require("../models/UserModel")(db)

  //route d'enregistrement d'un utilisateur
  app.post("/api/v1/user/register", async(req,res, next)=>{
    let check = await userModel.getUserByEmail(req.body.email)
    if (check.code){
      res.json({status: 500, msg: "La vérification de l'existence du mail n'a pas pu aboutir"})
    } else {
      if (check.length > 0) {
        res.json({status: 401, msg: "Un compte existe déjà avec cette adresse email. Veuillez vous connecter."})
      } else {
        let user = await userModel.saveOneUser(req)
        if (user.code){
          res.json({status: 500, msg: "Erreur dans la création d'un nouvel utilisateur."})
        } else {
          res.json({status: 200, msg: "Le compte utilisateur a bien été créé."})
        }
      }
    }
  })

  //route de connexion d'un utilisateur (c'est ici qu'on va créer le token et l'envoyer vers le front)
  app.post('/api/v1/user/login', async (req, res, next)=>{
    if(req.body.email === ""){
        res.json({status: 401, msg: "Entrez un email..."})
    } else {
        //on check si il existe un utilisateur dans la bdd avec un mail correspondant
        let user = await userModel.getUserByEmail(req.body.email)
        if(user.code){
            res.json({status: 500, msg: "Erreur vérification email.", err: user})
        }else{
            //si il n'existe pas
            if(user.length === 0){
                res.json({status:404, msg: "Pas d'utilisateur correspondant à ce mail."})
            } else {
                //la bdd a retourné un objet d'utilisateur pour ce mail
                //on compare les password avec bcrypt
                let same = await bcrypt.compare(req.body.password, user[0].password)
                //si c'est true, les mdp sont identiques
                if(same){
                    //on va créer le payload du token, dans ce payload on stock les valeurs qu'on va glisser dans le token (attention jamais d'infos craignos)
                    const payload = {email: req.body.email, id: user[0].id, role: user[0].role}
                    //on crée notre token avec sa signature (secret)
                    const token = jwt.sign(payload, secret)
                    let connect = await userModel.updateConnexion(user[0].id)
                    if(connect.code){
                        res.json({status: 500, errr: connect})
                    } else {
                        res.json({status: 200, token: token, user: user[0]})
                    }
                }else{
                    res.json({status: 401, error: "Votre mot de passe est incorrect!"})
                }
            }
        }
    }
  })

  // //route de modification des utilisateurs
  // app.put("/api/v1/user/update/:id", withAuth, async(req, res, next)=>{
  //   if (isNaN(req.params.id)){
  //     res.json({status: 500, msg: "L'id renseigné n'est pas un nombre"})
  //   } else {
  //     let user = await userModel.updateUser(req, req.params.id)
  //     if (user.code){
  //       res.json({status: 500, msg: "Les informations de l'utilisateur n'ont pas été mises à jour."})
  //     } else {
  //       //mon profil est modifié je renvoie les infos du profil mises à jour vers le front (pour que redux mette à jour immédiatement les infos d'utilisateur connecté)
  //       let newUser = await userModel.getOneUser(req.params.id)
  //       if(newUser.code){
  //           res.json({status: 500, msg: "Un problème est survenu.", err: newUser})
  //       } else {
  //           res.json({status: 200, result: user, newUser: newUser[0], msg: "Les informations de l'utilisateur ont bien été mises à jour." })
  //       }
  //     }
  //   }
  // })
}
