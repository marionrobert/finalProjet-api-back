//on importe la librairie de nodemailer (envoi de mail)
const nodeMailer = require('nodemailer')
//on importe l'api de google
const { google } = require('googleapis')
//on récupère l'objet d'authentification du proprio du compte google à brancher
const OAuth2 = google.auth.OAuth2

module.exports = (mailTo, subject, title, text) => {

    //on instancie l'authentification qu'on pourra utiliser dans le transport du mail
    const oauth2Client = new OAuth2(
        "429083577750-5ranumd1rs2k2rhv2fpue8t5gkcr7dte.apps.googleusercontent.com", //client_id
        "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", //client_secret
        "https://developers.google.com/oauthplayground" // Redirect URL
    )

    //envoi des authentifications clients avec le token provisoire
    oauth2Client.setCredentials({
        refresh_token: "1//04M-radEnV3QwCgYIARAAGAQSNwF-L9Ir_ADiGvYbwPhjWtZSBXAFEHaqn4jRtH-xwNx7rmwOAPdCo_xnOwkmTuk3KNqclohA6mA"
    })

    console.log("oauth2Client", oauth2Client)

    //création du transport du mail pret à partir (préparation)
    let transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: 'mrobert148@gmail.com',
            clientId: "408466553108-vl1luib4o6t198fgk6fut44bhtnb3q0d.apps.googleusercontent.com",
            clientSecret: "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",
            refreshToken: "1//04M-radEnV3QwCgYIARAAGAQSNwF-L9Ir_ADiGvYbwPhjWtZSBXAFEHaqn4jRtH-xwNx7rmwOAPdCo_xnOwkmTuk3KNqclohA6mA",
            accessToken: "ya29.a0AbVbY6PX07xpyLpbt-VZa13g5Jf3dIHGpaER_hLQickB0WPHDhPxgyp3nn5HTVsA4on6kJZaGGbrHWrzC7G01z6v7Bj3hU0YnDtCd_BlRdOcO5FtU4IoZS-zn8OA60p2jDHcNnMyvOLtEfErSJGvvbdvXJUpaCgYKAZQSARISFQFWKvPlSQSoKOXOEBLj8lcdixm0jw0163"
        }
    })

    //modèle du mail
    let mailOptions = {
        from: '"Commersaas" <blabla@gmail.com>', //sender address
        to: mailTo, //liste de ceux qui recoivent le mail
        subject: subject, // sujet du mail
        text: "", //on peut juste mettre un text dans le corps du mail
        html: `<h1>${title}</h1><p>${text}</p>` //corps html (contenu du mail) RECOMMANDE
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if(err){
            console.log("Ca rate, echec envoi email!")
            return console.log(err)
        }
        console.log(`Le mail a bien été envoyé à ${mailTo}!`, info)
    })
}
