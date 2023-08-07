const bcrypt = require('bcrypt')
const saltRounds = 10
let randomId = require("random-id")
let len = 30;
let pattern = "aA0"

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
      //on génère un id personalisé
      let key_id = randomId(len, pattern)

      //requète sql
      let sql = "INSERT INTO users (email, password, firstName, lastName, phone, role, points, creationTimestamp, accountIsConfirmed, key_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      return db.query(sql, [req.body.email, hashPassword, req.body.firstName, req.body.lastName, req.body.phone, "user", 0, new Date(), "no", key_id])
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

  //récupération d'un utilisateur par son id
  static getOneUser(id){
    return db.query("SELECT * FROM users WHERE id = ?", [id])
    .then((res)=>{
        return res
    })
    .catch((err)=>{
        return err
    })
  }

  //modification d'un utilisateur
  static updateUser(req, userId){
    let sql = "UPDATE users SET firstName = ?, lastName = ?, address = ?, zip = ?, city = ?, phone = ? WHERE id = ?"
    return db.query(sql, [req.body.firstName, req.body.lastName, req.body.address, req.body.zip, req.body.city, req.body.phone, userId])
    .then((res)=>{
      return res
    })
    .catch((err)=>{
      console.log(err)
    })
  }


}
