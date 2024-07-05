module.exports = (_db)=>{
  db = _db
  return ActivityModel
}

class ActivityModel {

  //récupération de toutes les activités
  static async getAllActivities(){
    return db.query("SELECT * FROM activities")
    .then((res)=>{
      // console.log("res de la requête sql getAllActivities -->", res)
      return res
    })
    .catch((err)=>{
      // console.log("err de la requête sql getAllActivities -->", err)
      return err
    })
  }

  //récupération de toutes les activités "en ligne"
  static async getAllOnlineActivities(){
    return db.query("SELECT * FROM activities WHERE status=? ORDER BY updatingTimestamps DESC", ["online"])
    .then((res)=>{
      // console.log("res de la requête sql getAllOnlineActivities -->", res)
      return res
    })
    .catch((err)=>{
      // console.log("err de la requête sql getAllOnlineActivities -->", err)
      return err
    })
  }

  //récupération de toutes les activités "en attente de validation"
  static async getAllWaitingActivities(){
    return db.query("SELECT * FROM activities WHERE status=?", ["waiting_for_validation"])
    .then((res)=>{
      // console.log("res de la requête sql getAllWaitingActivities -->", res)
      return res
    })
    .catch((err)=>{
      // console.log("err de la requête sql getAllWaitingActivities -->", err)
      return err
    })
  }

  //récupération de toutes les activités d'un user/author
  static async getAllActivitiesByAuthor(author_id){
    return db.query("SELECT * FROM activities WHERE author_id=?", [author_id])
    .then((res)=>{
      // console.log("res de la requête sql getAllActivitiesByUser -->", res)
      return res
    })
    .catch((err)=>{
      // console.log("err de la requête sql getAllActivitiesByUser -->", err)
      return err
    })
  }

  // récupérattion de toutes les activités selon  le statut de l'auteur de l'activité (author_is_provider: true/false)
  static async getAllActivitiesByAuthorIsProvider(req){
    return db.query("SELECT * FROM activities WHERE authorIsProvider=?", [req.body.authorIsProvider])
    .then((res)=>{
      // console.log("res de la requête sql getAllActivitiesByAuthorIsProvider -->", res)
      return res
    })
    .catch((err)=>{
      // console.log("err de la requête sql getAllActivitiesByAuthorIsProvider -->", err)
      return err
    })
  }

  //récupération d'une activité
  static async getOneActivity(id){
    return db.query("SELECT * FROM activities WHERE id=?", [id])
    .then((res)=>{
      // console.log("res de la requête sql getOneActivity -->", res)
      return res
    })
    .catch((err)=>{
      // console.log("err de la requête sql getOneActivity -->", err)
      return err
    })
  }

  //création d'une activité
  static async saveOneActivity(req){
    let sql = "INSERT INTO activities (category_id, author_id, authorIsProvider, title, description, address, zip, city, lat, lng, status, duration, points, urlPicture, creationTimestamps, updatingTimestamps) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?, ?, Now(), Now())"
    return db.query(sql, [req.body.category_id, req.body.author_id, req.body.authorIsProvider, req.body.title, req.body.description, req.body.address, req.body.zip, req.body.city, req.body.lat, req.body.lng, "waiting_for_validation", req.body.duration, req.body.points, req.body.urlPicture])
    .then((res)=>{
      // console.log("res de la requête sql saveOneActivity -->", res)
      return res
    })
    .catch((err)=>{
      // console.log("err de la requête sql saveOneActivity -->", err)
      return err
    })
  }

  //modification d'une activité
  static async updateOneActivity(req, id){
    let sql = "UPDATE activities SET category_id=?, authorIsProvider=?, title=?, description=?, address=?, zip=?, city=?, lat=?, lng=?, status=?, duration=?, points=?, urlPicture=?, updatingTimestamps=? WHERE id=?"
    return db.query(sql, [req.body.category_id, req.body.authorIsProvider, req.body.title, req.body.description, req.body.address, req.body.zip, req.body.city, req.body.lat, req.body.lng, "waiting_for_validation", req.body.duration, req.body.points, req.body.urlPicture, new Date(), id])
    .then((res)=>{
      // console.log("res de la requête sql updateOneActivity -->", res)
      return res
    })
    .catch((err)=>{
      // console.log("err de la requête sql updateOneActivity -->", err)
      return err
    })
  }

  // mise à jour du statut d'une activité
  static async updateOnlineOfflineStatus(req, id){
    return db.query("UPDATE activities SET status=? WHERE id=?", [req.body.status, id])
    .then((res)=>{
      // console.log("res de la requête sql updateOnlineOfflineStatus -->", res)
      return res
    })
    .catch((err)=>{
      // console.log("err de la requête sql updateOnlineOfflineStatus -->", err)
      return err
    })
  }

  // validation d'une activité par l'administration (rôle modérateur)
  static async moderateOneActivity(req, id){
    return db.query("UPDATE activities SET status=? WHERE id=?", [req.body.status, id])
    .then((res)=>{
      // console.log("res de la requête sql moderateOneActivity -->", res)
      return res
    })
    .catch((err)=>{
      // console.log("err de la requête sql moderateOneActivity -->", err)
      return err
    })
  }

  // suppression d'une activité par son auteur
  static async deleteOneActivity(id){
    return db.query("DELETE FROM activities WHERE id=?", [id])
    .then((res)=>{
      // console.log("res de la requête sql deleteOneActivity -->", res)
      return res
    })
    .catch((err)=>{
      // console.log("err de la requête sql deleteOneActivity -->", err)
      return err
    })
  }

  // filter les activités
  static async getActivitiesByFilter(req){
    let condition = " WHERE status='online'"
    // FORMAT DE LA REQUETE SQl A OBTENIR : SELECT * FROM activities WHERE status = 'online' AND authorIsProvider = true/false AND category_id IN (2, 3, 7, 9) AND points BETWEEN min_points AND max_points AND duration BETWEEN min_duration AND max_duration;

    //si l'utilisateur a choisi des catégories -- format d'un array contenant les id des catégories choisies
    if(req.body.categories.length > 0){
      if (req.body.categories.length === 1) {
        condition += ` AND category_id = ${req.body.categories[0]}`;
      } else {
        condition += ` AND category_id IN (${req.body.categories.join(', ')})`;
      }
    }

    // si l'utilisateur a choisi s'il recherche des activités pour recevoir ou donner un coup de main
    if (req.body.authorIsProvider){
      condition += ` AND authorIsProvider = ${req.body.authorIsProvider}`
    }

    // si l'utilisateur a choisi une fourchette pour les points -- req.body.points = {min_points: 1, max_points: 3}
    // if(req.body.points){
    //   condition += ` AND points BETWEEN ${req.body.points.min_points} AND ${req.body.points.max_points}`
    // }

    // si l'utilisateur a choisi une fourchette pour la durée --> req.body.duration = {min_duration: 3, max_duration: 4}
    if (req.body.duration){
      condition += ` AND duration BETWEEN ${req.body.duration.min_duration} AND ${req.body.duration.max_duration}`
    }

    if (req.body.distance && req.body.lat && req.body.lng){
      let distance = req.body.distance || 50;

      //requête de récupération d'activités par rapport aux filtres sélectionnés et à la position de l'utilisateur et sur un rayon autour de lui
      let sql = "SELECT id, category_id, author_id, authorIsProvider, title, description, address, zip, city, lat, lng, status, duration, urlPicture, points, creationTimestamps, updatingTimestamps,  st_distance(POINT(?,?), POINT( lat,lng))*100 AS distance FROM activities "+condition+" HAVING distance < ? ORDER BY distance";
      return db.query(sql, [parseFloat(req.body.lat), parseFloat(req.body.lng), distance])
        .then((res)=>{
          // console.log("res de la requête sql getActivitiesByFilter -->", res)
          return res
        })
        .catch((err) => {
          // console.log("err de la requête sql getActivitiesByFilter -->", err)
          return err
        })
    } else {
      // Requête SQL sans la condition de distance
      let sql = "SELECT id, category_id, author_id, authorIsProvider, title, description, address, zip, city, lat, lng, status, duration, urlPicture, points, creationTimestamps, updatingTimestamps FROM activities "+condition;
      return db.query(sql)
        .then((res)=>{
          // console.log("res de la requête sql getActivitiesByFilter without distance -->", res)
          return res
        })
        .catch((err) => {
          // console.log("err de la requête sql getActivitiesByFilter without distance -->", err)
          return err
        });
    }
  }

  // mise à jour de la catégorie des activités
  static async updateActivitiesCategory(old_category_id, new_category_id){
    return db.query("UPDATE activities SET category_id = ? WHERE category_id = ?", [new_category_id, old_category_id])
    .then((res)=>{
      // console.log("res de la requête sql updateCategory -->", res)
      return res
    })
    .catch((err)=>{
      // console.log("err de la requête sql updateCategory -->", err)
      return err
    })
  }

  //mise à jour de la photo
  static async updatePicture(picture, id){
    return db.query("UPDATE activities SET urlPicture = ?, status=? WHERE id = ?", [picture, "waiting_for_validation", id])
    .then((res)=>{
      // console.log("res de requête sql updatePicture -->", res)
      return res
    })
    .catch((err)=>{
      // console.log("err de requête sql updatePicture -->", err)
      return err
    })
  }
}
