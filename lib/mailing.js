//on importe la librairie de nodemailer (envoi de mail)
const nodeMailer = require('nodemailer')
//on importe l'api de google
const { google } = require('googleapis')
//on récupère l'objet d'authentification du propriétaire du compte google à brancher
const OAuth2 = google.auth.OAuth2
const google_client_secret = process.env.GOOGLE_CLIENT_SECRET
const google_client_id = process.env.GOOGLE_CLIENT_ID

module.exports = (mailTo, subject, title, text) => {

    //on instancie l'authentification qu'on pourra utiliser dans le transport du mail
    const oauth2Client = new OAuth2(
        google_client_id, //client_id
        google_client_secret, //client_secret
        "https://developers.google.com/oauthplayground" // Redirect URL
    )

    //envoi des authentifications clients avec le token provisoire
    oauth2Client.setCredentials({
        refresh_token: "1//04vjoA2le5JZjCgYIARAAGAQSNwF-L9IrmOGQb53BJTv4WyC-Fk02pgD1eTe8rjxYaC4PlYtDV7rXAPvAA1YGBghJpSO4lHhKQDA"
    })

    // console.log("oauth2Client", oauth2Client)

    //création du transport du mail pret à partir (préparation)
    let transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: 'mrobert148@gmail.com',
            google_client_id, //client_id
            google_client_secret, //client_secret
            refreshToken: "1//04vjoA2le5JZjCgYIARAAGAQSNwF-L9IrmOGQb53BJTv4WyC-Fk02pgD1eTe8rjxYaC4PlYtDV7rXAPvAA1YGBghJpSO4lHhKQDA",
            accessToken: "ya29.a0AfB_byD4D6C1KM8Hq2-wvYMSKZN7KyCMiZZmwiSTGT9omooaYkNPYT9CoBpYopOO-HprDuuG4Ly_yxlyQHcCSkwEcbsYDl7ETA1zNjg5jXdVz0pFFVLG7bm-C3SbMUAbChltASGTVpAPlhVJwR74hWbm3RHYbuRh3XWRaCgYKAWESARMSFQHGX2MiqVv7SVAiC4VgLuuYD4-FCw0171"
        }
    })

    //modèle du mail
    let mailOptions = {
        from: '"Harmony" <noreply-harmony@gmail.com>', //adresse d'envoi
        to: mailTo, //liste des destinataires
        subject: subject, // objet du mail
        text: "", // text dans le corps du mail
        html: `<h1>${title}</h1>\n<p>${text}</p>` //corps html (contenu du mail)
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if(err){
            console.log("Echec de l'envoi du mail.", err)
            return console.log(err)
        }
        console.log(`Le mail a bien été envoyé à ${mailTo}.`, info)
    })
}
