const bcrypt = require("bcrypt")
const saltRounds = 10

// librairie qui va générer un token de connexion
const jwt = require("jsonwebtoken")
const secret = process.env.SECRET
// console.log("secret from userRoutes -->", secret)
const withAuth = require("../withAuth")

module.exports = (app, db) => {
  const userModel = require("../models/UserModel")(db)
}
