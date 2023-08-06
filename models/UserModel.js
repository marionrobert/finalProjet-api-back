const bcrypt = require('bcrypt')
const saltRounds = 10

module.exports = (_db)=>{
    db=_db
    return UserModel
}

class UserModel {

  //sauvegarde d'un utilisateur
  static async saveOneUser(req){
    // console.log(req.body)
    //on hash le password
    return bcrypt.hash(req.body.password, saltRounds)
    .then((hashPassword)=>{
      //requète sql
      let sql = "INSERT INTO users (email, password, firstName, lastName, phone, role, points, creationTimestamp, accountIsConfirmed) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)"
      return db.query(sql, [req.body.email, hashPassword, req.body.firstName, req.body.lastName, req.body.phone, "user", 0, new Date(), "no"])
      .then((res)=>{
        console.log("res requête sql saveOneUser" + res)
        res.key_id = key_id
        return res
      })
      .catch((err)=>{
        console.log("erreur requête sql saveOneUser" + err)
        return err
      })
    })
    .catch((err)=>{
      return err
    })
	}

  //récupération d'un utilisateur en fonction de son mail
  static getUserByEmail(email){
    return db.query("SELECT * FROM users WHERE email = ?", [email])
    .then((res)=>{
        return res
    })
    .catch((err)=>{
        return err
    })
  }

  static updateConnexion(id){
    return db.query("UPDATE users SET connexionTimestamp = NOW() WHERE id = ?", [id])
    .then((res)=>{
        return res
    })
    .catch((err)=>{
        return err
    })

}
}


// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZ21haWwuY29tIiwiaWQiOjYsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjkxMzIxMjgwfQ.jfSbUBAEpq0eAbkih6SijGkN_DKQ9rewEnIYiL3wENY"
