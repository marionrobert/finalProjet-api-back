const withAuth = require("../withAuth")

module.exports = (app, db)=>{
  const activityModel = require("../models/ActivityModel")(db)
  const bookingModel = require("../models/BookingModel")(db)
}
