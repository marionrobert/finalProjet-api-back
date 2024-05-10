// Chargement des variables d'environnement à partir du fichier .env
require('dotenv').config();

// Importation du module Express pour la création d'une application Express
const express = require("express");
// Création de l'instance de l'application Express
const app = express();

// Importation du module promise-mysql pour interagir avec MySQL de manière asynchrone
const mysql = require("promise-mysql");
// Importation du module cors pour gérer les requêtes CORS (Cross-Origin Resource Sharing)
const cors = require("cors");

// Activation du middleware CORS pour permettre les requêtes depuis d'autres domaines
app.use(cors());

// Importation du module express-fileupload pour gérer le téléchargement de fichiers
const fileUpload = require("express-fileupload");
// Configuration du middleware pour gérer le téléchargement de fichiers et créer les répertoires parents si besoin
app.use(fileUpload({
  createParentPath: true
}));

// Parsing des URL encodées et JSON
// permet à Express de comprendre les données provenant de formulaires HTML.
app.use(express.urlencoded({ extended: false }));
// permet à Express de comprendre les données au format JSON envoyées depuis le front-end.
app.use(express.json());

// Activation du dossier public pour servir les fichiers statiques (CSS, JavaScript, images, etc.)
app.use(express.static(__dirname + "/public"));

// Configuration du moteur de templates EJS
app.set('views', './views');
app.set('view engine', 'ejs');

let config;
// Vérification si l'API est en ligne (sur un serveur) ou non et décision de quelle base de données utiliser
if (!process.env.HOST){
  // Pas de variable d'environnement au nom de HOST --> développement local
  config = require("./config-offline");
} else {
  // En ligne
  config = require("./config");
}

// Définition des variables de connexion à la base de données en utilisant les variables d'environnement ou la configuration locale
const host = process.env.HOST || config.db.host;
const database = process.env.DATABASE_DB || config.db.database;
const user = process.env.USER_DB || config.db.user;
const password = process.env.PASSWORD || config.db.password;
//const port = process.env.PORT || config.db.port (pour ceux qui utilisent MAMP (port 8889), par défaut il est sur le port 3306)


//importation des routes
const userRoutes = require("./routes/userRoutes")
const authRoutes = require("./routes/authRoutes")
const categoryRoutes = require("./routes/categoryRoutes")
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
  categoryRoutes(app, db)
  activityRoutes(app, db)
  bookingRoutes(app, db)
  commentRoutes(app, db)
})
.catch(err=>console.log("Echec de la connexion à la BDD: ", err))

const PORT = process.env.PORT || 9000

app.listen(PORT, ()=>{
  console.log(`Listening on port ${PORT}, everything is ok.`)
})
