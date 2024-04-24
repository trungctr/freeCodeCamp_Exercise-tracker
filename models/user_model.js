const mongoose = require('mongoose')// import moule mongoose
const Schema = mongoose.Schema;// khởi tạo biến khung dữ liệu


//configure schema
const User = new Schema({
	username: {type: String, default: '', required: true, },
})

module.exports = mongoose.model('User', User)
