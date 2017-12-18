const Facade = require('../../lib/facade');
const examSchema = require('./schema');
const meetingSchema = require('../meeting/schema');


class ExamFacade extends Facade {
  
    find(...args) {
    return this.model
      .find(...args)
      .populate('meetings')
      .exec();
  }
}

module.exports = new ExamFacade('Exam', examSchema);
