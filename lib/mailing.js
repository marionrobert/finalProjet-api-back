//on importe la librairie de nodemailer (envoi de mail)
const nodeMailer = require('nodemailer')
//on importe l'api de google
const { google } = require('googleapis')
//on récupère l'objet d'authentification du propriétaire du compte google à brancher
const OAuth2 = google.auth.OAuth2

module.exports = (mailTo, subject, title, text) => {

    //on instancie l'authentification qu'on pourra utiliser dans le transport du mail
    const oauth2Client = new OAuth2(
        "464804882265-nm3td054tvnl90sepsm23e528tbo9qf5.apps.googleusercontent.com", //client_id
        "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", //client_secret
        "https://developers.google.com/oauthplayground" // Redirect URL
    )

    //envoi des authentifications clients avec le token provisoire
    oauth2Client.setCredentials({
        refresh_token: "1//044CGIRV0tIkMCgYIARAAGAQSNwF-L9Irttkov5RCN-I9N8MyCxejBP6d5dBfsw7haUmRLYbZ-nrEqe_dSf8bEjbwjHFjHE0yEwk"
    })

    // console.log("oauth2Client", oauth2Client)

    //création du transport du mail pret à partir (préparation)
    let transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: 'mrobert148@gmail.com',
            clientId: "464804882265-nm3td054tvnl90sepsm23e528tbo9qf5.apps.googleusercontent.com",
            clientSecret: "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",
            refreshToken: "1//044CGIRV0tIkMCgYIARAAGAQSNwF-L9Irttkov5RCN-I9N8MyCxejBP6d5dBfsw7haUmRLYbZ-nrEqe_dSf8bEjbwjHFjHE0yEwk",
            accessToken: "ya29.a0AfB_byAKT0xYTRXPK3_g9N0B1apYHYLbmxszotK1qJHK8C-QuCKPA0cjIf7VZRFdEJ0DZBV_imJkbRj99lPJQ8y654Z0km4_dlSZsE94yS48gX0BoCEYtimJ2gorqAaJ1wqOasZw-n20Levxkc_qIVY-urB3-Q6Hu6_7aCgYKAa8SARMSFQHGX2MizTF0zXuqsg2AWqTFyLW9Lg0171"
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
