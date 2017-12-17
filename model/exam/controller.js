const Controller = require('../../lib/controller');
const examFacade = require('./facade');
const meetingFacade = require('../meeting/facade');
const {
  createExamToObject
} = require('../../lib/tools');


class ExamController extends Controller {
  registerExam(req, res, next) {
    // /createexam Exam1 25/11 noOfMeetings Length
    // /createexam Exam1 25/11 8 1
    // one day exam, max 8 1 hour meetings

    const bodyObj = createExamToObject(req.body.text);

    // Create the exam
    examFacade.create({
      course: req.body.channel_name + bodyObj.semester,
      name: bodyObj.name,
      attempt: 1
    }).then((doc) => {
      const meetingPromises = [];

      // Create a meeting for each meeting, time needs fixing...
      for (let i = 0; i < bodyObj.meetings; i += 1) {
        meetingPromises.push(meetingFacade.create({
          startTime: bodyObj.date,
          endTime: bodyObj.date
        }));
      }
      Promise.all(meetingPromises).then((docs) => {
        // Add meetings to exam and save
        doc.meetings = docs;
        // doc.meetings.push(docs[0]._id)
        doc.save();
        // Respond to teacher
        res.send({
          text: `Exam - ${bodyObj.name} created with ${bodyObj.meetings} meetings`
        });
      });
    });
  }
}

module.exports = new ExamController(examFacade);
