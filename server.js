require('dotenv').config(); // chargement des variables d'environnement

const express = require("express")
const app = express()

const mysql = require("promise-mysql")
const cors = require("cors")

app.use(cors())

const fileUpload = require("express-fileupload")

app.use(fileUpload({
  createParentPath: true
}))

//parse les url
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(express.static(__dirname+"/public"))

let config;
// vérification l'api est en ligne (sur un server) ou non et on décide quelle bdd on va utiliser.
if (!process.env.HOST){
  // pas de variable d'environnement au nom de HOST --> développement local
  config = require("./config-offline")
} else {
  // en ligne
  config = require("./config")
}

const host = process.env.HOST || config.db.host
const database = process.env.DATABASE_DB || config.db.database
const user = process.env.USER_DB || config.db.user
const password = process.env.PASSWORD || config.db.password
//const port = process.env.PORT || config.db.port (pour ceux qui uitilisent mamp (port 8889) par défaut il est sur le port 3306)

//importation des routes
const userRoutes = require("./routes/userRoutes")
const authRoutes = require("./routes/authRoutes")
const activityRoutes = require("./routes/activityRoutes")
const bookingRoutes = require("./routes/bookingRoutes")
const commentRoutes = require("./routes/commentRoutes")

// connexion à la bdd
mysql.createConnection({
  host: host,
  database: database,
  user: user,
  password: password
  //port: port (pour mamp MAC)
}).then((db)=>{
  console.log("Connexion à la BDD : OK")
  setInterval(async() => {
    let res = await db.query("SELECT 1")
  }, 10000)

  app.get("/", async(req, res, next)=>{
    res.json({status: 200, msg: "Welcome to Harmony API-BACK!"})
  })

  //appel des routes
  userRoutes(app, db)
  authRoutes(app, db)
  activityRoutes(app, db)
  bookingRoutes(app, db)
  commentRoutes(app, db)
})
.catch(err=>console.log("Echec de la connexion à la BDD: ", err))

const PORT = process.env.PORT || 9000

app.listen(PORT, ()=>{
  console.log(`Listening on port ${PORT}, everything is ok.`)
})
