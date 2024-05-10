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
        refresh_token: "1//04AIL6JwZAongCgYIARAAGAQSNwF-L9IrQg0sDq61lH3P_oeZzfO7AfKt1mKIJ9p-X6yydTjNeO9g1Mz7p3VPNn7vdbAB3fAW4Qo"
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
            refreshToken: "1//04AIL6JwZAongCgYIARAAGAQSNwF-L9IrQg0sDq61lH3P_oeZzfO7AfKt1mKIJ9p-X6yydTjNeO9g1Mz7p3VPNn7vdbAB3fAW4Qo",
            accessToken: "ya29.a0AfB_byBSfWYft2DtYwdqdbKdSVf1X-pUayYfuaf1Z59M3BqKUxRVhAPHVelNhutH2su63JHuMZbfxeIUEouoTArNEo5JSC_oPJxAzr5t99gxQkKKFEWiIEDLnAxWhqGcJKT7XFizMdO5fy26rV9omyplvCOU09EsjrIQaCgYKARcSARMSFQHGX2MimVC5xGmtCSFfN6jiNEjB6g0171"
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
