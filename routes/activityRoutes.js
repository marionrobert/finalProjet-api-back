const fs = require("fs") // pour supprimer les images en local
const withAuth = require("../withAuth")
const adminAuth = require("../adminAuth")
const { admin } = require("googleapis/build/src/apis/admin")

module.exports = (app, db) => {
  const activityModel = require("../models/ActivityModel")(db)

  //route de récupération de toutes les activités
  app.get("/api/v1/activity/all", async(req,res,next)=>{
    let activities = await activityModel.getAllActivities()
    if (activities.code){
      res.json({status: 500, msg: "Erreur de récupération de toutes les activités.", err: activities})
    } else {
      if (activities.length === 0){
        res.json({status: 401, msg: "Il n'existe pas encore d'activités.", activities: activities})
      } else {
        res.json({status: 200, msg: "Les activités ont bien été récupérées.", activities: activities})
      }
    }
  })

  //route pour récupérer toutes les activités "en ligne" (route non protégée --> accueil)
  app.get("/api/v1/activity/all/online", async(req, res, next)=>{
    let activities = await activityModel.getAllOnlineActivities()
    if (activities.code){
      res.json({status: 500, msg: "Erreur de récupération des activités en ligne.", err: activities})
    } else {
      if (activities.length === 0){
        res.json({status: 401, msg: "Il n'existe pas encore d'activité en ligne.", activities: activities})
      } else {
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
      if (activities.length === 0){
        res.json({status: 401, msg: "Il n'existe pas d'activité en attente de validation.", activities: activities})
      } else {
        res.json({status: 200, msg: "Les activités en attente de validation ont bien été récupérées.", activities: activities})
      }
    }
  })

  //route de récupération de toutes les activités créées par un même auteur - route protégée
  app.get("/api/v1/activity/all/author/:author_id", withAuth, async(req, res, next)=>{
    if (isNaN(req.params.author_id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      let activities = await activityModel.getAllActivitiesByAuthor(req.params.author_id)
      if (activities.code){
        res.json({status: 500, msg: "Erreur de récupération des activités de l'auteur.", err: activities})
      } else {
        if (activities.length === 0){
          res.json({status: 401, msg: "L'auteur n'a pas encore créé d'activité.", activities: activities})
        } else {
          res.json({status: 200, msg: "Les activités de l'auteuront bien été récupérées.", activities: activities})
        }
      }
    }
  })

  //route de récupération d'une activité - route protégée
  app.get("/api/v1/activity/:id", withAuth, async(req, res, next)=>{
    if (isNaN(req.params.id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      let activity = await activityModel.getOneActivity(req.params.id)
      if (activity.code){
        res.json({status: 500, msg: "Erreur de récupération d'une activité.", err: activity})
      } else {
        if (activity.length === 0){
          res.json({status: 401, msg: "Aucune activité ne correspond à cet id.", activity: activity})
        } else {
          res.json({status: 200, msg: "L'activité a bien été trouvée.", activity: activity})
        }
      }
    }
  })

  //routes de création d'une activité - route protégée
  app.post("/api/v1/activity/save", withAuth, async(req, res, next)=>{
    let activity = await activityModel.saveOneActivity(req.body)
    if (activity.code){
      res.json({status: 500, msg: "Erreur de création d'une activité.", err: activity})
    } else {
      res.json({status: 200, msg: "L'activité a bien été créée.", activity: activity})
    }
  })

  // route de mise à jour d'une activité par l'auteur de l'activité - route protégée
  app.put("/api/v1/activity/update/:id", withAuth, async(req,res,next)=>{
    if (isNaN(req.params.id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      let activity = await activityModel.updateOneActivity(req.body, req.params.id)
      if (activity.code){
        res.json({status: 500, msg: "Erreur de mise à jour de l'activité.", err: activity})
      } else {
        res.json({status: 200, msg: "L'activité a bien été mise à jour.", activity: activity})
      }
    }
  })

  //route de mise à jour du statut d'une activité par l'author de l'activité - route protégée
  app.put("/api/v1/activity/update/status/:id", withAuth, async(req,res,next)=>{
    if (isNaN(req.params.id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      let activity = await activityModel.updateOnlineOfflineStatus(req.body, req.params.id)
      if (activity.code){
        res.json({status: 500, msg: "Erreur de mise à jour du statut de l'activité.", err: activity})
      } else {
        res.json({status: 200, msg: "Le statut de l'activité a bien été mise à jour.", activity: activity})
      }
    }
  })

  //route de mise à jour du statut de l'activité par l'admin (en attente de validation --> validé/en ligne) - route admin
  app.put("/api/v1/activity/admin-validation/:id", adminAuth, async(req, res, next)=>{
    if (isNaN(req.params.id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      let activity = await activityModel.validatePublicationForOneActivity(req.params.id)
      if (activity.code){
        res.json({status: 500, msg: "Erreur de mise à jour du statut de l'activité.", err: activity})
      } else {
        res.json({status: 200, msg: "Le statut de l'activité a bien été mise à jour.", activity: activity})
      }
    }
  })

  // route de suppression d'une activité
  app.delete("/api/v1/activity/delete/:id", withAuth, async(req, res, next)=>{
    if (isNaN(req.params.id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      let activity = await activityModel.deleteOneActivity(req.params.id)
      if (activity.code){
        res.json({status: 500, msg: "Erreur de suppression de l'activité.", err: activity})
      } else {
        res.json({status: 200, msg: "L'activité a bien été supprimée.", activity: activity})
      }
    }
  })

  //route de récupération des activités correspond aux filters appliqués par l'utilisateur
  app.get("/api/v1/activtity/all/filter", async(req, res, next)=>{
    let activities = await activityModel.getActivitiesByFilter(req.body)
    if (activities.code){
      res.json({status: 500, msg: "Erreyr de récupération des activités selon les filtres renseignés.", err: activities})
    } else {
      if (activities.length === 0){
        res.json({status: 401, msg: "Aucune activité ne correspond aux critères demandés."})
      } else {
        res.json({status: 200, activities: activities})
      }
    }
  })
}
