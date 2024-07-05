module.exports = (_db)=>{
  db = _db
  return CategoryModel
}

class CategoryModel {

  // récupération de toutes les catégories
  static async getAllCategories(){
    return db.query("SELECT * FROM categories")
    .then((res)=>{
      // console.log("res de la requête sql getAllCategories -->", res)
      return res
    })
    .catch((err)=>{
      // console.log("err de la requête sql getAllCategories -->", err)
      return err
    })
  }

  // récupération d'une catégorie
  static async getOneCategory(id){
    return db.query("SELECT * FROM categories WHERE id=?", [id])
    .then((res)=>{
      // console.log("res de la requête sql getOneCategory -->", res)
      return res
    })
    .catch((err)=>{
      // console.log("err de la requête sql getOneCategory -->", err)
      return err
    })
  }

  // récupérer d'une catégorie par son titre
  static async getOneCategoryByTitle(title){
    return db.query("SELECT * FROM categories WHERE title=?", [title])
    .then((res)=>{
      // console.log("res de la requête sql getOneCategoryByTitle -->", res)
      return res
    })
    .catch((err)=>{
      // console.log("err de la requête sql getOneCategoryByTitle -->", err)
      return err
    })
  }


  //création d'une catégorie
  static async saveOneCategory(req){
    return db.query("INSERT INTO categories (title) VALUES (?)", [req.body.title])
    .then((res)=>{
      // console.log("res de la requête sql saveOneCategory -->", res)
      return res
    })
    .catch((err)=>{
      // console.log("err de la requête sql saveOneCategory -->", err)
      return err
    })
  }

  // mise à jour d'une catégorie
  static async updateOneCategory(req, id){
    return db.query("UPDATE categories SET title=? WHERE id=?", [req.body.title, id])
    .then((res)=>{
      // console.log("res de la requête sql updateOneCategory -->", res)
      return res
    })
    .catch((err)=>{
      // console.log("err de la requête sql updateOneCategory -->", err)
      return err
    })
  }

  // suppression d'une catégorie
  static async deleteOneCategory(id){
    return db.query("DELETE FROM categories WHERE id=?", [id])
    .then((res)=>{
      // console.log("res de la requête sql deleteOneCategory -->", res)
      return res
    })
    .catch((err)=>{
      // console.log("err de la requête sql deleteOneCategory -->", err)
      return err
    })
  }
}
