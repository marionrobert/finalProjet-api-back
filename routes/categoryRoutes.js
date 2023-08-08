const withAuth = require("../withAuth")
const adminAuth = require("../adminAuth")

module.exports = (app, db) => {
  const categoryModel = require("../models/CategoryModel")(db)

}
