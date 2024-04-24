const mongoose = require('mongoose')// import moule mongoose
const Schema = mongoose.Schema;// khởi tạo biến khung dữ liệu


//configure schema
const exercises = new Schema({
    userId: String,
    description: String,
    duration: Number,
    date: Number
})

module.exports = mongoose.model('exercises', exercises)
