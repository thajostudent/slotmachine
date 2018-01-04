const Controller = require('../../lib/controller');
const examResultFacade = require('./facade');

class ExamResultController extends Controller {}

module.exports = new ExamResultController(examResultFacade);
