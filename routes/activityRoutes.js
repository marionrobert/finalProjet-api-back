//authentification simple
const withAuth = require("../withAuth")
// authentification admin
const adminAuth = require("../adminAuth")
const mail = require('../lib/mailing');

module.exports = (app, db) => {
  const activityModel = require("../models/ActivityModel")(db)
  const userModel = require ("../models/UserModel")(db)

  // Middleware to validate ID
  function isValidId(req, res, next) {
    const id = req.params.id || req.params.author_id;
    if (isNaN(id)) {
        return res.status(400).json({ status: 400, msg: "L'id renseigné n'est pas valide." });
    }
    next();
  }

  // Middleware to check if activity exists
  async function activityExists(req, res, next) {
    const activityId = req.params.id;
    try {
        const activity = await activityModel.getOneActivity(activityId);
        if (activity.code || activity.length === 0) {
            return res.status(404).json({ status: 404, msg: "Aucune activité ne correspond à l'id renseigné." });
        }
        req.activity = activity; // Pass the activity to the next middleware
        next();
    } catch (error) {
        console.error("Erreur lors de la vérification de l'existence de l'activité :", error);
        return res.status(500).json({ status: 500, msg: "Erreur lors de la vérification de l'existence de l'activité.", err: error.message });
    }
  }

  //route de récupération de toutes les activités
  app.get("/api/v1/activity/all", async(req,res,next)=>{
    // récupération de toutes les activités
    let activities = await activityModel.getAllActivities()
    if (activities.code){
      // erreur
      res.json({status: 500, msg: "Erreur de récupération de toutes les activités.", err: activities})
    } else {
      // aucune résultat trouvé --> code 404
      if (activities.length === 0){
        res.json({status: 404, msg: "Il n'existe pas encore d'activités.", activities: activities})
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
      // aucune activité trouvée --> code 404
      if (activities.length === 0){
        res.json({status: 404, msg: "Il n'existe pas encore d'activité en ligne.", activities: activities})
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
      // aucun résultat --> code 404
      if (activities.length === 0){
        res.json({status: 404, msg: "Il n'existe pas d'activité en attente de validation.", activities: activities})
      } else {
         // retour avec les activités trouvées
        res.json({status: 200, msg: "Les activités en attente de validation ont bien été récupérées.", activities: activities})
      }
    }
  })

  //route de récupération de toutes les activités créées par un même auteur - route protégée
  app.get("/api/v1/activity/all/author/:author_id", withAuth, isValidId, async (req, res, next) => {
    const authorId = req.params.author_id;

    try {
        // Récupération de toutes les activités créées par un même auteur
        const activities = await activityModel.getAllActivitiesByAuthor(authorId);
        if (activities.code) {
            return res.status(500).json({ status: 500, msg: "Erreur de récupération des activités de l'auteur.", err: activities });
        } else if (activities.length === 0) {
            return res.status(404).json({ status: 404, msg: "L'auteur n'a pas encore créé d'activité."});
        } else {
            return res.status(200).json({ status: 200, msg: "Les activités de l'auteur ont bien été récupérées.", activities: activities });
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des activités de l'auteur :", error);
        return res.status(500).json({ status: 500, msg: "Erreur lors de la récupération des activités de l'auteur.", err: error.message });
    }
  });

  // route de récupération des activités selon le critère "l'auteur est fournisseur ou non" - route non protégée car besoin pour la page d'accueil
  app.post("/api/v1/activity/all/author-is-provider", async(req, res, next)=>{
    // récupération des activités selon le critère author_is_provider (true/false)
    let activities = await activityModel.getAllActivitiesByAuthorIsProvider(req)
    if (activities.code){
      // erreur
      res.json({status: 500, msg: `Erreur de récupération des activités selon le critère author_is_provider: ${req.body.authorIsProvider}.`, err: activities})
    } else {
      // aucune activité trouvée --> code 404
      if (activities.length === 0){
        res.json({status: 404, msg: `Il n'y a pas d'activité correspond au critère author_is_provider: ${req.body.authorIsProvider}.`, activities: activities})
      } else {
        // retour avec les activités correspondant à la recherche
        res.json({status: 200, msg: "Les activités ont bien été récupérées.", activities: activities})
      }
    }
  })

  //route de récupération d'une activité - route protégée
  app.get("/api/v1/activity/:id", withAuth, isValidId, activityExists, (req, res, next) => {
    return res.status(200).json({ status: 200, msg: "L'activité a bien été trouvée.", activity: req.activity[0] });
  });

  //routes de création d'une activité - route protégée
  app.post("/api/v1/activity/save", withAuth, async(req, res, next)=>{
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
  app.put("/api/v1/activity/update/:id", withAuth, isValidId, activityExists, async (req, res, next) => {
    try {
        const activity = await activityModel.updateOneActivity(req, req.params.id);
        if (activity.code) {
            res.json({ status: 500, msg: "Erreur de mise à jour de l'activité.", err: activity });
        } else {
            res.json({ status: 200, msg: "L'activité a bien été mise à jour. Son nouveau format doit être validé par l'administration." });
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'activité :", error);
        res.json({ status: 500, msg: "Erreur lors de la mise à jour de l'activité.", err: error });
    }
  });

  // route de mise à jour du statut (online/offline) d'une activité par l'auteur de l'activité - route protégée
  app.put("/api/v1/activity/update/status/:id", withAuth, isValidId, activityExists, async (req, res, next) => {
    const activity = req.activity;

    // Vérifier si le statut actuel est "offline" ou "online"
    if (activity[0].status !== "offline" && activity[0].status !== "online") {
        return res.status(400).json({ status: 400, msg: "Vous ne pouvez pas modifier le statut de l'activité : elle est en attente d'être modérée par l'administrateur."});
    }

    try {
        const updateResult = await activityModel.updateOnlineOfflineStatus(req, req.params.id);
        if (updateResult.code) {
            return res.status(500).json({ status: 500, msg: "Erreur de mise à jour du statut de l'activité.", err: updateResult });
        }
        return res.status(200).json({ status: 200, msg: "Le statut de l'activité a bien été mis à jour." });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut de l'activité :", error);
        return res.status(500).json({ status: 500, msg: "Erreur lors de la mise à jour du statut de l'activité.", err: error.message });
    }
  });

  //route de modération de l'activité par l'admin : mise à jour du statut (en attente de validation --> validé/en ligne) - route admin
  app.put("/api/v1/activity/moderate/:id", adminAuth, isValidId, activityExists, async (req, res) => {
    const activityId = req.params.id;
    const activity = req.activity;

    try {
        // Récupération de l'auteur de l'activité par son ID
        const user = await userModel.getOneUserById(activity[0].author_id);
        if (user.code) {
            return res.status(500).json({ status: 500, msg: "Erreur de récupération de l'auteur de l'activité. Le processus de modération de l'activité n'a pas pu aboutir.", err: user });
        } else if (user.length === 0) {
            return res.status(404).json({ status: 404, msg: "L'utilisateur n'a pas été retrouvé. Le processus de modération de l'activité n'a pas pu aboutir." });
        }

        // Mise à jour du statut de l'activité (invalide/validé)
        const resultModeration = await activityModel.moderateOneActivity(req, activityId);
        if (resultModeration.code) {
            return res.status(500).json({ status: 500, msg: "Erreur de mise à jour du statut de l'activité. Le processus de modération de l'activité n'a pas pu aboutir.", err: resultModeration });
        }

        // Notification de l'auteur par mail
        if (req.body.status === "invalidated") {
            // Admin invalide l'activité, notification par mail
            mail(
                user[0].email,
                "Invalidation de votre activité",
                `Invalidation de votre activité « ${activity[0].title} »`,
                `L'activité que vous avez créée n'a pas été validée par l'administration pour le motif suivant: « ${req.body.explanation} ».\nVous pouvez modifier votre activité en prenant en compte cette remarque.\nLe service Harmony`
            );
            return res.status(200).json({ status: 200, msg: "L'activité a été invalidée : statut 'invalidated'." });
        } else {
            // Admin valide l'activité, notification par mail
            mail(
                user[0].email,
                "Publication de votre activité",
                `Publication de votre activité « ${activity[0].title} »`,
                "Bonne nouvelle ! L'activité que vous avez créée a été validée et est désormais en ligne.\nLe service Harmony"
            );
            return res.status(200).json({ status: 200, msg: "L'activité a bien été validée. L'activité est désormais en ligne." });
        }
    } catch (error) {
        console.error("Erreur lors de la modération de l'activité :", error);
        return res.status(500).json({ status: 500, msg: "Erreur lors de la modération de l'activité.", err: error.message });
    }
  });

  // route de suppression d'une activité
  app.delete("/api/v1/activity/delete/:id", withAuth, isValidId, activityExists, async (req, res, next) => {
    try {
        const deleteResult = await activityModel.deleteOneActivity(req.params.id);
        if (deleteResult.code) {
            return res.status(500).json({ status: 500, msg: "Erreur de suppression de l'activité.", err: deleteResult });
        }
        return res.status(200).json({ status: 200, msg: "L'activité a bien été supprimée." });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'activité :", error);
        return res.status(500).json({ status: 500, msg: "Erreur lors de la suppression de l'activité.", err: error.message });
    }
  });

  //route de récupération des activités correspond aux filters appliqués par l'utilisateur
  app.post("/api/v1/activtity/all/filter", withAuth, async(req, res, next)=>{
    // récupération des activités selon les filtres demandés
    let activities = await activityModel.getActivitiesByFilter(req)
    if (activities.code){
      res.json({status: 500, msg: "Erreur de récupération des activités selon les filtres renseignés.", err: activities})
    } else {
      // pas de résultat --> code 404
      if (activities.length === 0){
        res.json({status: 404, msg: "Aucune activité ne correspond aux critères demandés."})
      } else {
        // succès: retour des résultats
        res.json({status: 200, activities: activities})
      }
    }
  })

  // route de modification de la photo de l'activité
  app.put("/api/v1/activity/update-picture/:id", withAuth, isValidId, activityExists, async (req, res) => {
    const activityId = req.params.id;

    try {
        // Changement de la photo de l'activité
        const updatingResult = await activityModel.updatePicture(req.body.urlPicture, activityId);
        if (updatingResult.code) {
            return res.status(500).json({ status: 500, msg: "Erreur de modification de la photo.", err: updatingResult });
        }
        return res.status(200).json({ status: 200, msg: "La photo a bien été modifiée. Votre activité est désormais en attente de validation par l'administration." });
    } catch (error) {
        console.error("Erreur lors de la modification de la photo :", error);
        return res.status(500).json({ status: 500, msg: "Erreur lors de la modification de la photo.", err: error.message });
    }
  });
};
