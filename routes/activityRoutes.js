//authentification simple
const withAuth = require("../withAuth")
// authentification admin
const adminAuth = require("../adminAuth")
const mail = require('../lib/mailing');

module.exports = (app, db) => {
  const activityModel = require("../models/ActivityModel")(db)
  const userModel = require ("../models/UserModel")(db)

  //route de récupération de toutes les activités
  app.get("/api/v1/activity/all", async(req,res,next)=>{
    // récupération de toutes les activités
    let activities = await activityModel.getAllActivities()
    if (activities.code){
      // erreur
      res.json({status: 500, msg: "Erreur de récupération de toutes les activités.", err: activities})
    } else {
      // aucune résultat trouvé --> code 204
      if (activities.length === 0){
        res.json({status: 204, msg: "Il n'existe pas encore d'activités.", activities: activities})
      } else {
        // retour avec les activités trouvées
        res.json({status: 200, msg: "Les activités ont bien été récupérées.", activities: activities})
      }
    }
  })

  //route pour récupérer toutes les activités "en ligne" - route non protégée
  app.get("/api/v1/activity/all/online", async(req, res, next)=>{
    // console.log("hello from /api/v1/activity/all/online route")
    // récupération de toutes les activités ayant un statut en ligne
    let activities = await activityModel.getAllOnlineActivities()
    if (activities.code){
      // erreur
      res.json({status: 500, msg: "Erreur de récupération des activités en ligne.", err: activities})
    } else {
      // aucune activité trouvée --> code 204
      if (activities.length === 0){
        res.json({status: 204, msg: "Il n'existe pas encore d'activité en ligne.", activities: activities})
      } else {
        // retour avec les activités trouvées
        res.json({status: 200, msg: "Les activités en ligne ont bien été récupérées.", activities: activities})
      }
    }
  })

  //route de récupération de toutes les activités en attente de valdiation - route admin
  app.get("/api/v1/activity/all/waiting", adminAuth, async(req, res, next)=>{
    let activities = await activityModel.getAllWaitingActivities()
    if (activities.code){
      res.json({status: 500, msg: "Erreur de récupération des activités en attente de validation.", err: activities})
    } else {
      // aucun résultat --> code 204
      if (activities.length === 0){
        res.json({status: 204, msg: "Il n'existe pas d'activité en attente de validation.", activities: activities})
      } else {
         // retour avec les activités trouvées
        res.json({status: 200, msg: "Les activités en attente de validation ont bien été récupérées.", activities: activities})
      }
    }
  })

  //route de récupération de toutes les activités créées par un même auteur - route protégée
  app.get("/api/v1/activity/all/author/:author_id", withAuth, async(req, res, next)=>{
      // vérification que l'id renseigné est bien un nombre
    if (isNaN(req.params.author_id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      // récupération de toutes les activités créées par un même auteur
      let activities = await activityModel.getAllActivitiesByAuthor(req.params.author_id)
      if (activities.code){
        // erreur
        res.json({status: 500, msg: "Erreur de récupération des activités de l'auteur.", err: activities})
      } else {
        // aucun résultat --> code 204
        if (activities.length === 0){
          res.json({status: 204, msg: "L'auteur n'a pas encore créé d'activité.", activities: activities})
        } else {
          res.json({status: 200, msg: "Les activités de l'auteur ont bien été récupérées.", activities: activities})
        }
      }
    }
  })

  // route de récupération des activités selon le critère "l'auteur est fournisseur ou non" - route non protégée car besoin pour la page d'accueil
  app.post("/api/v1/activity/all/author-is-provider", async(req, res, next)=>{
    // récupération des activités selon le critère author_is_provider (true/false)
    let activities = await activityModel.getAllActivitiesByAuthorIsProvider(req)
    if (activities.code){
      // erreur
      res.json({status: 500, msg: `Erreur de récupération des activités selon le critère author_is_provider: ${req.body.authorIsProvider}.`, err: activities})
    } else {
      // aucune activité trouvée --> code 204
      if (activities.length === 0){
        res.json({status: 204, msg: `Il n'y a pas d'activité correspond au critère author_is_provider: ${req.body.authorIsProvider}.`, activities: activities})
      } else {
        // retour avec les activités correspondant à la recherche
        res.json({status: 200, msg: "Les activités ont bien été récupérées.", activities: activities})
      }
    }
  })

  //route de récupération d'une activité - route protégée
  app.get("/api/v1/activity/:id", withAuth, async(req, res, next)=>{
    if (isNaN(req.params.id)){
      // vérification que l'id renseigné est bien un nombre
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      // récupération de l'activité par son ID
      let activity = await activityModel.getOneActivity(req.params.id)
      if (activity.code){
        // erreur
        res.json({status: 500, msg: "Erreur de récupération d'une activité.", err: activity})
      } else {
        // pas d'activité trouvée --> code 204
        if (activity.length === 0){
          res.json({status: 204, msg: "Aucune activité ne correspond à cet id.", activity: activity})
        } else {
          // retour avec l'activité trouvée
          res.json({status: 200, msg: "L'activité a bien été trouvée.", activity: activity[0]})
        }
      }
    }
  })

  //routes de création d'une activité - route protégée
  app.post("/api/v1/activity/save", withAuth, async(req, res, next)=>{
    // console.log("hello from in /api/v1/activity/save route")
    // enregistrement de la nouvelle activité
    let activity = await activityModel.saveOneActivity(req)
    if (activity.code){
      // erreur
      res.json({status: 500, msg: "Erreur de création d'une activité.", err: activity})
    } else {
      // succès: activité créée
      res.json({status: 200, msg: "L'activité a bien été créée.", activity: activity})
    }
  })

  // route de mise à jour d'une activité par l'auteur de l'activité - route protégée
  app.put("/api/v1/activity/update/:id", withAuth, async(req,res,next)=>{
    if (isNaN(req.params.id)){
      // vérification que l'id renseigné est bien un nombre
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      // mise à jour de l'activité
      let activity = await activityModel.updateOneActivity(req, req.params.id)
      if (activity.code){
        // erreur
        res.json({status: 500, msg: "Erreur de mise à jour de l'activité.", err: activity})
      } else {
        // succès : activité mise à jour
        res.json({status: 200, msg: "L'activité a bien été mise à jour. Son nouveua format doit être validé par l'administration.", activity: activity})
      }
    }
  })

  //route de mise à jour du statut d'une activité par l'author de l'activité - route protégée
  app.put("/api/v1/activity/update/status/:id", withAuth, async(req,res,next)=>{
    if (isNaN(req.params.id)){
      // vérification que l'id renseigné est bien un nombre
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      // mise à jour du statut de l'activité (enligne/hors ligne)
      let activity = await activityModel.updateOnlineOfflineStatus(req, req.params.id)
      if (activity.code){
        // erreur
        res.json({status: 500, msg: "Erreur de mise à jour du statut de l'activité.", err: activity})
      } else {
        // mise à jour validée
        res.json({status: 200, msg: "Le statut de l'activité a bien été mise à jour.", activity: activity})
      }
    }
  })

  //route de modération de l'activité par l'admin : mise à jour du statut (en attente de validation --> validé/en ligne) - route admin
  app.put("/api/v1/activity/moderate/:id", adminAuth, async(req, res, next)=>{
    if (isNaN(req.params.id)){
      // vérification que l'id renseigné est bien un nombre
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      // récupération de l'activité par son ID
      let activity = await activityModel.getOneActivity(req.params.id)
      if (activity.code){
        // erreur
        res.json({status: 500, msg:"Erreur de récupération de l'activité.", err: activity})
      } else {
        // aucun résultat trouvé --> code 204
        if (activity.length === 0){
          res.json({status: 204, msg: "Il n'existe pas d'activité correspond à l'id renseigné. Le processus de modération de l'activité n'a pas pu aboutir."})
        } else {
          // récupération de l'auteur de l'activité par son ID
          let user = await userModel.getOneUserById(activity[0].author_id)
          if (user.code){
            res.json({status: 500, msg: "Erreur de récupération de l'auteur du commentaire.Le processus de modération de l'activité n'a pas pu aboutir."})
          } else {
            // aucunr ésultat trouvé --> code 204
            if (user.length === 0){
              res.json({status: 204, msg: "L'utilisateur n'a pas été retrouvé. Le processus de modération de l'activité n'a pas pu aboutir."})
            } else {
              // mise à jour du statut de l'activité (invalidé/validé)
              let resultModeration = await activityModel.moderateOneActivity(req, req.params.id)
              if (resultModeration.code){
                // erreur
                res.json({status: 500, msg: "Erreur de mise à jour du statut de l'activité. Le processus de modération de l'activité n'a pas pu aboutir.", err: resultModeration})
              } else {
                if (req.body.status === "invalidated"){
                  // l'admin invalide l'activité, le créateur de l'activité est prévenu par mail
                  mail(
                    user[0].email,
                    `Invalidation de votre activité `,
                    `Invalidation de votre activité « ${activity[0].title} »`,
                    `L'activité que vous avez créée n'a pas été validée par l'administration pour le motif suivant: « ${req.body.explanation} ».\nVous pouvez modifier votre activité en prenant en compte cette remarque.\n Le service Harmony`
                  )
                  res.json({status: 200, msg: "L'activité n'a pas été validée.", result: resultModeration})
                } else {
                   // l'admin valide l'activité, le créateur de l'activité est prévenu par mail
                  mail(
                    user[0].email,
                    `Publication de votre activité `,
                    `Publication de votre activité « ${activity[0].title} »`,
                    `Bonne nouvelle ! L'activité que vous avez créée a été validée et est désormais en ligne.\n Le service Harmony`
                  )
                  res.json({status: 200, msg: "Le statut de l'activité a bien été mise à jour. L'activité est désormais en ligne.", resultModeration: resultModeration})
                }
              }
            }
          }
        }
      }
    }
  })

  // route de suppression d'une activité
  app.delete("/api/v1/activity/delete/:id", withAuth, async(req, res, next)=>{
    // vérification que l'id renseigné est bien un nombre
    if (isNaN(req.params.id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      // suppression de l'activité
      let activity = await activityModel.deleteOneActivity(req.params.id)
      if (activity.code){
        // erreur
        res.json({status: 500, msg: "Erreur de suppression de l'activité.", err: activity})
      } else {
        // succès
        res.json({status: 200, msg: "L'activité a bien été supprimée.", activity: activity})
      }
    }
  })

  //route de récupération des activités correspond aux filters appliqués par l'utilisateur
  app.post("/api/v1/activtity/all/filter", withAuth, async(req, res, next)=>{
    // récupération des activités selon les filtres demandés
    let activities = await activityModel.getActivitiesByFilter(req)
    if (activities.code){
      res.json({status: 500, msg: "Erreur de récupération des activités selon les filtres renseignés.", err: activities})
    } else {
      // pas de résultat --> code 204
      if (activities.length === 0){
        res.json({status: 204, msg: "Aucune activité ne correspond aux critères demandés."})
      } else {
        // succès: retour des résultats
        res.json({status: 200, activities: activities})
      }
    }
  })

  // route de modification de la photo de l'activité
  app.put("/api/v1/activity/update-picture/:id", withAuth, async(req,res,next)=>{
    // vérification que l'id renseigné est bien un nombre
    if (isNaN(req.params.id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      // changement de la photo de l'activité
      let updatingResult = await activityModel.updatePicture(req.body.urlPicture, req.params.id)
      if (updatingResult.code){
        // erreur
        res.json({status: 500, msg: "Erreur de modification de la photo.", err: updatingResult})
      } else {
        // succès
        res.json({status: 200, msg: "La photo a bien été modifiée. Votre activité est désormais en attente de validation par l'administration."})
      }
    }
  })
}
