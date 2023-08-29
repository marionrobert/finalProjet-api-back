module.exports = (_db)=>{
  db = _db
  return CommentModel
}

class CommentModel {

  // récupération de tous les commentaires
  static async getAllComments(){
    return db.query("SELECT * FROM comments")
    .then((res)=>{
      console.log("res de la requête sql getAllComments -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql getAllComments -->", err)
      return err
    })
  }

  // récupération de tous les commentaires en attente de validation par l'admin
  static async getAllWaitingComments(){
    return db.query("SELECT * FROM comments WHERE status=?", ["en attente de validation"])
    .then((res)=>{
      console.log("res de la requête sql getAllWaitingComments -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql getAllWaitingComments -->", err)
      return err
    })
  }

  // récupération d'un commentaire par son ID
  static async getOneCommentById(id){
    return db.query("SELECT * FROM comments WHERE id=?", [id])
    .then((res)=>{
      console.log("res de la requête sql getOneCommentById -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql getOneCommentById -->", err)
      return err
    })
  }

  //récupération d'un commentaire lié à une résa
  static async getOneCommentByBookingId(booking_id){
    return db.query("SELECT * FROM comments WHERE booking_id=?", [booking_id])
    .then((res)=>{
      console.log("res de la requête sql getOneCommentByBookingId -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql getOneCommentByBookingId -->", err)
      return err
    })
  }

  // récupération des commentaires liés à une activité qui ont été validés par l'admin
  static async getAllCommentsByActivityId(activity_id){
    return db.query("SELECT * FROM comments WHERE activity_id=? AND status=?", [activity_id, "validé"])
    .then((res)=>{
      console.log("res de la requête sql getAllCommentsByActivityId -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql getAllCommentsByActivityId -->", err)
      return err
    })
  }

  //récupération des commentaires qui ont une note élevée (page d'accueil)
  static async getAllHighScoreComments(){
    return db.query("SELECT * FROM comments WHERE score >= ? AND status=?", [4, "validé"])
    .then((res)=>{
      console.log("res de la requête sql getAllHighScoreComments -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql getAllHighScoreComments -->", err)
      return err
    })
  }

  // récupération des commentaires rédigés par un utilisateur
  static async getAllCommentsByAuthorId(author_id){
    return db.query("SELECT * FROM comments WHERE author_id=?", [author_id])
    .then((res)=>{
      console.log("res de la requête sql getAllCommentsByAuthorId -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql getAllCommentsByAuthorId -->", err)
      return err
    })
  }

  // création d'un commentaire
  static async saveOneComment(req){
    let sql = "INSERT INTO comments (title, content, author_id, activity_id, booking_id, creationTimestamp, score) VALUES (?,?,?,?,?,?,?)"
    return db.query(sql, [req.body.title, req.body.content, req.body.author_id, req.body.activity_id, req.body.booking_id, new Date(), req.body.score])
    .then((res)=>{
      console.log("res de la requête sql saveOneComment -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql saveOneComment -->", err)
      return err
    })
  }

  // mise à jour d'un commentaire
  static async updateOneComent(req, id){
    let sql = "UPDATE comments SET title=?, content=?, status=?, score=? WHERE id=?"
    return db.query(sql, [req.body.title, req.body.content, "en attente de validation", req.body.score, id])
    .then((res)=>{
      console.log("res de la requête sql updateOneComent -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql updateOneComent -->", err)
      return err
    })
  }

  // validation du commentaire par l'administration
  static async moderateComment(req, id){
    return db.query("UPDATE comments SET status=? WHERE id=?", [req.body.status, id])
    .then((res)=>{
      console.log("res de la requête sql validateComment -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql validateComment -->", err)
      return err
    })
  }

  // suppression d'un commentaire ?
  static async deleteOneComment(id){
    return db.query("DELETE FROM comments WHERE id=?", [id])
    .then((res)=>{
      console.log("res de la requête sql deleteOneComment -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de la requête sql deleteOneComment -->", err)
      return err
    })
  }
}
