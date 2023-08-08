const { admin } = require("googleapis/build/src/apis/admin")
const adminAuth = require("../adminAuth")

module.exports = (app, db) => {
  const categoryModel = require("../models/CategoryModel")(db)

  //route de récupération de toutes les catégories - route admin
  app.get("/api/v1/category/all", adminAuth, async(req, res, next)=>{
    let categories = await categoryModel.getAllCategories()
    if (categories.code){
      res.json({status: 500, msg: "Erreur de récupération de toutes les catégories.", err: categories})
    } else {
      if (categories.length === 0){
        res.json({status: 401, msg: "Il n'existe pas encore d'catégories.", categories: categories})
      } else {
        res.json({status: 200, msg: "Les catégories ont bien été récupérées.", categories: categories})
      }
    }
  })

  // route de récupération d'une activité par son Id - route admin
  app.get("/api/v1/category/one:id", adminAuth, async(req,res,next)=>{
    if (isNaN(req.params.id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      let category = await categoryModel.getOneCategory(req.params.id)
      if (category.code){
        res.json({status: 500, msg: "Erreur de récupération d'une catégorie.", err: category})
      } else {
        if (category.length === 0){
          res.json({status: 401, msg: "Aucune catégorie ne correspond à cet id.", category: category})
        } else {
          res.json({status: 200, msg: "La catégorie a bien été trouvée.", category: category})
        }
      }
    }
  })

  // route de récupération d'une activité par son titre
  app.get("/api/v1/category/one/title", adminAuth, async(req,res,next)=>{
    let category = await categoryModel.getOneCategory(req)
    if (category.code){
      res.json({status: 500, msg: "Erreur de récupération d'une catégorie.", err: category})
    } else {
      if (category.length === 0){
        res.json({status: 401, msg: "Aucune catégorie ne correspond à ce titre.", category: category})
      } else {
        res.json({status: 200, msg: "La catégorie a bien été trouvée.", category: category})
      }
    }
  })

  // route de création d'une activité
  app.post("/api/v1/category/save", adminAuth, async(req, res, next)=>{
    let category = await categoryModel.saveOneCategory()
    if (category.code){
      res.json({status: 500, msg: "Erreur de création de la catégorie.", err: category})
    } else {
      res.json({status: 200, msg: "La catégorie a bien été créée.", category: category})
    }
  })

  // route de mise à jour d'une catégorie
  app.put("/api/v1/category/update/:id", adminAuth, async(req, res, next)=>{
    if (isNaN(req.params.id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      let category = await categoryModel.updateOneCategory(req.params.id)
      if (category.code){
        res.json({status: 500, msg: "Erreur de mise à jour de la catégorie.", err: category})
      } else {
        res.json({status: 200, msg: "La catégorie a bien été mise à jour.", category: category})
      }
    }
  })

  app.delete("/api/v1/category/delete/:id", adminAuth, async(req, res, next)=>{
    if (isNaN(req.params.id)){
      res.json({status: 500, msg: "L'id renseigné n'est pas un nombre."})
    } else {
      // vérifions qu'une catégorie "Autres" existe
      let otherCategory = await categoryModel.getOneCategoryByTitle("Autres")
      if (otherCategory.code){
        res.json({status: 500, msg: 'Erreur rencontrée dans le processus de suppression de la catégorie.', err: otherCategory})
      } else {
        //console.log(otherCategory)
        if (otherCategory.id === req.params.id){
          // l'admin tenter de supprimer l'activité Autres
          res.json({status: 500, msg: 'La catégorie "Autres" ne peut pas être supprimée.'})
        } else {
          //l'admin cherche à supprimer une autre activité

        }
      }
    }
  })
}
