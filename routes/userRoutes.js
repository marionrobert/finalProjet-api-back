const bcrypt = require("bcrypt")
const saltRounds = 10

// librairie qui va générer un token de connexion
const jwt = require("jsonwebtoken")
const secret = process.env.SECRET
// console.log("secret from userRoutes -->", secret)

const mail = require('../lib/mailing');
// authentification simple
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
          // et on envoie un mail si l'ajout s'est bien passé
          mail(
            req.body.email,
            "validation de votre compte Harmony",
            "Bienvenue sur Harmony",
            //lolalhost
            `Pour valider votre compte, veuillez cliquer <a href="http://localhost:9000/api/v1/user/validate/${user.key_id}">ici</a> !\n Le service Harmony`
            // ide
            // `Pour valider votre compte, veuillez cliquer <a href="http://marionrobert.ide.3wa.io:9000/api/v1/user/validate/${user.key_id}">ici</a> !\n Le service Harmony`
          )
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
            res.json({status: 500, msg: "Une erreur est survenue dans la vérification du mail.", err: user})
        }else{
            //si il n'existe pas
            if(user.length === 0){
                res.json({status:404, msg: "Il n'existe pas d'utilisateur correspondant au mail renseigné."})
            } else {
                //la bdd a retourné un objet d'utilisateur pour ce mail
                if(user[0].accountIsConfirmed === "no"){
                  res.json({status: 403, msg: "Vous n'avez pas encore validé votre compte."})
                } else {
                  //on compare les password avec bcrypt
                  let same = await bcrypt.compare(req.body.password, user[0].password)
                  //si c'est true, les mdp sont identiques
                  if(same){
                      // création du payload du token, dans ce payload on stock les valeurs qu'on va glisser dans le token
                      const payload = {email: req.body.email, id: user[0].id, role: user[0].role}
                      //on crée notre token avec sa signature (secret)
                      const token = jwt.sign(payload, secret)
                      let connect = await userModel.updateConnexion(user[0].id)
                      if(connect.code){
                          res.json({status: 500, msg: "Erreur de mise à jour de la connexion", err: connect})
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
                          res.json({status: 200, msg: "L'utilisateur est connecté", token: token, user: myUser})
                      }
                  }else{
                      res.json({status: 401, msg: "Votre mot de passe est incorrect."})
                  }
                }
            }
        }
    }
  })

  //route de validation d'un compte (par son key_id)
  app.get("/api/v1/user/validate/:key_id", async(req, res, next)=>{
    let info = null
    let error = null
    let validation = await userModel.validateAccount(req.params.key_id)
    if (validation.code){
      // res.json({status: 500, msg:"La validation du compte n'a pas pu aboutir"})
      error = "Une erreur est survenue lors de la validation de votre compte. Veuillez recommencer ou contacter notre service client."
      res.render("validation", {info: info, error: error})
    } else {
      info = "Félicitations, votre compte a bien été validé! Nous vous offrons 5 points de bienvenue! Vous pouvez désormais vous connecter."
      res.render('validation', {info: info, error: error})
    }
  })

  //route de demande de récupération de mot de passe oublié
  app.post("/api/v1/user/forgotPassword", async(req, res, next)=>{
    let user_existing = await userModel.getUserByEmail(req.body.email)
    if (user_existing.code){
      res.json({status: 500, msg: "Erreur de récupération de l'utilisateur.", err: user_existing })
    } else {
      if (user_existing.length === 0){
        res.json({status: 404, msg:"Il n'existe pas d'utilisateur avec cet email."})
      } else {
        //optionnel : on change le key_id (sécurité supplémentaire)
        console.log("je vais changer le key_id")
        let new_key_id = await userModel.updateKeyId(req.body.email)
        console.log("resultat de la requête await userModel.updateKeyId(req.body.email) -->", new_key_id)
        if (new_key_id.code){
          res.json({status: 500, msg: "Erreur dans le changement du key_id"})
        } else {
          let userUpdated = await userModel.getUserByEmail(req.body.email)
          if (userUpdated.code){
            res.json({status: 500, msg: "Erreur de récupération de l'utilisateur.", err: user_existing })
          } else {
            if (userUpdated.length === 0){
              res.json({status: 404, msg:"Il n'existe pas d'utilisateur avec cet email."})
            } else {
            mail(req.body.email,
              "Demande de changement de mot de passe",
              "Oups! Vous avez oublié votre mot de passe ?",
              // localhost
              `Pour modifier votre mot de passe, cliquez <a href="http://localhost:9000/api/v1/user/changePassword/${userUpdated[0].key_id}">ici</a>! \n Le service Harmony`
              // ide
              // `Pour modifier votre mot de passe, cliquez <a href="http://marionrobert.ide.3wa.io:9000/api/v1/user/changePassword/${userUpdated[0].key_id}">ici</a>! \n Le service Harmony`
            )
            res.json({status: 200, msg: "Email de changement de mot de passe envoyé!"})
            }
          }
        }
      }
    }
  })

  //route d'affichage du template de modification de password (ejs)
  app.get('/api/v1/user/changePassword/:key_id', async (req, res, next) => {
    res.render('forgot', {key_id: req.params.key_id, info: null, error: null})
  })

  //route de modification du mot de passe
  app.post('/api/v1/user/changePassword/:key_id', async (req, res, next) => {
    let info = null
    let error = null
    console.log("hello from userRoutes in api back")
    console.log("req.body.password1", req.body.password1)
    console.log("req.body.password1", req.body.password2)
    if(req.body.password1 !== req.body.password2){
        error = "Vos deux mots de passe ne sont pas identiques!"
    } else {
        let result = await userModel.updatepassword(req.body.password1, req.params.key_id)
        console.log("result updatepassword -->", result)
        if(result.code){
            error = "Le mot de passe n'a pas pu être modifié. Veuillez réessayer ou contacter le service client."
        } else {
            info = "Le mot de passe a bien été modifié! Vous pouvez désormais vous connecter."
        }
    }
    res.render('forgot', {key_id: req.params.key_id, info: info, error: error})
  })

  //route de modification des utilisateurs
  app.put("/api/v1/user/update/:key_id", withAuth, async(req, res, next)=>{
    let user = await userModel.getOneUserByKeyId(req.params.key_id)
    if (user.code){
      res.json({status: 500, msg: "L'utilisateur n'a pas été retrouvé."})
    } else {
      let result = await userModel.updateUser(req, req.params.key_id)
      if (result.code){
        res.json({status: 500, msg: "Les informations de l'utilisateur n'ont pas pu être mises à jour.", err: result})
      } else {
        let newUser = await userModel.getOneUserByKeyId(req.params.key_id)
        if(newUser.code){
            res.json({status: 500, msg: "Un problème est survenu.", err: newUser})
        } else {
            res.json({status: 200, msg: "Les informations de l'utilisateur ont bien été mises à jour.", user:newUser[0]})
        }
      }
    }
  })

  // route de modification de la photo de profil
  app.put("/api/v1/user/update-avatar/:key_id", withAuth, async(req, res, next)=>{
    console.log("req.body.avatar, req.params.key_id -->", req.body.avatar, req.params.key_id)
    let changeAvatar = await userModel.updateAvatar(req.body.avatar, req.params.key_id)
    if (changeAvatar.code){
      res.json({status: 500, msg: "Erreur de modification de l'image de profil.", err: changeAvatar})
    } else {
      let user = await userModel.getOneUserByKeyId(req.params.key_id)
      if (user.code){
        res.json({status: 500, msg: "Erreur de récupération de l'utilisateur", err: user})
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
        res.json({status: 200, msg: "Image de profil modifiée.", user: myUser })
      }
    }
  })

  app.get("/api/v1/user/one/:key_id", withAuth, async(req, res, next)=>{
    let user = await userModel.getOneUserByKeyId(req.params.key_id)
    if (user.code){
      res.json({status: 500, msg: "Erreur de récupération de l'utilisateur", err: user })
    } else {
      if (user.length === 0){
        res.json({status: 404, msg: "Il n'existe pas d'utilisateur correspond au key_id renseigné", user: user })
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
        res.json({status: 200, msg: "User récupéré.", user: myUser })
      }
    }
  })

  app.get("/api/v1/user/one/id/:id", async(req, res, next)=>{
    let user = await userModel.getOneUserById(req.params.id)
    if (user.code){
      res.json({status: 500, msg: "Erreur de récupération de l'utilisateur", err: user })
    } else {
      if (user.length === 0){
        res.json({status: 404, msg: "Il n'existe pas d'utilisateur correspond à l'id renseigné", user: user })
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
        res.json({status: 200, msg: "User récupéré.", user: myUser })
      }
    }
  })
}
