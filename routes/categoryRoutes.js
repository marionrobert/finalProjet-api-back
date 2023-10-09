const { admin } = require("googleapis/build/src/apis/admin")
// authentification admin
const adminAuth = require("../adminAuth")
//  authentification simple
const withAuth = require("../withAuth")

module.exports = (app, db) => {
  const categoryModel = require("../models/CategoryModel")(db)
  const activityModel = require("../models/ActivityModel")(db)

  //route de récupération de toutes les catégories - route protégée
  app.get("/api/v1/category/all", withAuth, async(req, res, next)=>{
    let categories = await categoryModel.getAllCategories()
    if (categories.code){
      // erreur
      res.json({status: 500, msg: "Erreur de récupération de toutes les catégories.", err: categories})
    } else {
      // aucun résultat trouvé --> code 204
      if (categories.length === 0){
        res.json({status: 204, msg: "Il n'existe pas encore de catégories.", categories: categories})
      } else {
        // retour des réusltats
        res.json({status: 200, msg: "Les catégories ont bien été récupérées.", categories: categories})
      }
    }
  })

  // route de récupération d'une catégorie par son Id - route admin
  app.get("/api/v1/category/one/:id", adminAuth, async(req,res,next)=>{
    if (isNaN(req.params.id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      let category = await categoryModel.getOneCategory(req.params.id)
      if (category.code){
        // erreur
        res.json({status: 500, msg: "Erreur de récupération d'une catégorie.", err: category})
      } else {
        // aucun résultat trouvé --> code 204
        if (category.length === 0){
          res.json({status: 204, msg: "Aucune catégorie ne correspond à cet id.", category: category})
        } else {
          // succès: retour des résultats
          res.json({status: 200, msg: "La catégorie a bien été trouvée.", category: category})
        }
      }
    }
  })

  // route de récupération d'une catégorie par son titre - route admin
  app.post("/api/v1/category/one/title", adminAuth, async(req,res,next)=>{
    console.log("hello from /api/v1/category/one/title route ")
    let category = await categoryModel.getOneCategoryByTitle(req.body.title)
    if (category.code){
      // erreur
      res.json({status: 500, msg: "Erreur de récupération d'une catégorie.", err: category})
    } else {
      // aucun résultat trouvé --> code 204
      if (category.length === 0){
        res.json({status: 401, msg: "Aucune catégorie ne correspond à ce titre.", category: category})
      } else {
        // succès: retour des résultats
        res.json({status: 200, msg: "La catégorie a bien été trouvée.", category: category})
      }
    }
  })

  // route de création d'une catégorie - route admin
  app.post("/api/v1/category/save", adminAuth, async(req, res, next)=>{
    // vérification qu'une catégorie n'existe pas déjà avec le même titre
    let existingCategory = await categoryModel.getOneCategoryByTitle(req)
    if (existingCategory.code){
      // erreur
      res.json({status: 500, msg: "Erreur de récupération de la catégorie par titre"})
    } else {
      if (existingCategory.length > 0){
        res.json({status: 401, msg: `Une catégorie ${req.body.title} existe déjà.`, existingCategory: existingCategory})
      } else {
        // création de la catégorie
        let category = await categoryModel.saveOneCategory(req)
        if (category.code){
          // erreur
          res.json({status: 500, msg: "Erreur de création de la catégorie.", err: category})
        } else {
          // succès : la catégorie est créée
          res.json({status: 200, msg: "La catégorie a bien été créée.", category: category})
        }
      }
    }
  })

  // route de mise à jour d'une catégorie, route admin
  app.put("/api/v1/category/update/:id", adminAuth, async(req, res, next)=>{
    if (isNaN(req.params.id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      // vérifions qu'une catégorie "Autres" existe
      let otherCategory = await categoryModel.getOneCategory(req.params.id)
      if (otherCategory.code || otherCategory.length === 0){
        res.json({status: 500, msg: 'Erreur rencontrée dans le processus de modification de la catégorie.', err: otherCategory})
      } else {
        // console.log("otherCategory", otherCategory)
        if (otherCategory[0].title === "Autres"){
          // interdiction de modifier la catégorie "Autres" : elle doit rester intacte car quand une catégorie est supprimée, les activités liées à la atégorie supprimée sont rattachées à la catégorie "Autres"
          res.json({status: 401, msg: 'La catégorie Autres ne peut pas être modifiée.'})
        } else {
          let category = await categoryModel.updateOneCategory(req, req.params.id)
          if (category.code){
            // erreur
            res.json({status: 500, msg: "Erreur de mise à jour de la catégorie.", err: category})
          } else {
            // succès : la catégorie est bien modifiée
            res.json({status: 200, msg: "La catégorie a bien été mise à jour.", category: category})
          }
        }
      }
    }
  })


  // route de suppression d'une catégorie qui n'est pas la catégorie "Autres" - route admin
  app.delete("/api/v1/category/delete/:id", adminAuth, async(req, res, next)=>{
    if (isNaN(req.params.id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      // vérifions qu'une catégorie "Autres" existe
      let otherCategory = await categoryModel.getOneCategoryByTitle("Autres")
      if (otherCategory.code || otherCategory.length === 0){
        //on ne peut pas procéder à la suppression car il n'y a pas de catégorie de secours pour reclasser les activités rattachées à la catégorie qu'on souhaite supprimer
        // attention code erreur et message
        res.json({status: 500, msg: 'Erreur rencontrée dans le processus de suppression de la catégorie.', err: otherCategory})
      } else {
        // console.log("otherCategory -->", otherCategory[0])
        // console.log(typeof(req.params.id))
        if (otherCategory[0].id === parseInt(req.params.id)){
          // l'admin tenter de supprimer la catégorie "Autres"
          // attention code erreur et message
          res.json({status: 500, msg: 'La catégorie Autres ne peut pas être supprimée.'})
        } else {
          //l'admin cherche à supprimer une autre catégorie
          let category = await categoryModel.deleteOneCategory(req.params.id)
          if (category.code){
            // erreur
            res.json({status: 500, msg: "Erreur dans la suppression de la catégorie.", err: category})
          } else {
            // chngmt de la catégorie de rattachement pour les activités
            let activities = await activityModel.updateActivitiesCategory(req.params.id, otherCategory[0].id)
            if (activities.code){
              //  erreur
              res.json({status: 500, msg: 'Erreur dans le changement de la catégorie pour les activités attachées à la catégorie supprimée.', err: activities})
            } else {
              // succès
              res.json({status: 200, msg: "La catégorie a été supprimée. Les activités associés ont été rangées dans la catégorie Autres.", result: category, activities: activities})
            }

          }
        }
      }
    }
  })
}
