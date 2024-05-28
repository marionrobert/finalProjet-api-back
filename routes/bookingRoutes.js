// authentification administrateur
const adminAuth = require("../adminAuth")
// authentification simple
const withAuth = require("../withAuth")
// import du fichier permettant l'envoi de mails
const mail = require('../lib/mailing');

module.exports = (app, db)=>{
  const activityModel = require("../models/ActivityModel")(db)
  const bookingModel = require("../models/BookingModel")(db)
  const userModel = require("../models/UserModel")(db)

  // Middleware to validate ID
  function isValidId(req, res, next) {
    const id = req.params.id || req.params.author_id || req.params.booker_id;
    if (isNaN(id)) {
        return res.status(400).json({ status: 400, msg: "L'id renseigné n'est pas valide." });
    }
    next();
  }

  // Middleware to check if booking exists
  async function bookingExists(req, res, next) {
    const bookingId = req.params.id;
    try {
        const booking = await bookingModel.getOneBooking(bookingId);
        if (booking.code) {
          res.json({status: 500, msg: "Erreur de récupération de la réservation.", err: booking});
        } else if (booking.length === 0){
          return res.status(404).json({ status: 404, msg: "Aucune réservation ne correspond à l'id renseigné." });
        }
        req.booking = booking; // Pass the booking to the next middleware
        next();
    } catch (error) {
        console.error("Erreur lors de la vérification de l'existence de la réservation :", error);
        return res.status(500).json({ status: 500, msg: "Erreur lors de la vérification de l'existence de la réservation.", err: error.message });
    }
  }

  // Fonction générique pour valider la réalisation de l'activité
  async function validateAchievement(req, res, next, userType) {
    const booking = req.booking;

    // Vérifier si la réservation est en attente de réalisation
    if (booking[0].booking_status !== "waiting_for_completion") {
        return res.json({ status: 401, msg: "Cette action ne peut pas être réalisée: la réservation est toujours en attente d'acceptation ou est terminée." });
    }

    try {
        // Récupération du fournisseur de l'activité
        const provider = await userModel.getOneUserById(booking[0].provider_id);
        if (provider.code) {
            return res.json({ status: 500, msg: `Erreur de récupération des informations du ${userType}. La validation de la réalisation de la réservation par le ${userType} n'a pas pu aboutir.`, err: provider });
        }

        // Vérifier si le fournisseur existe
        if (provider.length === 0) {
            return res.json({ status: 404, msg: `Il n'existe pas d'utilisateur correspond à l'id renseigné. La validation de la réalisation de la réservation par le ${userType} n'a pas pu aboutir.`, err: provider });
        }

        // Validation de la réalisation par le fournisseur ou le bénéficiaire
        let resultUpdating;
        if (userType === "provider") {
            resultUpdating = await bookingModel.validateAchievementByProvider(req.params.id);
        } else if (userType === "beneficiary") {
            resultUpdating = await bookingModel.validateAchievementByBeneficiary(req.params.id);
        }

        if (resultUpdating.code) {
            return res.json({ status: 500, msg: `Erreur dans la validation de la réalisation de la réservation par le ${userType}.`, err: resultUpdating });
        }

        // Récupération de la réservation après validation
        const bookingAfterValidation = await bookingModel.getOneBooking(req.params.id);
        if (bookingAfterValidation.code) {
            return res.json({ status: 500, msg: "Erreur de récupération de la réservation après la validation.", err: bookingAfterValidation });
        }

        // Vérifier si la réservation a été trouvée
        if (bookingAfterValidation.length === 0) {
            return res.json({ status: 404, msg: "Aucune réservation ne correspond à cet id." });
        }

        // Vérifier si les deux utilisateurs ont validé la réalisation
        if (bookingAfterValidation[0].providerValidation && bookingAfterValidation[0].beneficiaryValidation) {
            // Créditer les points au fournisseur de l'activité
            const changePoints = userModel.increasePoints(bookingAfterValidation[0].points, bookingAfterValidation[0].provider_id);
            if (changePoints.code) {
                // Gérer l'erreur de crédit des points
                mail(
                    provider[0].email,
                    `Erreur : votre compte n'a pas pu être crédité.`,
                    `Erreur : votre compte n'a pas pu être crédité après la réalisation de l'activité.`,
                    `L'activité « ${bookingAfterValidation[0].activity_title} » a bien été réalisée (réservation n°${bookingAfterValidation[0].booking_id}) mais votre compte n'a pas pu être crédité de ${bookingAfterValidation[0].points} points. Veuillez contacter l'administration.\n Le service Harmony`
                );
                return res.json({ status: 500, msg: "Une erreur est survenue dans le versement des points mais la validation de la réalisation de la réservation a bien eu lieu.", err: changePoints });
            } else {
                // Envoyer un e-mail au fournisseur
                mail(
                    provider[0].email,
                    `Activité réalisée : réception des points.`,
                    `Activité réalisée : réception des points.`,
                    `L'activité « ${bookingAfterValidation[0].activity_title} » a bien été réalisée (réservation n°${bookingAfterValidation[0].booking_id}) : votre compte a été crédité de ${bookingAfterValidation[0].points} points.\n Le service Harmony`
                );
                // Mettre à jour le statut de la réservation
                const updatedStatus = await bookingModel.updateStatus(req, req.params.id);
                if (updatedStatus.code) {
                    // Gérer l'erreur de mise à jour du statut
                    return res.json({ status: 500, msg: "Erreur de changement du statut de la réservation.", err: updatedStatus, booking: bookingAfterValidation[0] });
                } else {
                    // Renvoyer la réponse appropriée
                    return res.json({ status: 200, msg: "Les points ont bien été crédités au fournisseur. Le statut de la réservation est 'terminée'.", bookingStatus: req.body.status });
                }
            }
        } else {
            // Renvoyer la réponse appropriée si la réalisation n'est pas confirmée par les deux utilisateurs
            return res.json({ status: 200, msg: `La réalisation de la réservation par le ${userType === "beneficiary" ? "bénéficiaire" : "fournisseur"} a bien été enregistrée.` });
        }
    } catch (error) {
        // Gérer les erreurs inattendues
        console.error(`Erreur lors de la validation de la réalisation de la réservation par le ${userType}:`, error);
        return res.json({ status: 500, msg: `Erreur lors de la validation de la réalisation de la réservation par le ${userType}.`, err: error.message });
    }
  }

  // route de récupération de toutes les réservations - route admin
  app.get("/api/v1/booking/all", adminAuth, async(req, res, next)=>{
    // réupération des bookings
    let bookings = await bookingModel.getAllBookings()
    if (bookings.code){
      // erreur
      res.json({status: 500, msg: "Erreur de récupération de toutes les réservations", err: bookings})
    } else {
      // aucun résultat trouvé
      if (bookings.length === 0){
        res.json({status: 404, msg: "Il n'existe pas encore de réservations.", bookings: bookings})
      } else {
        // succès: renvoi des résultats
        res.json({status: 200, msg: "Les réservations ont bien été récupérées.", bookings: bookings})
      }
    }
  })

  // route de récupération de toutes les réservations effectuées par un utilisateur (booker_id) - route protégée
  app.get("/api/v1/booking/all/:booker_id", withAuth, isValidId, async(req, res, next)=>{
    try {
      // récupération des réservations correspondant à l'auteur (id de l'auteur)
      let bookings = await bookingModel.getAllBookingsByBookerId(req.params.booker_id)
      if (bookings.code){
        // erreur
        res.json({status: 500, msg: "Erreur de récupération de toutes les réservations pour cet utilisateur.", err: bookings})
      } else {
        // aucun résultat trouvé
        if (bookings.length === 0){
          res.json({status: 404, msg: "Cet utilisateur n'a pas encore fait de réservations."})
        } else {
          res.json({status: 200, msg: "Les réservations de l'utilisateur ont bien été récupérées.", bookings: bookings})
        }
      }
    } catch (error){
      console.error("Erreur de récupération de toutes les réservations pour cet utilisateur.", error);
      return res.json({ status: 500, msg: "Erreur de récupération de toutes les réservations pour cet utilisateur.", err: error.message });
    }
  })

  // route de récupération de toutes les réservations concernant les annonces d'un utilisateur - route protégée
  app.get("/api/v1/booking/all/activities/:author_id", withAuth, isValidId, async(req,res,next)=>{
    try {
      // récupération des réservations effectuées par un seul utilisateur
      let bookings = await bookingModel.getAllBookingsByAuthorId(req.params.author_id)
      if (bookings.code){
        // erreur
        res.json({status: 500, msg: "Erreur de récupération de toutes les réservations des activités de l'utilisateur.", err: bookings})
      } else {
        if (bookings.length === 0){
          // aucun résultat trouvé
          res.json({status: 404, msg: "Aucune réservation n'existe concernant les activités créées par cet utilisateur."})
        } else {
          // succès
          res.json({status: 200, msg: "Les réservations concernant les activités de l'utilisateur ont bien été récupérées.", bookings: bookings})
        }
      }
    } catch(error){
      console.error("Erreur de récupération de toutes les réservations des activités de l'utilisateur.", error);
      return res.json({ status: 500, msg: "Erreur de récupération de toutes les réservations des activités de de l'utilisateur.", err: error.message });
    }
  })

  // route de récupération d'une réservation par son id - route protégée
  app.get("/api/v1/booking/one/:id", withAuth, isValidId, bookingExists, async(req, res, next)=>{
    return res.status(200).json({ status: 200, msg: "La réservation a bien été trouvée.", booking: req.booking[0] });
  });

  // route de création d'une réservation - route protégée
  app.post("/api/v1/booking/save", withAuth, async(req,res,next)=>{
    // l'utilisateur ne peut pas réserver sa propre activité
    if (req.body.provider_id === req.body.beneficiary_id){
      res.json({status: 401, msg:"Vous ne pouvez pas réserver votre propre activité."})
    } else {
      // si l'utilisateur qui réserve est aussi le bénéficiaire (booker = beneficiary) --> il doit payer pour réserver
      if (req.body.beneficiary_id === req.body.booker_id){
        // récupération de l'utilisateur qui réserve
        let user = await userModel.getOneUserById(req.body.beneficiary_id)
        if (user.code){
          // erreur
          res.json({status: 500, msg: "Erreur de récupération de l'utilisateur.", err: user})
        } else {
          // console.log("user[0].points", user[0].points)
          // console.log("req.body.points", req.body.points)
          // le booker doit avoir assez de points pour réserver
          if (user[0].points < req.body.points){
            // le réservant n'a pas assez de points pour réserver
            res.json({status: 401, msg:"Vous n'avez pas assez de points pour réserver."})
          } else {
            // le réservant a assez de points pour réserver, les points nécessaires à la réservation sont enlevés de son solde de points
            let changePoints = await userModel.decreasePoints(req.body.points, req.body.beneficiary_id)
              if (changePoints.code){
                // erreur
                res.json({status: 500, msg: "Erreur dans le transfert de points. La réservation n'a pas pu être finalisée."})
              } else {
                // le transfert de points s'est bien déroulé, la réservation peut avoir lieu
                let booking = await bookingModel.saveOneBooking(req)
                if (booking.code){
                  // erreur
                  res.json({status: 500, msg: "Erreur de création de la réservation.", err: booking})
                } else {
                  // succès : la réservation a eu lieu
                  res.json({status: 200, msg: `La réservation a bien été créée. Votre solde a été débité de ${req.body.points} points.`})
                }
              }
          }
        }
      } else {
        // le réservant est fournisseur de l'activité (donne un coup de main): laréservation est effectuée, on vérifiera si l'utilisateur/bénéficiaire de l'activité a assez de points au moment où il acceptera la réservation
        let booking = await bookingModel.saveOneBooking(req)
        if (booking.code){
          // erreur
          res.json({status: 500, msg: "Erreur de création de la réservation.", err: booking})
        } else {
          // succès
          res.json({status: 200, msg: "La réservation a bien été crée.", booking: booking})
        }

      }
    }
  })

  // route d'acceptation d'une réservation - route protégée
  app.put("/api/v1/booking/accept-booking/:id", withAuth, isValidId, bookingExists, async(req,res,next)=>{
    const booking = req.booking;

    // si la réservation est en attente d'acceptation
    if (booking[0].booking_status === "waiting_for_acceptance"){
      // cas où l'utilisateur qui a réservé l'activité est aussi le fournisseur : il donne un coup de main
      // il n'y a pas eu de paiement lors de la réservation --> pour pouvoir accepter la réservation, le bénéficiaire de l'activité doit avoir un solde de points suffisant
      if (booking[0].booker_id === booking[0].provider_id){
        // console.log("il n'y pas eu de prépaiement --> il faut vérifier le solde")
        // récupération du compte du bénéficiaire
        let beneficiaryUser = await userModel.getOneUserById(booking[0].beneficiary_id)
        if (beneficiaryUser.code){
          // erreur --> l'opération est annulée
          res.json({status: 500, msg:"Erreur de récupération du compte de l'utilisateur bénéficiaire de la réservation. Le processus d'acceptation de la réservation ne peut pas aboutir.", err: beneficiaryUser})
        } else {
          // aucun résultat trouvé
          if (beneficiaryUser.length === 0){
            res.json({status: 404, msg: "Il n'y a pas de compte utilisateur avec cet id. Le processus d'acceptation de la réservation ne peut pas aboutir."})
          } else {
            // le bnééficiare doit avoir un solde suffisant pour accepter la réservation
            if (beneficiaryUser[0].points >= booking[0].points ){
              // on transfère les points
              let changePoints = await userModel.decreasePoints(booking[0].points, booking[0].beneficiary_id)
                if (changePoints.code){
                  // erreur
                  res.json({status: 500, msg: "Erreur dans le transfert de points. Le processus d'acceptation de la réservation n'a pas pu aboutir.", err: changePoints})
                } else {
                  // le transfert de points s'est bien déroulé, on peut modifier le statut de la réservation
                  let bookingUpdated = await bookingModel.updateStatus(req, req.params.id)
                  if (bookingUpdated.code){
                    // erreur
                    res.json({status: 500, msg: "Erreur de changement du statut de la réservation.", err: bookingUpdated})
                  } else {
                    // succès
                    res.json({status: 200, msg: `La réservation a bien été acceptée. Le solde de points a été débité de ${booking[0].points} points.`})
                  }
                }
            } else {
              // le bénéficiaire de l'activité' n'a pas assez de points pour accepter la réservation
              res.json({status: 401, msg:"Vous n'avez pas assez de points pour accepter la réservation."})
            }
          }
        }
      } else {
        // le bénéficiaire de l'activité et celui qui a effectué la réservaiton : il a déjà "payé" l'activité, le chnagement de statut de la réservation peut être effectué
        let bookingUpdated = await bookingModel.updateStatus(req, req.params.id)
        if (bookingUpdated.code){
          // erreur
          res.json({status: 500, msg: "Erreur de changement du statut de la réservation.", err: bookingUpdated})
        } else {
          // succès
          res.json({status: 200, msg: `La réservation a bien été acceptée.`})
        }
      }
    } else {
      // la réservation a déjà été acceptée
      res.json({status: 401, msg: "La réservation a déjà été acceptée."})
    }
  })

  // route d'annulation/refus d'une réservation - route protégée
  app.delete("/api/v1/booking/delete/:id", withAuth, isValidId, bookingExists, async(req,res,next)=>{
    const booking = req.booking;

    if (booking[0].booking_status === "waiting_for_acceptance"){
      // récupération du réservant par son id
      let booker = await userModel.getOneUserById(booking[0].booker_id)
      if (booker.code){
        // erreur
        res.json({status: 500, msg: "Erreur de récupération des données du réservant. Le processus d'annulation n'a pas abouti.", err: booker})
      } else {
        // cas où le réservant est bénéficiaire de l'activité réservée
        if (booking[0].booker_id === booking[0].beneficiary_id){
          // le réservant est bénéficiaire --> son solde de points doit être recrédité des points dépensés lors de la réservation
          let changePoints = await userModel.increasePoints(booking[0].points, booker[0].id)
          if (changePoints.code){
            // erreur
            res.json({status: 500, msg:"Erreur dans la recréditation des points. Le processus d'annulation n'a pas abouti.", err: changePoints })
          } else {
            // es points ont été recrédités, la réservation peut être supprimée
            let bookingCancellation = await bookingModel.deleteOneBooking(req.params.id)
            if (bookingCancellation.code){
              // erreur
              res.json({status: 500, msg: "Une erreur est survenue lors de l'annulation de la réservation.", err: bookingCancellation})
            } else {
              // la résa est supprimée --> on envoie un mail pour prévenir le bénéficiaire de la réservation
              mail(
                booker[0].email,
                `Annulation d'une demande de réservation`,
                `Annulation d'une demande de réservation`,
                `La demande de réservation pour l'activité « ${booking[0].activity_title} » a été annulée. Vous avez été recrédité de ${booking[0].points} points.\n Le service Harmony`
              )
              res.json({status: 200, msg: "La réservation a bien été annulée. Les points ont été recrédités."})
            }
          }
        } else {
          // le réservant est fournisseur de l'activité, il n'y a pas eu de points dépensés lors de la réservatoin --> la réservation peut être supprimée + envoi d'un mail pour prévenir le réservant
          // récupération du fournisseur
          let provider = await userModel.getOneUserById(booking[0].provider_id)
          if (provider.code){
            // erreur
            res.json({status: 500, msg: "Erreur de récupération du fournisseur de l'activité. Le processus d'annulation de la réservation n'a pas pu aboutir."})
          } else {
            // suppression de la réservation
            let bookingCancellation = await bookingModel.deleteOneBooking(req.params.id)
            if (bookingCancellation.code){
              // erreur
              res.json({status: 500, msg: "Erreur de suppresion de la réservation.", err: bookingCancellation})
            } else {
              // on envoie un mail pour prévenir le fournisseur
              mail(
                provider[0].email,
                `Annulation d'une demande de réservation`,
                `Annulation d'une demande de réservation`,
                `La demande de réservation pour l'activité « ${booking[0].activity_title} » a été annulée.\n Le service Harmony`
              )
              // succès
              res.json({status: 200, msg: "La réservation a bien été annulée.", err: bookingCancellation})
            }
          }
        }
      }
    } else {
    // la réservation a déjà été acceptée, ce n'est pas possible de l'annuler
      res.json({status: 401, msg: "Vous ne pouvez pas annuler une réservation qui a déjà été acceptée."})
    }
  })

  // route de validation de la réalisation de l'activité par le fournisseur
  app.put("/api/v1/booking/validate-achievement/provider/:id", withAuth, isValidId, bookingExists, async (req, res, next) => {
    await validateAchievement(req, res, next, "provider");
  });

  // route de validation de la réalisation de l'activité par le bénéficiaire
  app.put("/api/v1/booking/validate-achievement/beneficiary/:id", withAuth, isValidId, bookingExists, async (req, res, next) => {
    await validateAchievement(req, res, next, "beneficiary");
  });
}
