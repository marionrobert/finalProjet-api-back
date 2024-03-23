# Bienvenue sur *Harmony* : Apprenez à connaître vos voisins en échangeant des coups de main ! 🌳🌞🤝
Harmony est né d'un constat simple. Les personnes bénéficiant d'une protection internationale ont vocation à s'installer durablement en France du fait de leur situation mais elles éprouvent souvent des difficultés à s'intégrer. Nous sommes convaincus que leur intégration peut être facilitée à l'échelle de la ville. Malheureusement, on constate en général un manque d’interactions sociales entre les habitants de longue date et les personnes protégées nouvellement arrivées. Cela est la conséquence directe d’une méconnaissance de l’autre et d’idées préconçues. Le but de notre projet est de favoriser l’inclusion des personnes protégées en développant les échanges et la solidarité entre les habitants d'une même ville. Cette solidarité naîtra de l’échange de coups de main entre voisins. Sur notre site, vous pouvez proposer et/ou réserver une activité pour donner et/ou recevoir un coup de main de la part de vos voisins. En réalisant un coup de main pour quelqu'un, vous gagnez des points que vous pourrez ensuite utiliser pour obtenir de l'aide auprès d'autres utilisateurs.

Bienvenue dans la partie backend de ce projet !

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
```
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
3. Lancer la commande `npm install` pour installer les dépendences.
4. Créez un fichier **.env** à la racine du projet et ajoutez-y les variables d'environnement suivantes :
   - `SECRET` pour signer et vérifier les JSON Web Tokens (JWT)
   - `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` pour l'envoie des mails de confirmation liés à la gestion des comptes (confirmation de création, changement de mot de pase). Pour obtenir ces deux informations, vous devez vous créer un compte sur [Google for developpers](https://developers.google.com/?hl=fr)
5. Pou l'envoi des mails, vous aurez besoin de mettre à jour les variables `resfreshToken` et`accessToken` dans le fichier `lib/mailing.js`.
   Pour obtenir ces deux informations, vous devez vous connecter à l'url suivante : https://developers.google.com/oauthplayground/, sélectionner le service **GMAIL API v1 > https://mail.google.com/** , puis cliquer sur le bouton "Authorize API", puis sur les boutons "Exchange authorization code for tokens". Dans l'onglet "Exchange authorization code for tokens", vous pourrez ainsi retrouver le freshToken et l'accessToken. Ils sont valables pour une durée de 3600 secondes soit 1h. Pour renouveler les tokens, il faudra de nouveau cliquer sur le bouton "Exchange authorization code for tokens".
6. Créez les fichiers **config.js** (pour le production) et **config-offline.js** (pour le développement) à la racine de votre projet pour y mettre les informations concernant votre DB.
   ```
   module.exports = {
       db: {
            host: "YOUR HOST",
            database: "YOUR DB",
            user: "YOUR USER",
            password: "YOUR PASSWORD"
        }
   };
   ```

8. Pour démarrer le serveur, vous avez deux options :
   - `npm start`
   - `npm dev` : cette deuxième option utilise nodemon pour actualiser le serveur à chaque modification de votre code

<br/>

## Contenu des fichiers et fonctionnement

Le projet est organisé comme suit : 
- dossier **lib** contenant le fichier **mailing.js** pour la gestion de l'envoie des mails avec les bilothèques nodemailer et googleapis.
- dossier **models** contenant l'ensemble des modèles : ActivityMoel, BookingModel, CategoryModel, CommentModel, UserModel. Ces fichiers définissent des méthodes pour interagir avec la base de données et effectuer des opérations telles que la récupération, la création, la mise à jour et la suppression des entrées.
- dossier **routes** content l'ensemble des fichiers de routes : activityRoutes.js, authRoutes.js, bookingRoutes.js, categoryRoutes.js, commentRoutes.js
- dossier **public**
- dossier **views** contenant les views pour la confirmation de la création du compte et le changement de mot de passe.
- les middlewares **withAuth** et **adminAuth** utilisés pour authentifier les utilisateurs et pour s'assurer qu'ils ont les autorisations nécessaires pour accéder à certaines routes.

<br/>

## Dossier lié
La partie front-end de l'application est accessible [ici](https://github.com/marionrobert/harmony-front-react/tree/main)
