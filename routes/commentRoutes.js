const withAuth = require("../withAuth")
const adminAuth = require("../adminAuth")
const { admin } = require("googleapis/build/src/apis/admin")
const mail = require('../lib/mailing');

module.exports = (app,db) => {
  const commentModel = require("../models/CommentModel")(db)
  const userModel = require("../models/UserModel")(db)
  const bookingModel = require("../models/BookingModel")(db)

  //route de récupération de tous les commentaires - route protégée
  app.get("/api/v1/comment/all", withAuth, async(req, res, next)=>{
    let comments = await commentModel.getAllComments()
    if (comments.code){
      res.json({status: 500, msg: "Erreur de récupération des commentaires.", err: comments})
    } else {
      if (comments.length === 0){
        res.json({status: 401, msg:"Il n'y a pas encore de commentaires."})
      } else {
        res.json({status: 200, msg: "Les commentaires ont bien été récupérés.", comments: comments})
      }
    }
  })

  //route de récupération de tous les commentaires en attente de validation par l'admin - route admin
  app.get("/api/v1/comment/all/waiting", adminAuth, async(req, res, next)=>{
    let comments = await commentModel.getAllWaitingComments()
    if (comments.code){
      res.json({status: 500, msg: "Erreur de récupération des commentaires en attente de validation par l'administration.", err: comments})
    } else {
      if (comments.length === 0){
        res.json({status: 401, msg:"Il n'y a pas de commentaires en attente de validation par l'administration."})
      } else {
        res.json({status: 200, msg: "Les commentaires en attente de validation par l'administrationont bien été récupérés.", comments: comments})
      }
    }
  })

  //route de récupération d'un commentaire par son ID - route protégée
  app.get("/api/v1/comment/one/:id", withAuth, async(req, res, next)=>{
    if (isNaN(req.params.id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      let comment = await commentModel.getOneCommentById(req.params.id)
      if (comment.code){
        res.json({status: 500, msg: "Erreur de récupération du commentaire.", err: comment})
      } else {
        if (comment.length === 0){
          res.json({status: 401, msg:"Il n'existe pas de commentaire répondant à l'id renseigné."})
        } else {
          res.json({status: 200, msg: "Le commentaire a bien été récupéré.", comment: comment})
        }
      }
    }
  })

  //route de récupération d'un commentaire lié à une résa - route protégée
  app.get("/api/v1/comment/one/booking/:booking_id", withAuth, async(req, res, next)=>{
    if (isNaN(req.params.booking_id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      let comment = await commentModel.getOneCommentByBookingId(req.params.booking_id)
      if (comment.code){
        res.json({status: 500, msg: "Erreur de récupération du commentaire.", err: comment})
      } else {
        if (comment.length === 0){
          res.json({status: 401, msg:"Il n'existe pas encore de commentaire lié à cette réservation."})
        } else {
          res.json({status: 200, msg: "Le commentaire a bien été récupéré.", comment: comment})
        }
      }
    }
  })

  // route de récupération des commentaires liés à une activité qui ont été validés par l'admin - route protégée
  app.get("/api/v1/comment/all/activity/:activity_id", withAuth, async(req, res, next)=>{
    if (isNaN(req.params.activity_id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      let comments = await commentModel.getAllCommentsByActivityId(req.params.activity_id)
      if (comments.code){
        res.json({status: 500, msg: "Erreur de récupération des commentaires validés liés à cette activité.", err: comments})
      } else {
        if (comments.length === 0){
          res.json({status: 401, msg:"Il n'existe pas encore de commentaires validés liés à cette activité."})
        } else {
          res.json({status: 200, msg: "Les commentaires validés liés à l'activité ont bien été récupérés.", comments: comments})
        }
      }
    }
  })

  //route de récupération des commentaires qui ont une note élevée (page d'accueil)
  app.get("/api/v1/comment/all/highscore", async(req, res, next)=>{
    let comments = await commentModel.getAllHighScoreComments()
    if (comments.code){
      res.json({status: 500, msg: "Erreur de récupération des commentaires validés avec un score élevé.", err: comments})
    } else {
      if (comments.length === 0){
        res.json({status: 401, msg:"Il n'y a pas encore de commentaires validés avec un score élevé."})
      } else {
        res.json({status: 200, msg: "Les commentaires validés avec un score élevé ont bien été récupérés.", comments: comments})
      }
    }
  })

  // route de création d'un commentaire - route protégée
  app.post("/api/v1/comment/save", withAuth, async(req,res,next)=>{
    // création du commentaire uniquement si la réservation est terminée
    let booking = await bookingModel.getOneBooking(req.body.booking_id)
    if (booking.code){
      res.json({status: 500, msg:"Erreur de récupération de la réservation.", err: booking})
    } else {
      if(booking.length === 0){
        res.json({status: 401, msg:"Il n'existe pas de réservation correspond à l'id renseigné."})
      } else {
        if (booking[0].booking_status !== "terminée"){
          res.json({status: 401, msg:"Vous ne pouvez pas laissé un commentaire tant que l'activité n'a pas été réalisée."})
        } else {
          let commentAlreadyExisting = await commentModel.getOneCommentByBookingId(req.body.booking_id)
          // console.log("commentAlreadyExisting -->", commentAlreadyExisting)
          if (commentAlreadyExisting.code){
            res.json({status: 500, msg:"Erreur de vérification du commentaire déjà existant. Le processus de création du commentaire n'a pas pu aboutir.", err: commentAlreadyExisting})
          } else {
            if (commentAlreadyExisting.length > 0){
              res.json({status: 401, msg:"Un commentaire existe déjà pour cette réservation.", comment: commentAlreadyExisting[0]})
            } else {
              let comment = await commentModel.saveOneComment(req)
              if (comment.code){
                res.json({status: 500, msg: "Erreur dans la création du commentaire: le processus n'a pas pu aboutir.", err: comment})
              } else {
                res.json({status: 200, msg: "Le commentaire a bien été créé. Il est en attente de validation par l'administration."})
              }
            }
          }
        }
      }
    }
  })

  // route de mise à jour d'un commentaire -route protégée
  app.put("/api/v1/comment/update/:id", withAuth, async(req, res, next)=>{
    if (isNaN(req.params.id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      let comment = await commentModel.getOneCommentById(req.params.id)
      if (comment.code){
        res.json({status: 500, msg: "Erreur de récupération du commentaire. Le processus de modification n'a pas pu aboutir.", err: comment})
      } else {
        if (comment.length === 0){
          res.json({status: 401, msg: "Il n'existe pas de commentaire lié à cet id."})
        } else {
          if (comment[0].status === "validé"){
            res.json({status: 401, msg:"Le commentaire a déjà été validé par l'administration, vous ne pouvez plus le modifier."})
          } else {
            let resultUpdating = await commentModel.updateOneComent(req, req.params.id)
            if (resultUpdating.code){
              res.json({status: 500, msg: "Erreur: le processus de modification du commentaire n'a pas pu aboutir.", err: resultUpdating})
            } else {
              res.json({status: 200, msg: "Le commentaire a bien été mis à jour.", resultUpdating: resultUpdating})
            }
          }
        }
      }
    }
  })

  //route de suppression d'un commentaire -route protégée
  app.delete("/api/v1/comment/delete/:id", withAuth, async(req, res, next)=>{
    if (isNaN(req.params.id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      let comment = await commentModel.deleteOneComment(req.params.id)
      if (comment.code){
        res.json({status: 500, msg: "Erreur: le processus de  suppression du commentaire n'a pas pu aboutir.", err: comment})
      } else {
        res.json({status: 200, msg: "Le commentaire a bien été supprimé.", comment: comment})
      }
    }
  })

  //route de validation du commentaire - route admin
  app.put("/api/v1/comment/moderate/:id", adminAuth, async(req, res, next)=>{
    if (isNaN(req.params.id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      let comment = await commentModel.getOneCommentById(req.params.id)
      if (comment.code){
        res.json({status: 500, msg:"Erreur de récupération du commentaire. Le processus de modération n'a pas pu aboutir.", err: comment})
      } else {
        if (comment.length === 0){
          res.json({status: 401, msg: "Il n'existe pas de commentaire répondant à cet id. Le processus de modération n'a pas pu aboutir."})
        } else {
          let resultModeration = await commentModel.moderateComment(req, req.params.id)
          if (resultModeration.code){
            res.json({status: 500, msg: "Erreur: le processus de modération du commentaire n'a pas pu aboutir.", err: resultModeration})
          } else {
            let user = await userModel.getOneUserById(comment[0].author_id)
            if (user.code){
              res.json({status: 500, msg: "Erreur de récupération de l'auteur du commentaire"})
            } else {
              if (user.length === 0){
                res.json({status: 401, msg: "L'utilisateur n'a pas été retrouvé."})
              } else {
                if (req.body.status === "validé"){
                  // envoi du mail à l'auteur du commmentaire pour le prévenir que le commentaire a été validé
                  mail(
                    user[0].email,
                    `Validation de votre commentaire pour la réservation n°${comment[0].booking_id}`,
                    `Validation de votre commentaire pour la réservation n°${comment[0].booking_id}`,
                    `Le commentaire que vous avez laissé a été validé par l'administration. Il est désormais en ligne.`
                  )
                  res.json({status: 200, msg: "Le commentaire a bien été validé.", result: resultModeration})
                } else {
                  // envoi du mail à l'auteur du commmentaire pour le prévenir que le commentaire a été validé
                  mail(
                    user[0].email,
                    `Invalidation de votre commentaire pour la réservation n°${comment[0].booking_id}`,
                    `Invalidation de votre commentaire pour la réservation n°${comment[0].booking_id}`,
                    `Le commentaire que vous avez laissé n'a pas été validé par l'administration pour le motif suivant: « ${req.body.explanation} ». Vous pouvez modifier votre commentaire en prenant en compte cette remarque.`
                  )
                  res.json({status: 200, msg: "Le commentaire n'a pas été validé.", result: resultModeration})
                }
              }
            }
          }
        }
      }
    }
  })
}
