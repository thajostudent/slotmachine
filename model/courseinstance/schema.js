const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const courseinstanceSchema = new Schema({
  year: { type: Number, required: true },
  semester: { type: String, required: true}
});


module.exports =  courseinstanceSchema;
