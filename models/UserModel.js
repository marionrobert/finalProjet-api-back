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
    // Générer un key_id unique
    let key_id = await this.generateUniqueKeyId();

    //hash du password
    return bcrypt.hash(req.body.password, saltRounds)
    .then((hashPassword)=>{
      //on génère un id personalisé
      let key_id = randomId(len, pattern);

      //requète sql
      let sql = "INSERT INTO users (email, password, firstName, lastName, phone, role, points, creationTimestamp, accountIsConfirmed, key_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      return db.query(sql, [req.body.email, hashPassword, req.body.firstName, req.body.lastName, req.body.phone, "user", 5, new Date(), "no", key_id])
      .then((res)=>{
        // console.log("res requête sql saveOneUser" + res)
        res.key_id = key_id;
        return res;
      })
      .catch((error)=>{
        console.log("erreur requête sql saveOneUser" + err)
        return error;
      })
    })
    .catch((err)=>{
      return err
    })
	}

  static async generateUniqueKeyId() {
    let key_id;
    let isUnique = false;

    while (!isUnique) {
        try {
            key_id = randomId(len, pattern);
            let user = await this.getOneUserByKeyId(key_id);

            if (!user.code && user.length > 0) {
                // key_id existe déjà, donc on génère un nouveau
                continue;
            }
            isUnique = true;
        } catch (error) {
            console.error("Erreur lors de la vérification de l'unicité du key_id:", error);
            // Sortir de la boucle et gérer l'erreur ici (peut-être générer une nouvelle erreur ou relancer la génération, selon le cas)
            throw new Error("Erreur lors de la vérification de l'unicité du key_id");
        }
    }

    return key_id;
  }


  // route de validation du compte
  static async validateAccount(key_id){
    let sql = "UPDATE users SET accountIsConfirmed = 'yes' WHERE key_id = ?"
    return db.query(sql, [key_id])
      .then((res)=>{
        // console.log("res requête sql validateAccount" + res)
        return res
      })
      .catch((err)=>{
        console.log("erreur requête sql validateAccount" + err)
        return err
      })
	}

  // route update key_id
  static async updateKeyId(email){
    let sql = "UPDATE users SET key_id = ? WHERE email = ?"
    let new_key_id = randomId(len, pattern)
    return db.query(sql, [new_key_id, email])
      .then((res)=>{
        // console.log("res requête sql updateKeyId" + res)
        return res
      })
      .catch((err)=>{
        console.log("erreur requête sql updateKeyId" + err)
        return err
      })
	}

  static async updatepassword(newPassword, key_id){
    //on hash le nouveau password
    return bcrypt.hash(newPassword, saltRounds)
    .then((hashPassword)=>{
      //requète sql
      let sql = "UPDATE users SET password = ? WHERE key_id = ?"
      return db.query(sql, [hashPassword, key_id])
      .then((res)=>{
        // console.log("res requête sql updatepassword" + res)
        return res
      })
      .catch((err)=>{
        console.log("erreur requête sql updatepassword" + err)
        return err
      })
    })
    .catch((error)=>{
      return error
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

  //récupération d'un utilisateur par son key_id
  static getOneUserByKeyId(key_id){
    return db.query("SELECT * FROM users WHERE key_id = ?", [key_id])
    .then((res)=>{
        return res
    })
    .catch((err)=>{
        return err
    })
  }

  //modification d'un utilisateur
  static updateUser(req, key_id){
    let sql = "UPDATE users SET firstName = ?, lastName = ?, phone = ? WHERE key_id = ?"
    return db.query(sql, [req.body.firstName, req.body.lastName, req.body.phone, key_id])
    .then((res)=>{
      return res
    })
    .catch((err)=>{
      console.log(err)
    })
  }

  // modification de la photo d'un utilisateur
  static async updateAvatar(avatar, key_id){
    return db.query("UPDATE users SET avatar = ? WHERE key_id = ?", [avatar, key_id])
    .then((res)=>{
      // console.log("res de requête sql updateAvatar -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de requête sql updateAvatar -->", err)
      return err
    })
  }

  // augmentation des points d'un utilisateur
  static async increasePoints(points, id){
    return db.query("UPDATE users SET points= points + ? WHERE id=?", [points, id])
    .then((res)=>{
      // console.log("res de requête sql increasePoints -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de requête sql increasePoints -->", err)
      return err
    })
  }

  // diminution des points d'un utilisateur
  static async decreasePoints(points, id){
    return db.query("UPDATE users SET points= points - ? WHERE id=?", [points, id])
    .then((res)=>{
      // console.log("res de requête sql decreasePoints -->", res)
      return res
    })
    .catch((err)=>{
      console.log("err de requête sql decreasePoints -->", err)
      return err
    })
  }

  // récupération d'un utilisateur par son id
  static async getOneUserById(id){
    // console.log("hello from getOneUserById")
    return db.query("SELECT * FROM users WHERE id = ?", [id])
    .then((res)=>{
        return res
    })
    .catch((err)=>{
        return err
    })
  }
}
