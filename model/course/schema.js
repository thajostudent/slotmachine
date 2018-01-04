const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const courseSchema = new Schema({
  title: { type: String, required: true },
  courseinstances: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' }]
});


module.exports =  courseSchema;
