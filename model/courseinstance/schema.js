const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const courseinstanceSchema = new Schema({
  year: { type: Number, required: true },
  semester: { type: String, required: true},
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});


module.exports =  courseinstanceSchema;
