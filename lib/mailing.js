//on importe la librairie de nodemailer (envoi de mail)
const nodeMailer = require('nodemailer')
//on importe l'api de google
const { google } = require('googleapis')
//on récupère l'objet d'authentification du proprio du compte google à brancher
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
        refresh_token: "1//0483x4ORfqYLmCgYIARAAGAQSNwF-L9IrBrq8a-7Y4EBaQ-hdc1xziPOl4KqlJOp22jeQCMYvpSXGxsj95fa3XEWAxeluej3_WBA"
    })

    console.log("oauth2Client", oauth2Client)

    //création du transport du mail pret à partir (préparation)
    let transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: 'mrobert148@gmail.com',
            clientId: "464804882265-nm3td054tvnl90sepsm23e528tbo9qf5.apps.googleusercontent.com",
            clientSecret: "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",
            refreshToken: "1//0483x4ORfqYLmCgYIARAAGAQSNwF-L9IrBrq8a-7Y4EBaQ-hdc1xziPOl4KqlJOp22jeQCMYvpSXGxsj95fa3XEWAxeluej3_WBA",
            accessToken: "ya29.a0AfB_byBfKwvfQ83W-xKxqTvpNTkGimDEIUwihWVKKO7ZVmxTgQJNyEuv4TGkQW8-5vIhhTpIe64eHaAr1wAHRPxvOygGNfUxqhlcZauUeHCu8YPinMEm_AaPPK9LXmiQhd7_dXYWUZWm0xcWC9gjHOALbmlnUAzsAlJFdAaCgYKAcQSARISFQHsvYlsnbmOFIz8hy7nX8fWZp6ksg0173"
        }
    })

    //modèle du mail
    let mailOptions = {
        from: '"Harmony" <noreply-harmony@gmail.com>', //sender address
        to: mailTo, //liste de ceux qui recoivent le mail
        subject: subject, // sujet du mail
        text: "", //on peut juste mettre un text dans le corps du mail
        html: `<h1>${title}</h1><p>${text}</p>` //corps html (contenu du mail) RECOMMANDE
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if(err){
            console.log("Echec de l'envoi du mail.", err)
            return console.log(err)
        }
        console.log(`Le mail a bien été envoyé à ${mailTo}.`, info)
    })
}
