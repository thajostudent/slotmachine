const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const examResultSchema = new Schema({
  users: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exams: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  isPassed: {type: Boolean, required: true}
});


module.exports =  examResultSchema;
