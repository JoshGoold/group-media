const mongoose = require("mongoose")

const NotificationSchema = new mongoose.Schema({
    content: {type: String, required: true},
    subject: {type: String, required: true},
    createdAt: {type: Date, default: ()=> new Date(), immutable: true}
})

module.exports = mongoose.model("Notification", NotificationSchema);