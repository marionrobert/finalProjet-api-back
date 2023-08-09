const adminAuth = require("../adminAuth")
const withAuth = require("../withAuth")

module.exports = (app, db)=>{
  const activityModel = require("../models/ActivityModel")(db)
  const bookingModel = require("../models/BookingModel")(db)
  const userModel = require("../models/UserModel")(db)

  // route de récupération de toutes les réservations - route admin
  app.get("/api/v1/bookings/all", adminAuth, async(req, res, next)=>{
    let bookings = await bookingModel.getAllBookings()
    if (bookings.code){
      res.json({status: 500, msg: "Erreur de récupération de toutes les réservations", err: bookings})
    } else {
      if (bookings.length === 0){
        res.json({status: 401, msg: "Il n'existe pas encore de réservations.", bookings: bookings})
      } else {
        res.json({status: 200, msg: "Les réservations ont bien été récupérées.", bookings: bookings})
      }
    }
  })

  // route de récupération de toutes les réservations concernant les annonces d'un utilisateur - route protégée
  app.get("/api/v1/bookings/all/:booker_id", withAuth, async(req, res, next)=>{
    let bookings = await bookingModel.getAllBookingsByBookerId(req.params.booker_id)
    if (bookings.code){
      res.json({status: 500, msg: "Erreur de récupération de toutes les réservations pour cet utilisateur.", err: bookings})
    } else {
      if (bookings.length === 0){
        res.json({status: 401, msg: "Cet utilisateur n'a pas encore fait de réservations.", bookings: bookings})
      } else {
        res.json({status: 200, msg: "Les réservations de l'utilisateur ont bien été récupérées.", bookings: bookings})
      }
    }
  })

  // route de récupération de toutes les réservations effectuées par un utilisateur (booker_id) - route protégée
  app.get("/api/v1/bookings/all/activities/:author_id", withAuth, async(req,res,next)=>{
    let bookings = await bookingModel.getAllBookingsByAuthorId(req.params.author_id)
    if (bookings.code){
      res.json({status: 500, msg: "Erreur de récupération de toutes les réservations des activités de de l'utilisateur.", err: bookings})
    } else {
      if (bookings.length === 0){
        res.json({status: 401, msg: "Cet utilisateur n'a pas encore fait de réservations cocnernant ses activités.", bookings: bookings})
      } else {
        res.json({status: 200, msg: "Les réservations concernant les activités de de l'utilisateur ont bien été récupérées .", bookings: bookings})
      }
    }
  })

  // route de récupération d'une réservation par son id - route protégée
  app.get("/api/v1/bookings/one/:id", withAuth, async(req, res, next)=>{
    if (isNaN(req.params.id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      let booking = await bookingModel.getOneBooking(req.params.id)
      if (booking.code){
        res.json({status: 500, msg: "Erreur de récupération de la réservation.", err: booking})
      } else {
        if (booking.length === 0){
          res.json({status: 401, msg: "Aucune réservation ne correspond à cet id.", booking: booking})
        } else {
          res.json({status: 200, msg: "La réservation a bien été récupérée.", booking: booking[0]})
        }
      }
    }
  })

  // route de création d'une réservation - route protégée
  app.post("/api/v1/bookings/save", withAuth, async(req,res,next)=>{
    // l'utilisateur ne peut pas réserver sa propre activité
    if (req.body.provider_id === req.body.beneficiary_id){
      res.json({status: 401, msg:"Vous ne pouvez pas réserver votre propre activité."})
    } else {
      // si l'utilisateur qui réserve est aussi le bénéficiaire
      if (req.body.beneficiary_id === req.body.booker_id){
        let user = await userModel.getOneUserById(req.body.beneficiary_id)
        if (user.code){
          res.json({status: 500, msg: "Erreur de récupération de l'utilisateur bénéficiaire", err: user})
        } else {
          // je check si l'utilisateur bénéficiaire-réservant a assez de points pour réserver
          if (user[0].points < req.body.points){
            res.json({status: 401, msg:"Vous n'avez pas assez de points pour procéder à la réservation."})
          } else {
            // on procède à la réservation
            let booking = await bookingModel.saveOneBooking(req)
            if (booking.code){
              res.json({status: 500, msg: "Erreur de création de la réservation.", err: booking})
            } else {
              res.json({status: 200, msg: "La réservation a bien été crée.", booking: booking})
            }
          }
        }
      }
    }
  })

  // route de modification du statut d'une réservation - route protégée
  app.put("/api/v1/bookings/accept-booking/:id", withAuth, async(req,res,next)=>{
    if (isNaN(req.params.id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      let booking = await bookingModel.getOneBooking(req.params.id)
      if (booking.code){
        res.json({status: 500, msg: "Erreur de récupération de la réservation", err: booking})
      } else {
        // cas : j'ai posté une annonce car j'avais besoin d'un coup de main pour du jardinage --> je ne suis pas fournisseur de l'activité --> qq'un a réservé l'activité càd a accepté de me donner un coup --> pour pouvoir accepter la réservation (est-ce que j'ai toujours besoin de ce coup de main ?), je dois avoir un solde suffisant

        // je récupère le compte du bénéficiaire
        let beneficiaryUser = await userModel.getOneUserById(booking[0].beneficiary_id)
        if (beneficiaryUser.code){
          res.json({status: 500, msg:"Erreur de récupération du compte de l'utilisateur bénéficiaire de la réservation.", err: beneficiaryUser})
        } else {
          if (beneficiaryUser.length === 0){
            res.json({status: 401, msg: "Il n'y a pas de compte utilisateur avec cet id."})
          } else {
            // je vérifie que le bénéficiaire a un solde suffisant pour accpter la réservation
            if (booking[0].points < beneficiaryUser[0].points ){
              // on transfère les points
              let changePoints = await userModel.decreasePoints(booking.points, beneficiary_id)
                if (changePoints.code){
                  res.json({status: 500, msg: "Erreur dans le trasnfert de points."})
                } else {
                  // le transfert de points s'ets bien déroulé, on peut valider la réservation
                  let bookingUpdated = await bookingModel.updateStatus(req, req.params.id)
                  if (bookingUpdated.code){
                    res.json({status: 500, msg: "Erreur de changement du statut de la réservation.", err: bookingUpdated})
                  } else {
                    res.json({status: 200, msg: `Le statut de la réservation a bien été modifié. Votre solde de points a été débité de ${booking.points}`, bookingUpdated: bookingUpdated})
                  }
                }
            } else {
              res.json({status: 401, msg:"Vous n'avez pas suffisamment de points pour accepter la réservation."})
            }
          }
        }
      }
    }
  })

  // route de validation de la réalisation de l'activité par le provider
  app.put("/api/v1/bookings/validate-achievement/provider/:id", withAuth, async(req,res,next)=>{
    if (isNaN(req.params.id)){
      res.json({status: 500, msg: "L'id renseigné n'est pa sun nombre."})
    } else {
      let bookingUpdated = await bookingModel.validateAchievementByProvider(req.params.id)
      if (bookingUpdated.code){
        res.json({status: 500, msg: "Erreur dans la validation de la réalisation de la réservation par le fournisseur.", err: bookingUpdated})
      } else {
        let booking = await bookingModel.getOneBooking(req.params.id)
        if (booking.code){
          res.json({status: 500, msg: "Erreur de récupération de la réservation.", err: booking})
        } else {
          if (booking.length === 0){
            res.json({status: 401, msg: "Aucune réservation ne correspond à cet id.", booking: booking})
          } else {
            // si les deux utilisateurs ont validé la réalisation, alors on peut créditer les points au fournisseur de l'activité
            if (booking[0].providerValidation && booking[0].beneficiaryValidation){
              let changePoints = userModel.increasePoints(booking[0].points, booking[0].provider_id)
              if (changePoints.code){
                res.json({status:500, msg:"L'erreur dans le versement des points.", err:changePoints})
              } else {
                res.json({status: 200, msg: "Les points ont bien été crédités au fournisseur.", result: changePoints})
              }
            }
          }
        }

      }
    }
  })

  // route de validation de la réalisation de l'activité par le bénéficiaire
  app.put("/api/v1/bookings/validate-achievement/beneficiary/:id", withAuth, async(req,res,next)=>{
    if (isNaN(req.params.id)){
      res.json({status: 500, msg: "L'id renseigné n'est pa sun nombre."})
    } else {
      let bookingUpdated = await bookingModel.validateAchievementByProvider(req.params.id)
      if (bookingUpdated.code){
        res.json({status: 500, msg: "Erreur dans la validation de la réalisation de la réservation par le bénéficiaire.", err: bookingUpdated})
      } else {
        let booking = await bookingModel.getOneBooking(req.params.id)
        if (booking.code){
          res.json({status: 500, msg: "Erreur de récupération de la réservation.", err: booking})
        } else {
          if (booking.length === 0){
            res.json({status: 401, msg: "Aucune réservation ne correspond à cet id.", booking: booking})
          } else {
            // si les deux utilisateurs ont validé la réalisation, alors on peut créditer les points au fournisseur de l'activité
            if (booking[0].providerValidation && booking[0].beneficiaryValidation){
              let changePoints = userModel.increasePoints(booking[0].points, booking[0].provider_id)
              if (changePoints.code){
                res.json({status:500, msg:"L'erreur dans le versement des points.", err:changePoints})
              } else {
                res.json({status: 200, msg: "Les points ont bien été crédités au fournisseur.", result: changePoints})
              }
            }
          }
        }

      }
    }
  })
}
