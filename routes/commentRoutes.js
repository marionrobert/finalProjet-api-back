const withAuth = require("../withAuth")
const adminAuth = require("../adminAuth")

module.exports = (app,db) => {
  const commentModel = require("../models/CommentModel")(db)

  //route de récupération de tous les commentaires - route protégée

  //route de récupération de tous les commentaires en attente de validation par l'admin

  //route de récupération 


}
