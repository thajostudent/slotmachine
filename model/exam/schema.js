const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const examSchema = new Schema({
  course: { type: String, required: true },
  name: { type: String },
  attempt: { type: Number },
  meetings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' }]

});


module.exports =  examSchema;
