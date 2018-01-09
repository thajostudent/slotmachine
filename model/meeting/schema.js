const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const meetingSchema = new Schema({
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});


module.exports =  meetingSchema;
// module.exports = mongoose.model('Meeting', meetingSchema);
