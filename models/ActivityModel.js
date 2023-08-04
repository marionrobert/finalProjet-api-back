module.exports = (_db)=>{
  db = _db
  return ActivityModel
}

class ActivityModel {

  //récupération de toutes les activités
  static async getAllActivities(){
    return db.query("SELECT * FROM activities")
    .then((res)=>{
      console.log("res de la requête sql getAllActivities -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql getAllActivities -->", err)
      return err
    })
  }


  //récupération de toutes les activités "en ligne"
  static async getAllOnlineActivities(){
    return db.query("SELECT * FROM activities WHERE statut=?", ["en ligne"])
    .then((res)=>{
      console.log("res de la requête sql getAllOnlineActivities -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql getAllOnlineActivities -->", err)
      return err
    })
  }


  //récupération de toutes les activités "en attente de validation"
  static async getAllWaitingActivities(){
    return db.query("SELECT * FROM activities WHERE statut=?", ["en attente de validation"])
    .then((res)=>{
      console.log("res de la requête sql getAllWaitingActivities -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql getAllWaitingActivities -->", err)
      return err
    })
  }

  //récupération de toutes les activités d'un user
  static async getAllActivitiesByAuthor(author_id){
    return db.query("SELECT * FROM activities WHERE author_id=?", [author_id])
    .then((res)=>{
      console.log("res de la requête sql getAllActivitiesByUser -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql getAllActivitiesByUser -->", err)
      return err
    })
  }

  //récupération d'une activité
  static async getOneActivity(id){
    return db.query("SELECT * FROM activities WHERE id=?", [id])
    .then((res)=>{
      console.log("res de la requête sql getOneActivity -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql getOneActivity -->", err)
      return err
    })
  }

  //création d'une activité
  static async saveOneActivity(req){
    let sql = "INSERT INTO `activities` (category_id`, `author_id`, `author_is_provider`, `title`, `description`, `address`, `zip`, `city`, `lat`, `lng`, `statut`, `duration`, `points`, `picture`,`creationTimestamps`, `updatingTimestamps`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?, Now(), Now())"
    return db.query(sql, [req.body.category_id, req.body.author_id, req.body.author_is_provider, req.body.title, req.body.description, req.body.address, req.body.zip, req.body.city, req.body.lat, req.body.lng, "en attente de validation", req.body.duration, req.body.points, req.body.picture])
    .then((res)=>{
      console.log("res de la requête sql saveOneActivity -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql saveOneActivity -->", err)
      return err
    })
  }

  //modification d'une activité
  static async updateOneActivity(req, id){
    let sql = "UPDATE activities SET title=?, description=?, address=?, zip=?, city=?, lat=?, lng=?, statut=?, duration=?, points=?, picture=?, updatingTimestamps=? WHERE id=?"
    return db.query(sql, [ req.body.title, req.body.description, req.body.address, req.body.zip, req.body.city, req.body.lat, req.body.lng, "en attente de validation", req.body.duration, req.body.points, req.body.picture, new Date(), id])
    .then((res)=>{
      console.log("res de la requête sql updateOneActivity -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql updateOneActivity -->", err)
      return err
    })
  }

  static async updateOnlineOfflineStatut(req, id){
    return db.query("UPDATE activities SET statut=? WHERE id=?", [req.body.statut, id])
    .then((res)=>{
      console.log("res de la requête sql updateOnlineOfflineStatut -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql updateOnlineOfflineStatut -->", err)
      return err
    })
  }

  static async validatePublicationForOneActivity(id){
    return db.queyr("UPDATE activites SET statut=? WHERE id=?", ["en ligne", id])
    .then((res)=>{
      console.log("res de la requête sql validatePublicationForOneActivity -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql validatePublicationForOneActivity -->", err)
      return err
    })
  }

  static async deleteOneActivity(id){
    return db.query("DELETE FROM activities WHERE id=?", [id])
    .then((res)=>{
      console.log("res de la requête sql deleteOneActivity -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql deleteOneActivity -->", err)
      return err
    })
  }

  static async getActivitiesByFilter(req){
    let condition = " WHERE statut='en ligne'"
    console.log("req dans getActivitiesByFilter -->", req)
    // FORMAT DE LA REQUETE SQl A OBTENIR
    // SELECT * FROM activities WHERE statut = 'en ligne' AND category_id IN (2, 3, 7, 9) AND points BETWEEN min_points AND max_points AND duration BETWEEN min_duration AND max_duration;

    //si l'utilisateur a choisi des catégories -- format d'un array contenant les id des catégories choisies
    if(req.body.categories){
      if (req.body.categories.length === 1) {
        condition += ` AND category_id = ${req.body.categories[0]}`;
      } else {
        condition += `AND category_id IN (${req.body.categories.join(', ')})`;
      }
    }

    // si l'utilisateur a choisi une fourchette pour les points -- req.body.points = {min_points: 1, max_points: 3}
    if(req.body.points){
      condition += ` AND points BETWEEN ${req.body.points.min_points} AND ${req.body.points.max_points}`
    }

    // si l'utilisateur a choisi une fourchette pour la durée --> req.body.duration = {min_duration: 3, max_duration: 4}
    if (req.body.duration){
      condition += ` AND duration BETWEEN ${req.body.duration.min_duration} AND ${req.body.duration.max_duration}`
    }

    let distance = req.body.distance || 50;


    //requête de récupération d'activités par rapport à la position de l'utilisateur et sur un rayon autour de lui
    let sql = "SELECT id, category_id, author_id, author_is_provider, title, description, address, zip, city, lat, lng, statut, duration, picture, points, creationTimestamps, updatingTimestamps,  st_distance(POINT(?,?), POINT( lat,lng))*100 AS distance FROM activities "+condition+" HAVING distance < ? ORDER BY distance";
    return db.query(sql, [parseFloat(req.body.lat), parseFloat(req.body.lng), distance])
      .then((res)=>{
        console.log("res de la requête sql getActivitiesByFilter -->", res)
        return res
      })
      .catch((err) => {
        console.log("err de la requête sql getActivitiesByFilter -->", err)
        return err
      })
  }
}
