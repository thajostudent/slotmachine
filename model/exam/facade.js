const Facade = require('../../lib/facade');
const examSchema = require('./schema');

class ExamFacade extends Facade {
  find(...args) {
    return this.model
      .find(...args)
      .populate('meetings')
      .exec();
  }

  findOne(...args) {
    return this.model
      .findOne(...args)
      .populate('meetings')
      .exec();
  }
  
    remove(...args) {
    return this.model
      .remove(...args)
      .exec();
  }
}

module.exports = new ExamFacade('Exam', examSchema);
