const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const courseSchema = new Schema({
  title: { type: String, required: true, unique: true },
  channelid: {type: String, required: true, unique: true},
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports =  courseSchema;