const adminAuth = require("../adminAuth")
const withAuth = require("../withAuth")
const mail = require('../lib/mailing');

module.exports = (app, db)=>{
  const activityModel = require("../models/ActivityModel")(db)
  const bookingModel = require("../models/BookingModel")(db)
  const userModel = require("../models/UserModel")(db)

  // route de récupération de toutes les réservations - route admin
  app.get("/api/v1/booking/all", adminAuth, async(req, res, next)=>{
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
  app.get("/api/v1/booking/all/:booker_id", withAuth, async(req, res, next)=>{
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
  app.get("/api/v1/booking/all/activities/:author_id", withAuth, async(req,res,next)=>{
    let bookings = await bookingModel.getAllBookingsByAuthorId(req.params.author_id)
    if (bookings.code){
      res.json({status: 500, msg: "Erreur de récupération de toutes les réservations des activités de de l'utilisateur.", err: bookings})
    } else {
      if (bookings.length === 0){
        res.json({status: 401, msg: "Aucune réservation n'existe concernant les activités créées par cet utilisateur.", bookings: bookings})
      } else {
        res.json({status: 200, msg: "Les réservations concernant les activités de l'utilisateur ont bien été récupérées.", bookings: bookings})
      }
    }
  })

  // route de récupération d'une réservation par son id - route protégée
  app.get("/api/v1/booking/one/:id", withAuth, async(req, res, next)=>{
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
  app.post("/api/v1/booking/save", withAuth, async(req,res,next)=>{
    // l'utilisateur ne peut pas réserver sa propre activité
    if (req.body.provider_id === req.body.beneficiary_id){
      res.json({status: 401, msg:"Vous ne pouvez pas réserver votre propre activité."})
    } else {
      // si l'utilisateur qui réserve est aussi le bénéficiaire (booker = beneficiary) --> il doit payer pour réserver
      if (req.body.beneficiary_id === req.body.booker_id){
        let user = await userModel.getOneUserById(req.body.beneficiary_id)
        if (user.code){
          res.json({status: 500, msg: "Erreur de récupération de l'utilisateur bénéficiaire", err: user})
        } else {
          // le booker doit avoir assez de points pour réserver
          if (user[0].points >= req.body.points){
            res.json({status: 401, msg:"Vous n'avez pas assez de points pour procéder à la réservation."})
          } else {
            let changePoints = await userModel.decreasePoints(req.body.points, req.body.beneficiary_id)
              if (changePoints.code){
                res.json({status: 500, msg: "Erreur dans le trasnfert de points."})
              } else {
                // le transfert de points s'est bien déroulé, on peut faire la réservation
                let booking = await bookingModel.saveOneBooking(req)
                if (booking.code){
                  res.json({status: 500, msg: "Erreur de création de la réservation.", err: booking})
                } else {
                  res.json({status: 200, msg: `La réservation a bien été créée. Votre solde a été débité de ${req.body.points} points.`, booking: booking})
                }
              }
          }
        }
      } else { // booker = provider (donne un coup de main): on fait la réservation, on vérifiera si l'utilisateur/bénéficiaire de la réservation/activity a assez de points au moment où il acceptera la réservation
        let booking = await bookingModel.saveOneBooking(req)
        if (booking.code){
          res.json({status: 500, msg: "Erreur de création de la réservation.", err: booking})
        } else {
          res.json({status: 200, msg: "La réservation a bien été crée.", booking: booking})
        }

      }
    }
  })

  // route de modification du statut d'une réservation - route protégée
  app.put("/api/v1/booking/accept-booking/:id", withAuth, async(req,res,next)=>{
    if (isNaN(req.params.id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      let booking = await bookingModel.getOneBooking(req.params.id)
      if (booking.code){
        res.json({status: 500, msg: "Erreur de récupération de la réservation", err: booking})
      } else {
        console.log("le booking a été récupéré -->", booking[0])
        if (booking[0].booking_status === "en attente d'acceptation"){
          if (booking[0].booker_id === booking[0].provider_id){ //il n'y a pas eu de prépaiement --> cas : j'ai créé une activité "besoin d'un coup de main pour du jardinage" --> je ne suis pas fournisseur --> qq'un a réservé l'activité càd veut me donner un coup main --> pour pouvoir accepter la réservation, je dois avoir un solde suffisant
            console.log("il n'y pas eu de prépaiement --> il faut vérifier le solde")
            // récupération du compte du bénéficiaire
            let beneficiaryUser = await userModel.getOneUserById(booking[0].beneficiary_id)
            if (beneficiaryUser.code){
              res.json({status: 500, msg:"Erreur de récupération du compte de l'utilisateur bénéficiaire de la réservation. Le processus d'acceptation de la réservation n'a pas pu aboutir.", err: beneficiaryUser})
            } else {
              if (beneficiaryUser.length === 0){
                res.json({status: 401, msg: "Il n'y a pas de compte utilisateur avec cet id."})
              } else {
                // je vérifie que le bénéficiaire a un solde suffisant pour accepter la réservation
                if (beneficiaryUser[0].points >= booking[0].points ){
                  // on transfère les points
                  let changePoints = await userModel.decreasePoints(booking[0].points, booking[0].beneficiary_id)
                    if (changePoints.code){
                      res.json({status: 500, msg: "Erreur dans le transfert de points. Le processus d'acceptation de la réservation n'a pas pu aboutir.", err: changePoints})
                    } else {
                      // le transfert de points s'ets bien déroulé, on peut accepter la réservation
                      let bookingUpdated = await bookingModel.updateStatus(req, req.params.id)
                      if (bookingUpdated.code){
                        res.json({status: 500, msg: "Erreur de changement du statut de la réservation.", err: bookingUpdated})
                      } else {
                        res.json({status: 200, msg: `La réservation a bien été acceptée. Votre solde de points a été débité de ${booking[0].points} points.`, bookingUpdated: bookingUpdated})
                      }
                    }
                } else {
                  res.json({status: 401, msg:"Vous n'avez pas suffisamment de points pour accepter la réservation. Le processus d'acceptation de la réservation n'a pas pu aboutir."})
                }
              }
            }
          } else { // le bénéficiaire est booker donc il a déjà pré-payé la résa --> updateStatus
            let bookingUpdated = await bookingModel.updateStatus(req, req.params.id)
            if (bookingUpdated.code){
              res.json({status: 500, msg: "Erreur de changement du statut de la réservation.", err: bookingUpdated})
            } else {
              res.json({status: 200, msg: `La réservation a bien été acceptée.`, bookingUpdated: bookingUpdated})
            }
          }
        } else {
          res.json({status: 401, msg: "La réservation a déjà été acceptée."})
        }
      }
    }
  })

  app.delete("/api/v1/booking/delete/:id", withAuth, async(req,res,next)=>{
    let booking = await bookingModel.getOneBooking(req.params.id)
    if (booking.code){
      res.json({status: 500, msg: "Erreur de récupération de la réservation.", err: booking})
    } else {
      console.log("booking -->", booking[0])
      console.log("booking_status -->", booking[0].booking_status)
      if (booking[0].booking_status === "en attente d'acceptation"){
        // si le booker = beneficiaire, on doit rembourser ce qui a été pré-payé
        if (booking[0].booker_id === booking[0].beneficiary_id){
          //on récupère le bénéficiaire
          let beneficiary = await userModel.getOneUserById(booking[0].beneficiary_id)
          if (beneficiary.code){
            res.json({status: 500, msg: "Erreur de récupération du bénéficiaire. Le processus d'annulation de la réservation n'a pas pu aboutir.", err: beneficiary})
          } else {
            //on recrédite son compte des points prépayés
            let changePoints = await userModel.increasePoints(booking[0].points, beneficiary[0].id)
            if (changePoints.code){  // si échec --> res code erreur 500
              res.json({status: 500, msg:"Erreur dans la recréditation des points. Le processus d'annulation de la réservation n'a pas pu aboutir.", err: changePoints })
            } else { //les points ont été recrédités, on peut supprimer la résa
              let bookingCancellation = await bookingModel.deleteOneBooking(req.params.id)
              if (bookingCancellation.code){
                res.json({status: 500, msg: "Une erreur est survenue lors de l'annulation de la réservation.", err: bookingCancellation})
              } else {
                // on envoie un mail pour prévenir le bénéficiaire
                mail(
                  beneficiary[0].email,
                  `Annulation de la demande de réservation ${booking[0].booking_id}`,
                  `Annulation de la demande de réservation ${booking[0].booking_id}`,
                  `La demande de réservation pour l'activité ${booking[0].activity_title} a été annulée.`
                )
                res.json({status: 200, msg: "La réservation a bien été annulée. Les points ont été recrédités.", err: bookingCancellation})
              }
            }
          }
        } else { // on peut supprimer la résa et envoyer le mail pour prévenir le provider
          let provider = await userModel.getOneUserById(booking[0].provider_id)
          if (provider.code){
            res.json({status: 500, msg: "Erreur de récupération du fournisseur de l'activité. Le processus d'annulation de la réservation n'a pas pu aboutir."})
          } else {
            let bookingCancellation = await bookingModel.deleteOneBooking(req.params.id)
            if (bookingCancellation.code){
              res.json({status: 500, msg: "Erreur de suppresion de la réservation.", err: bookingCancellation})
            } else {
              // on envoie un mail pour prévenir le fournisseur
              mail(
                beneficiary[0].email,
                `Annulation de la demande de réservation ${booking[0].id}`,
                `Annulation de la demande de réservation ${booking[0].id}`,
                `La demande de réservation pour l'activité ${booking[0].activity_title} a été annulée.`
              )
              res.json({status: 200, msg: "La réservation a bien été annulée.", err: bookingCancellation})
            }
          }
        }
      } else {
        res.json({status: 401, msg: "Vous ne pouvez pas annuler une réservation qui a déjà été acceptée."})
      }
    }
  })

  // route de validation de la réalisation de l'activité par le provider
  app.put("/api/v1/bookings/validate-achievement/provider/:id", withAuth, async(req,res,next)=>{
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
          if (booking[0].booking_status === "en attente d'acceptation"){
            res.json({status: 401, msg: "Cette action ne peut pas être réalisée: la réservation est toujours en attente d'acceptation"})
          } else {
            let provider = await userModel.getOneUserById(booking[0].provider_id)
            if (provider.code){
              res.json({status: 500, msg: "Erreur de récupération des informations du fournisseur. La validation de la réalisation de la réservation par le bénéficiaire n'a pas pu aboutir.", err: provider})
            } else {
              if (provider.length === 0) {
                res.json({status: 401, msg: "Il n'existe pas d'utilisateur correspond à l'id renseigné.", err: provider})
              } else {
                // je procède à la mise à jour
                let resultUpdating = await bookingModel.validateAchievementByProvider(req.params.id)
                if (resultUpdating.code){
                  res.json({status: 500, msg: "Erreur dans la validation de la réalisation de la réservation par le fournisseur.", err: resultUpdating})
                } else {
                  let bookingAfterValidation = await bookingModel.getOneBooking(req.params.id)
                  if (bookingAfterValidation.code){
                    res.json({status: 500, msg: "Erreur de récupération de la réservation après la validation.", err: bookingAfterValidation})
                  } else {
                    if (bookingAfterValidation.length === 0) {
                      res.json({status: 401, msg: "Aucune réservation ne correspond à cet id.", booking: bookingAfterValidation})
                    } else {
                      // si les deux utilisateurs ont validé la réalisation, alors on peut créditer les points au fournisseur de l'activité
                      if (bookingAfterValidation[0].providerValidation && bookingAfterValidation[0].beneficiaryValidation){
                        let changePoints = userModel.increasePoints(bookingAfterValidation[0].points, bookingAfterValidation[0].provider_id)
                        if (changePoints.code){
                          mail(
                            provider[0].email,
                            `Erreur : votre compte n'a pas pu être crédit.`,
                            `Erreur : votre compte n'a pas pu être crédit.`,
                            `La réservation n°${bookingAfterValidation[0].booker_id} a bien été réalisée mais votre compte n'a pas pu être crédité de ${bookingAfterValidation[0].points} points. Veuillez contacter l'administration.`
                          )
                          res.json({status:500, msg:"Une erreur est survenue dans le versement des points mais la validation de la réalisation de la réservation a bien eu lieu.", err:changePoints})
                        } else {
                          let resultUpdating = await bookingModel.updateStatus(req, req.params.id)
                          if (resultUpdating.code){
                            res.json({status: 500, msg: "Erreur de changement du statut de la réservation.", err: resultUpdating})
                          } else {
                            res.json({status: 200, msg: "Les points ont bien été crédités au fournisseur. Le statut de la réservation a bien été mis à jour.", result: resultUpdating})
                          }
                        }
                      } else {
                        res.json({status: 200, msg:"La réalisation de la réservation par le bénéficiaire a bien été enregistrée.", result: resultUpdating})
                      }
                    }
                  }
                }
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
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      let booking = await bookingModel.getOneBooking(req.params.id)
      if (booking.code){
        res.json({status: 500, msg: "Erreur de récupération de la réservation.", err: booking})
      } else {
        if (booking.length === 0){
          res.json({status: 401, msg: "Aucune réservation ne correspond à cet id.", booking: booking})
        } else {
          if (booking[0].booking_status === "en attente d'acceptation"){
            res.json({status: 401, msg: "Cette action ne peut pas être réalisée: la réservation est toujours en attente d'acceptation"})
          } else {
            let provider = await userModel.getOneUserById(booking[0].provider_id)
            if (provider.code){
              res.json({status: 500, msg: "Erreur de récupération des informations du fournisseur. La validation de la réalisation de la réservation par le bénéficiaire n'a pas pu aboutir.", err: provider})
            } else {
              if (provider.length === 0) {
                res.json({status: 401, msg: "Il n'existe pas d'utilisateur correspond à l'id renseigné.", err: provider})
              } else {
                let resultUpdating = await bookingModel.validateAchievementByBeneficiary(req.params.id)
                if (resultUpdating.code){
                  res.json({status: 500, msg: "Erreur dans la validation de la réalisation de la réservation par le bénéficiaire.", err: resultUpdating})
                } else {
                  let bookingAfterValidation = await bookingModel.getOneBooking(req.params.id)
                  if (bookingAfterValidation.code){
                    res.json({status: 500, msg: "Erreur de récupération de la réservation après la validation.", err: bookingAfterValidation})
                  } else {
                    if (bookingAfterValidation.length === 0) {
                      res.json({status: 401, msg: "Aucune réservation ne correspond à cet id.", booking: bookingAfterValidation})
                    } else {
                      // si les deux utilisateurs ont validé la réalisation, alors on peut créditer les points au fournisseur de l'activité
                      if (bookingAfterValidation[0].providerValidation && bookingAfterValidation[0].beneficiaryValidation){
                        let changePoints = userModel.increasePoints(bookingAfterValidation[0].points, bookingAfterValidation[0].provider_id)
                        if (changePoints.code){
                          mail(
                            provider[0].email,
                            `Erreur : votre compte n'a pas pu être crédit.`,
                            `Erreur : votre compte n'a pas pu être crédit.`,
                            `La réservation n°${bookingAfterValidation[0].booker_id} a bien été réalisée mais votre compte n'a pas pu être crédité de ${bookingAfterValidation[0].points} points. Veuillez contacter l'administration.`
                          )
                          res.json({status:500, msg:"Une erreur est survenue dans le versement des points mais la validation de la réalisation de la réservation a bien eu lieu.", err:changePoints})
                        } else {
                          let resultUpdating = await bookingModel.updateStatus(req, req.params.id)
                          if (resultUpdating.code){
                            res.json({status: 500, msg: "Erreur de changement du statut de la réservation.", err: resultUpdating})
                          } else {
                            res.json({status: 200, msg: "Les points ont bien été crédités au fournisseur. Le statut de la réservation a bien été mis à jour.", result: resultUpdating})
                          }
                        }
                      } else {
                        res.json({status: 200, msg:"La réalisation de la réservation par le bénéficiaire a bien été enregistrée.", result: resultUpdating})
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
}
