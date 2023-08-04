const fs = require("fs") // pour supprimer les images en local
const withAuth = require("../withAuth")
const adminAuth = require("../adminAuth")

module.exports = (app, db) => {
  const activityModel = require("../models/ActivityModel")(db)
}
