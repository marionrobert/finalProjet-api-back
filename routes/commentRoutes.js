const withAuth = require("../withAuth")
const adminAuth = require("../adminAuth")
const mail = require('../lib/mailing');

module.exports = (app,db) => {
  const commentModel = require("../models/CommentModel")(db)
  const userModel = require("../models/UserModel")(db)
  const bookingModel = require("../models/BookingModel")(db)

  // Middleware to validate ID
  function isValidId(req, res, next) {
    const id = req.params.id || req.params.author_id || req.params.booking_id || req.params.activity_id;
    if (isNaN(id)) {
      return res.status(400).json({ status: 400, msg: "L'id renseigné n'est pas valide." });
    }
    next();
  }

  // Middleware to check if comment exists
  async function commentExists(req, res, next) {
    // console.log("in commentExists")
    const commentId = req.params.id;
    try {
        const comment = await commentModel.getOneCommentById(commentId);
        if (comment.code) {
            return res.status(500).json({ status: 500, msg: "Erreur de récupération du commentaire." });
        } else if (comment.length === 0) {
          return res.status(404).json({status: 404, msg:"Il n'existe pas de commentaire répondant à l'id renseigné."});
        }
        req.comment = comment; // Pass the comment to the next middleware
        next();
    } catch (error) {
        // console.error("Erreur lors de la vérification de l'existence du commentaire :", error);
        return res.status(500).json({ status: 500, msg: "Erreur lors de la vérification de l'existence du commentaire.", err: error.message });
    }
  }

  //route de récupération de tous les commentaires - route protégée
  app.get("/api/v1/comment/all", withAuth, async(req, res, next)=>{
    let comments = await commentModel.getAllComments()
    if (comments.code){
      // erreur
      res.json({status: 500, msg: "Erreur de récupération des commentaires.", err: comments})
    } else {
      // aucun résultat trouvé --> code 404
      if (comments.length === 0){
        res.json({status: 404, msg:"Il n'y a pas encore de commentaires."})
      } else {
        res.json({status: 200, msg: "Les commentaires ont bien été récupérés.", comments: comments})
      }
    }
  })

  //route de récupération de tous les commentaires en attente de validation par l'admin - route admin
  app.get("/api/v1/comment/all/waiting", adminAuth, async(req, res, next)=>{
    let comments = await commentModel.getAllWaitingComments()
    if (comments.code){
      // erreur
      res.json({status: 500, msg: "Erreur de récupération des commentaires en attente de validation par l'administration.", err: comments})
    } else {
      // aucun résultat trouvé --> code 404
      if (comments.length === 0){
        res.json({status: 404, msg:"Il n'y a pas de commentaires en attente de validation par l'administration."})
      } else {
        res.json({status: 200, msg: "Les commentaires en attente de validation par l'administrationont bien été récupérés.", comments: comments})
      }
    }
  })

  //route de récupération d'un commentaire par son ID - route protégée
  app.get("/api/v1/comment/one/:id", withAuth, isValidId, commentExists, async(req, res, next)=>{
    return res.status(200).json({ status: 200, msg: "Le commentaire a bien été trouvé.", comment: req.comment[0] });
  })

  //route de récupération d'un commentaire lié à une résa - route protégée
  app.get("/api/v1/comment/one/booking/:booking_id", withAuth, isValidId, async(req, res, next)=>{
    try {
      let comment = await commentModel.getOneCommentByBookingId(req.params.booking_id)
      // erreur
      if (comment.code){
        res.json({status: 500, msg: "Erreur de récupération du commentaire.", err: comment})
      } else {
        // aucun résultat trouvé --> code 404
        if (comment.length === 0){
          res.json({status: 404, msg:"Il n'existe pas encore de commentaire lié à cette réservation."})
        } else {
          res.json({status: 200, msg: "Le commentaire a bien été récupéré.", comment: comment[0]})
        }
      }
    } catch (error) {
      // console.log("Erreur de récupération du commentaire. -->", error)
      res.status(500).json({status: 500, msg: "Erreur de récupération du commentaire.", err: error.message})
    }
  })

  // route de récupération des commentaires liés à une activité qui ont été validés par l'admin - route protégée
  app.get("/api/v1/comment/all/activity/:activity_id", withAuth, isValidId, async(req, res, next)=>{
    try {
      let comments = await commentModel.getAllCommentsByActivityId(req.params.activity_id)
      if (comments.code){
        // erreur
        res.json({status: 500, msg: "Erreur de récupération des commentaires validés liés à cette activité.", err: comments})
      } else {
        // aucun résultat trouvé --> code 404
        if (comments.length === 0){
          res.json({status: 404, msg:"Il n'existe pas encore de commentaires validés liés à cette activité."})
        } else {
          res.json({status: 200, msg: "Les commentaires validés liés à l'activité ont bien été récupérés.", comments: comments})
        }
      }
    } catch (error) {
      // console.log("Erreur de récupération des commentaires validés liés à cette activité. -->", error)
      res.status(500).json({status: 500, msg: "Erreur de récupération des commentaires validés liés à cette activité.", err: comment})
    }
  })

  //route de récupération des commentaires qui ont une note élevée (page d'accueil)
  app.get("/api/v1/comment/all/highscore", async(req, res, next)=>{
    try {
      let comments = await commentModel.getAllHighScoreComments()
      if (comments.code){
        // erreur
        res.json({status: 500, msg: "Erreur de récupération des commentaires validés avec un score élevé.", err: comments})
      } else {
        // aucun résultat trouvé --> code 404
        if (comments.length === 0){
          res.json({status: 404, msg:"Il n'y a pas encore de commentaires validés avec un score élevé."})
        } else {
          res.json({status: 200, msg: "Les commentaires validés avec un score élevé ont bien été récupérés.", comments: comments})
        }
      }
    } catch (error) {
      // console.log("Erreur de récupération des commentaires validés avec un score élevé. -->", error)
      res.status(500).json({status: 500, msg: "Erreur de récupération des commentaires validés avec un score élevé.", err: error.message})
    }
  })

  // route de récupération des commentaires rédigés par un même utilisateur - route protégée
  app.get("/api/v1/comment/all/author/:author_id", isValidId, withAuth, async(req, res, next)=>{
    try {
      let comments = await commentModel.getAllCommentsByAuthorId(req.params.author_id)
      if (comments.code){
        // erreur
        res.json({status: 500, msg: "Erreur de récupération des commentaires liés à l'utilisateur.", err: comments})
      } else {
        // aucun résultat trouvé --> code 404
        if (comments.length === 0){
          res.json({status: 404, msg:"Il n'y a pas encore de commentaires liés à l'utilisateur."})
        } else {
          res.json({status: 200, msg: "Les commentaires liés à l'utilisateur ont bien été récupérés.", comments: comments})
        }
      }
    } catch (error) {
      // console.log("Erreur de récupération des commentaires liés à l'utilisateur. -->", error)
      res.status(500).json({status: 500, msg: "Erreur de récupération des commentaires liés à l'utilisateur.", err: error.message})
    }

  })

  // route de création d'un commentaire - route protégée
  app.post("/api/v1/comment/save", withAuth, async(req,res,next)=>{
    // création du commentaire uniquement si la réservation est terminée
    let booking = await bookingModel.getOneBooking(req.body.booking_id)
    if (booking.code){
      // erreur
      res.json({status: 500, msg:"Erreur de récupération de la réservation.", err: booking})
    } else {
      // aucun résultat trouvé --> code 404
      if(booking.length === 0){
        res.json({status: 404, msg:"Il n'existe pas de réservation correspond à l'id renseigné."})
      } else {
        if (booking[0].booking_status !== "finished"){
          res.json({status: 401, msg:"Vous ne pouvez pas laissé un commentaire tant que l'activité n'a pas été réalisée."})
        } else {
          let commentAlreadyExisting = await commentModel.getOneCommentByBookingId(req.body.booking_id)
          // console.log("commentAlreadyExisting -->", commentAlreadyExisting)
          if (commentAlreadyExisting.code){
            // erreur
            res.json({status: 500, msg:"Erreur de vérification du commentaire déjà existant. Le processus de création du commentaire n'a pas pu aboutir.", err: commentAlreadyExisting})
          } else {
            if (commentAlreadyExisting.length > 0){
              res.json({status: 401, msg:"Un commentaire existe déjà pour cette réservation.", comment: commentAlreadyExisting[0]})
            } else {
              let comment = await commentModel.saveOneComment(req)
              if (comment.code){
                // erreur
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
  app.put("/api/v1/comment/update/:id", withAuth, isValidId, commentExists, async(req, res, next)=>{
    try {
      if (req.comment[0].status === "validated"){
        res.json({status: 401, msg:"Le commentaire a déjà été validé par l'administration, vous ne pouvez plus le modifier."})
      } else {
        // si le commentaire n'est as encore validé, possibilité de la modifier
        let resultUpdating = await commentModel.updateOneComent(req, req.params.id)
        if (resultUpdating.code){
          // erreur
          res.json({status: 500, msg: "Le processus de modification du commentaire n'a pas pu aboutir.", err: resultUpdating})
        } else {
          // succès: le commentaire a été mis à jour
          res.json({status: 200, msg: "Le commentaire a bien été mis à jour."})
        }
      }
    } catch (error) {
      // console.log("Erreur lors de la mise à jour d'un commentaire. -->", error)
      res.status(500).json({status: 500, msg: "Erreur lors de la mise à jour d'un commentaire.", err: error.message});
    }
  })

  //route de suppression d'un commentaire - route protégée
  app.delete("/api/v1/comment/delete/:id", withAuth, isValidId, commentExists, async(req, res, next)=>{
    try {
      let comment = await commentModel.deleteOneComment(req.params.id)
      if (comment.code){
        res.json({status: 500, msg: "Erreur: le processus de  suppression du commentaire n'a pas pu aboutir.", err: comment})
      } else {
        res.json({status: 200, msg: "Le commentaire a bien été supprimé."})
      }
    } catch (error) {
      // console.log("Erreur lors de suppression d'un commentaire. -->", error)
      res.status(500).json({status: 500, msg: "Erreur lors de suppression d'un commentaire.", err: error.message});
    }
  })

  //route de validation du commentaire - route admin
  app.put("/api/v1/comment/moderate/:id", adminAuth, isValidId, commentExists, async(req, res, next)=>{
    // console.log("req.comment -->", req.comment)
    try {
      // modération : changement de statut du commentaire
      let resultModeration = await commentModel.moderateComment(req, req.params.id)
      if (resultModeration.code){
        // erreur dans l'excution de la requête de modération
        res.json({status: 500, msg: "Erreur: le processus de modération du commentaire n'a pas pu aboutir.", err: resultModeration})
      } else {
        // récupération de l'auteur du commentaire
        let user = await userModel.getOneUserById(req.comment[0].author_id)
        if (user.code){
          // erreur
          res.json({status: 500, msg: "Erreur de récupération de l'auteur du commentaire"})
        } else {
          // aucun résultat trouvé --> code 404
          if (user.length === 0){
            res.json({status: 401, msg: "L'utilisateur n'a pas été retrouvé. Aucun email n'a pu lui être envoyé."})
          } else {
            if (req.body.status === "validated"){
              // envoi du mail à l'auteur du commmentaire pour le prévenir que le commentaire a été validé
              mail(
                user[0].email,
                `Validation de votre commentaire pour la réservation n°${req.comment[0].booking_id}`,
                `Validation de votre commentaire pour la réservation n°${req.comment[0].booking_id}`,
                `Le commentaire que vous avez laissé a été validé par l'administration. Il est désormais en ligne.\n Le service Harmony`
              )
            //  succès: le commentaire a bie été validé
              res.json({status: 200, msg: "Le commentaire a bien été validé."})
            } else {
              // envoi du mail à l'auteur du commmentaire pour le prévenir que le commentaire n'a pas été validé
              mail(
                user[0].email,
                `Invalidation de votre commentaire pour la réservation n°${req.comment[0].booking_id}`,
                `Invalidation de votre commentaire pour la réservation n°${req.comment[0].booking_id}`,
                `Le commentaire que vous avez laissé n'a pas été validé par l'administration pour le motif suivant: « ${req.body.explanation} ». Vous pouvez modifier votre commentaire en prenant en compte cette remarque.\n Le service Harmony`
              )
              // succès: le commentaire a bien été invalidé
              res.json({status: 200, msg: "Le commentaire a bien été invalidé."})
            }
          }
        }
      }
    } catch (error) {
      // console.log("Erreur lors de modération d'un commentaire. -->", error)
      res.status(500).json({status: 500, msg: "Erreur lors de modération d'un commentaire.", err: error.message});
    }

  })
}
