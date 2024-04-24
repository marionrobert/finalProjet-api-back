(english below)

# Bienvenue sur *Harmony* : Apprenez à connaître vos voisins en échangeant des coups de main ! 🌳🌞🤝
<img src="/public/screenshots/banner.png" alt="bannière de l'application web">

Harmony est né d'un constat simple. Les personnes bénéficiant d'une protection internationale ont vocation à s'installer durablement en France du fait de leur situation mais elles éprouvent souvent des difficultés à s'intégrer. Nous sommes convaincus que leur intégration peut être facilitée à l'échelle de la ville. Malheureusement, on constate en général un manque d’interactions sociales entre les habitants de longue date et les personnes protégées nouvellement arrivées. Cela est la conséquence directe d’une méconnaissance de l’autre et d’idées préconçues. Le but de notre projet est de favoriser l’inclusion des personnes protégées en développant les échanges et la solidarité entre les habitants d'une même ville. Cette solidarité naîtra de l’échange de coups de main entre voisins. Sur notre site, vous pouvez proposer et/ou réserver une activité pour donner et/ou recevoir un coup de main de la part de vos voisins. En réalisant un coup de main pour quelqu'un, vous gagnez des points que vous pourrez ensuite utiliser pour obtenir de l'aide auprès d'autres utilisateurs.

Ce dépôt est consacré à la **partie backend** du projet.

<br/>

## Contexte de développement 💻
Il s'agit d'un projet éducatif développé en tant que projet final de la formation "Développeur web FullStack Javascript" à la 3w Academy.

<br/>

## Installation et Configuration ⚙️🛠️

### Prérequis système :
L'application tourne actuellement sur :
- Node.js (version 16.15.1)
- Npm (version 8.11.0)

Voici la liste des packages et leur version utilisés dans ce projet : 
```javascript
"dependencies": {
    "bcrypt": "^5.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "ejs": "^3.1.9",
    "express": "^4.18.2",
    "express-fileupload": "^1.4.0",
    "googleapis": "^123.0.0",
    "jsonwebtoken": "^9.0.1",
    "nodemailer": "^6.9.4",
    "nodemon": "^3.0.1",
    "promise-mysql": "^5.2.0",
    "random-id": "^1.0.4"
  }
```
<br/>

### Étapes d'installation :
1. Clonez le dépôt Git : `git clone https://github.com/marionrobert/finalProjet-api-back.git`
2. Assurez-vous d'avoir la stack technologique installée avec les bonnes versions.
3. Lancer la commande `npm install` pour installer les dépendances.
4. Créez un fichier **.env** à la racine du projet et ajoutez-y les variables d'environnement suivantes :
   - `SECRET` pour signer et vérifier les JSON Web Tokens (JWT)
   - `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` pour l'envoie des mails de confirmation liés à la gestion des comptes (confirmation de création, changement de mot de pase). Pour obtenir ces deux informations, vous devez vous créer un compte sur [Google for developpers](https://developers.google.com/?hl=fr)
5. Pour l'envoi des mails, vous aurez besoin de mettre à jour les variables `resfreshToken` et`accessToken` dans le fichier `lib/mailing.js`.
   Pour obtenir ces deux informations, vous devez vous connecter à l'url suivante : https://developers.google.com/oauthplayground/, sélectionner le service **GMAIL API v1 > https://mail.google.com/** , puis cliquer sur le bouton "Authorize API", puis sur les boutons "Exchange authorization code for tokens". Dans l'onglet "Exchange authorization code for tokens", vous pourrez ainsi retrouver le freshToken et l'accessToken. Ils sont valables pour une durée de 3600 secondes soit 1h. Pour renouveler les tokens, il faudra de nouveau cliquer sur le bouton "Exchange authorization code for tokens".
6. **Création et connection à la base de données** :
   - vous devez avoir un logiciel de base de données (comme MySQL Workbench, phpMyAdmin, etc.).
   - importez le fichier **marionrobert_3waproject.sql** dans le logiciel de base de données et exécuter l'importation. Vérifier que la base de données a bien été créée.
   - Créez les fichiers **config.js** (pour le production) et **config-offline.js** (pour le développement) à la racine de votre projet pour y mettre les informations concernant votre DB.
   ```javascript
   module.exports = {
       db: {
            host: "YOUR HOST",
            database: "YOUR DB",
            user: "YOUR USER",
            password: "YOUR PASSWORD"
        }
   };
   ```
7. Pour démarrer le serveur, vous avez deux options :
   - `npm start`
   - `npm dev` : cette deuxième option utilise nodemon pour actualiser le serveur à chaque modification de votre code
  
8. Pour prendre en main l'application, voici des identifiants de connexion :
    - Compte administrateur :
        - Adresse e-mail : admin-harmony@gmail.com
        - Mot de passe : AqwPM741*
    - Compte utilisateur :
        - Adresse e-mail : user-test-harmony@hotmail.fr
        - Mot de passe : Azerty123*

Pour tester toutes les fonctionnalités de l'application, notamment l'envoi d'e-mails à l'utilisateur, veuillez remplacer, directement dans la base de données, l'adresse e-mail factice par une adresse e-mail réelle ou créez un nouveau compte.

<br/>

## Contenu des fichiers 📁🗃️

Le projet est organisé en plusieurs dossiers : 
- **lib**: ce dossier contient le fichier **mailing.js** pour la gestion de l'envoie des mails avec les bilothèques *nodemailer* et *googleapis*.
- **models** : ce dossier contient l'ensemble des modèles de données : *ActivityModel, BookingModel, CategoryModel, CommentModel, UserModel*. Ces fichiers définissent des méthodes pour interagir avec la base de données et effectuer des opérations telles que la récupération, la création, la mise à jour et la suppression des entrées.
- **routes** : Ce dossier contient les fichiers de configuration des routes de l'API REST de l'application, tels que `activityRoutes.js`, `authRoutes.js`, `bookingRoutes.js`, `categoryRoutes.js` et `commentRoutes.js`. Chaque fichier définit des routes pour différentes fonctionnalités de l'application, en appelant les méthodes appropriées des modèles.
    - Par exemple, pour le fichier `activityRoutes`, les routes incluent la récupération de toutes les activités, la récupération des activités en ligne, la récupération des activités en attente de validation, la récupération des activités créées par un auteur spécifique, la création, la mise à jour, et la suppression d'activités, etc. Pour certaines routes sensibles, telles que la création, la mise à jour et la suppression d'activités, ainsi que la modération d'activités par un administrateur, il utilise les middlewares withAuth et adminAuth pour assurer que l'utilisateur est authentifié et possède les autorisations nécessaires le cas échéant.
    - Particularité du fichier `authRoutes.js` : ce fichier gère la route liée à l'authentification dans l'application *GET /api/v1/user/checkToken* qui permet à un utilisateur authentifié de vérifier son token d'authentification et de récupérer ses informations d'utilisateur associées à partir de la base de données. Cela facilite la reconnexion automatique du frontend et permet de maintenir une session utilisateur active.
- **public** : il contient les ressources statiques, des images principales, car le css, peu conséquent, a été intégré directement dans les vues.
- **views** : il contient les views pour la confirmation de la création du compte et le changement de mot de passe. Elles sont composées de la structure html de le la page et du css associé.
- les fichiers middlewares **withAuth** et **adminAuth** utilisés pour authentifier les utilisateurs et pour s'assurer qu'ils ont les autorisations nécessaires pour accéder à certaines routes.

<br/>

## Dossier lié 🔗
La partie front-end de l'application est accessible [ici](https://github.com/marionrobert/harmony-front-react)

---
---
# Welcome to *Harmony*: Get to Know Your Neighbors by Exchanging Helping Hands! 🌳🌞🤝
![Banner](/public/screenshots/banner.png)

Harmony was born from a simple observation. People with international protection are likely to settle permanently in France due to their situation, but they often struggle to integrate. We believe that their integration can be facilitated at the city level. Unfortunately, there is generally a lack of social interactions between long-time residents and newly arrived protected individuals. This is a direct result of unfamiliarity with each other and preconceived ideas. The goal of our project is to promote the inclusion of protected individuals by developing exchanges and solidarity among residents of the same city. This solidarity will come from exchanging helping hands between neighbors. On our site, you can propose and/or book an activity to give and/or receive a helping hand from your neighbors. By doing a helping hand for someone, you earn points that you can later use to get help from other users.

This repository is dedicated to the **backend part** of the project.

## Development Context 💻
This is an educational project developed as the final project of the "FullStack Javascript Web Developer" training at 3w Academy.

## Installation and Configuration ⚙️🛠️

### System Requirements:
The application currently runs on:
- Node.js (version 16.15.1)
- Npm (version 8.11.0)

Here is the list of packages and their versions used in this project:
```javascript
"dependencies": {
    "bcrypt": "^5.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "ejs": "^3.1.9",
    "express": "^4.18.2",
    "express-fileupload": "^1.4.0",
    "googleapis": "^123.0.0",
    "jsonwebtoken": "^9.0.1",
    "nodemailer": "^6.9.4",
    "nodemon": "^3.0.1",
    "promise-mysql": "^5.2.0",
    "random-id": "^1.0.4"
  }
```
<br/>

### Installation Steps:
1. Clone the Git repository: `git clone https://github.com/marionrobert/finalProjet-api-back.git`
2. Make sure you have the required technology stack installed with the correct versions.
3. Run the command `npm install` to install dependencies.
4. Create a **.env** file at the root of the project and add the following environment variables:
   - `SECRET` to sign and verify JSON Web Tokens (JWT)
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for sending confirmation emails related to account management (account creation confirmation, password change). To obtain this information, you need to create an account on [Google for Developers](https://developers.google.com/?hl=en).
5. For sending emails, you'll need to update the `refreshToken` and `accessToken` variables in the `lib/mailing.js` file.
   To obtain these, you need to visit [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/), select **GMAIL API v1 > https://mail.google.com/** service, click on "Authorize API," and then "Exchange authorization code for tokens." In the "Exchange authorization code for tokens" tab, you can find the refreshToken and accessToken. They are valid for 3600 seconds (1 hour). To refresh the tokens, you'll need to click "Exchange authorization code for tokens" again.
6. **Database Creation and Connection**:
   - You need a database software (like MySQL Workbench, phpMyAdmin, etc.).
   - Import the **marionrobert_3waproject.sql** file into the database software and execute the import. Verify that the database has been created.
   - Create the **config.js** (for production) and **config-offline.js** (for development) files at the root of your project to store your DB information.
   ```javascript
   module.exports = {
       db: {
            host: "YOUR HOST",
            database: "YOUR DB",
            user: "YOUR USER",
            password: "YOUR PASSWORD"
        }
   };
   ```
7. To start the server, you have two options:
   - `npm start`
   - `npm dev`: this second option uses nodemon to refresh the server with each code modification.

8. To get started with the application, here are the login credentials:
    - **Admin Account**:
        - Email Address: admin-harmony@gmail.com
        - Password: AqwPM741*
    - **User Account**:
        - Email Address: user-test-harmony@hotmail.fr
        - Password: Azerty123*

To test all the functionalities of the application, including sending emails to the user, please replace the fake email address directly in the database with a real email address or create a new account.

## File Contents 📁🗃️

The project is organized into several folders:
- **lib**: This folder contains the **mailing.js** file for managing email sending with the *nodemailer* and *googleapis* libraries.
- **models**: This folder contains all the data models: *ActivityModel, BookingModel, CategoryModel, CommentModel, UserModel*. These files define methods to interact with the database and perform operations such as retrieval, creation, update, and deletion of entries.
- **routes**: This folder contains the route configuration files of the application's REST API, such as `activityRoutes.js`, `authRoutes.js`, `bookingRoutes.js`, `categoryRoutes.js`, and `commentRoutes.js`. Each file defines routes for different functionalities of the application, calling appropriate methods from the models.
    - For example, in the `activityRoutes` file, routes include retrieving all activities, getting online activities, fetching pending approval activities, getting activities created by a specific author, creating, updating, and deleting activities, etc. For some sensitive routes such as creating, updating, and deleting activities, as well as moderating activities by an admin, it uses the `withAuth` and `adminAuth` middlewares to ensure the user is authenticated and has necessary permissions if needed.
    - Special mention for `authRoutes.js`: this file handles the authentication route in the application, *GET /api/v1/user/checkToken*, allowing an authenticated user to verify their authentication token and retrieve their associated user information from the database. This facilitates automatic reconnection from the frontend and maintains an active user session.

- **public**: It contains static resources, main images, as the CSS, which is minimal, is directly integrated into the views.
- **views**: It contains views for confirming account creation and password change. They consist of the HTML page structure and associated CSS.
- Middleware files **withAuth** and **adminAuth** are used to authenticate users and ensure they have necessary permissions to access certain routes.

## Related Repository 🔗
The frontend part of the application is accessible [here](https://github.com/marionrobert/harmony-front-react)


