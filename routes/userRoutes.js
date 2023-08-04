const bcrypt = require("bcrypt")
const saltRounds = 10

// librairie qui va générer un token de connexion
const jwt = require("jsonwebtoken")
const secret = "pbio8451*$"
const withAuth = require("../withAuth")

module.exports = (app, db) => {
  const userModel = require("../models/UserModel")(db)
}
