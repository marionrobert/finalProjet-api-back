module.exports = (_db)=>{
  db = _db
  return BookingModel
}

class BookingModel {

  // récupération de toutes les réservations
  static async getAllBookings(){
    return db.query("SELECT * FROM bookings")
    .then((res)=>{
      console.log("res de la requête sql getAllBookings -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql getAllBookings -->", err)
      return err
    })
  }

  // récupération de toutes les réservations concernant les annonces d'un utilisateur
  static async getAllBookingsByAuthorId(author_id){
    let sql = "SELECT * FROM bookings JOIN activities ON bookings.activity_id = activities.id WHERE activities.author_id=?"
    return db.query(sql, [author_id])
    .then((res)=>{
      console.log("res de la requête sql getAllBookingsByAuthorId -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql getAllBookingsByAuthorId -->", err)
      return err
    })

  }

  //récupération de toutes les réservations effectuées par un utilisateur (booker_id)
  static async getAllBookingsByBookerId(booker_id){
    return db.query("SELECT * FROM bookings WHERE booker_id=?", [booker_id])
    .then((res)=>{
      console.log("res de la requête sql getAllBookingsByBookerId -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql getAllBookingsByBookerId -->", err)
      return err
    })
  }

  //récupération d'une réservation par son id (infos de la réservation et de l'activité associée)
  static async getOneBooking(id){
    let sql = "SELECT b.id AS booking_id, b.booker_id, b.activity_id, b.points, b.provider_id, b.beneficiary_id, b.status AS booking_status, b.providerValidation, b.beneficiaryValidation, a.category_id AS activity_category_id, a.author_id  AS activity_author_id, a.authorIsProvider  AS activity_authorIsProvider, a.title AS activity_title, a.description AS activity_description, a.address AS activity_address, a.zip AS activity_zip, a.city AS activity_city, a.lat AS activity_lat, a.lng AS activity_lng, a.duration AS activity_duration, a.urlPicture AS activity_urlPicture FROM bookings AS b JOIN activities AS a ON b.activity_id = a.id WHERE b.id= ?"
    return db.query(sql, [id])
    .then((res)=>{
      console.log("res de la requête sql getOneBooking -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql getOneBooking -->", err)
      return err
    })
  }

  //création d'une réservation
  static async saveOneBooking(req){
    let sql = "INSERT INTO bookings (booker_id, activity_id, points, provider_id, beneficiary_id) VALUES (?,?,?,?,?)"
    return db.query(sql, [req.body.booker_id, req.body.activity_id, req.body.points, req.body.provider_id, req.body.beneficiary_id])
    .then((res)=>{
      console.log("res de la requête sql saveOneBooking -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql saveOneBooking -->", err)
      return err
    })
  }

  //modification du statut d'une réservation
  static async updateStatus(req, id){
    return db.query("UPDATE bookings SET status=? WHERE id=?", [req.body.status, id])
    .then((res)=>{
      console.log("res de la requête sql updateStatus -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql updateStatus -->", err)
      return err
    })
  }

  //validation de la réalisation de l'activité par le provider
  static async validateAchievementByProvider(id){
    return db.query("UPDATE bookings SET providerValidation=? WHERE id=?", [true, id])
    .then((res)=>{
      console.log("res de la requête sql validateAchievementByProvider -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql validateAchievementByProvider -->", err)
      return err
    })
  }

  //validation de la réalisation de l'activité par le bénéficiaire
  static async validateAchievementByBeneficiaryProvider(id){
    return db.query("UPDATE bookings SET beneficiaryValidation=? WHERE id=?", [true, id])
    .then((res)=>{
      console.log("res de la requête sql validateAchievementByBeneficiary -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql validateAchievementByBeneficiary -->", err)
      return err
    })
  }

  // suppression d'une résa : cas où elle n'est pas acceptée
  static async deleteOneBooking(id){
    return db.query("DELETE FROM bookings WHERE id=?", [id])
    .then((res)=>{
      console.log("res de la requête sql deleteOneBooking -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql deleteOneBooking -->", err)
      return err
    })
  }

}
