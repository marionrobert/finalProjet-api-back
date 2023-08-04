const withAuth = require("../withAuth")
const adminAuth = require("../adminAuth")

module.exports = (app,db) => {
  const commentModel = require("../models/CommentModel")(db)
}
