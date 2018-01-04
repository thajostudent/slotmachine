const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
  username: { type: String, required: true },
  exams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }],
  results: []
});

module.exports =  userSchema;

