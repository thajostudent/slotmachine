const moment = require('moment');
const getSemester = require('../../lib/tools').getSemester;
const Controller = require('../../lib/controller');
const ExamFacade = require('../exam/facade');
const MeetingFacade = require('../meeting/facade');

class InteractivecompController extends Controller {
  saveExam(req, res, next) {
    const {
      submission: {
        examName,
        examDate,
        meetings,
        firstMeeting,
        lunchBreak
      },
      channel: {
        name
      }
    } = JSON.parse(req.body.payload);
    const errors = [];
    let lunchBreakStart = null;
    let lunchBreakEnd = null;

    if (lunchBreak) {
      lunchBreakStart = moment(lunchBreak.split('-')[0], 'HH.mm');
      lunchBreakEnd = moment(lunchBreak.split('-')[1], 'HH.mm');
    }

    // Meeting string error validation
    let meetingError = false;
    let numMeetings = 0;
    let meetingLength = 0;

    const meetingSplit = meetings.split('/');
    if (meetingSplit.length !== 2) {
      meetingError = true;
    } else {
      numMeetings = parseInt(meetingSplit[0], 10);
      meetingLength = parseInt(meetingSplit[1], 10);

      if (isNaN(numMeetings) || isNaN(meetingLength)) {
        meetingError = true;
      }
    }

    if (meetingError) {
      errors.push({
        name: 'meetings',
        error: 'Please enter no. of meetings/length in the format 8/1'
      });
    }

    if (!moment(examDate, 'DD/MM').isValid()) {
      errors.push({
        name: 'examDate',
        error: 'Please enter a valid date in DD/MM format.'
      });
    }

    if (!moment(firstMeeting, 'HH.mm').isValid()) {
      errors.push({
        name: 'firstMeeting',
        error: 'Please enter a valid time in HH.mm format.'
      });
    }

    if (lunchBreak && (!lunchBreakStart.isValid() || !lunchBreakEnd.isValid())) {
      errors.push({
        name: 'lunchBreak',
        error: 'Please enter valid times in HH:mm format separated by -'
      });
    } else if (lunchBreak && lunchBreakStart > lunchBreakEnd) {
      errors.push({
        name: 'lunchBreak',
        error: 'Lunch break cannot end before it begins.'
      });
    }

    if (errors.length !== 0) {
      return res.json({ errors });
    }

    ExamFacade.create({
      course: name + getSemester(),
      name: examName,
      attempt: 1
    }).then((doc) => {
      const meetingPromises = [];

      const firstMeetingMoment = moment(examDate, 'DD/MM');
      firstMeetingMoment.hour(moment(firstMeeting, 'HH.mm').hour());
      firstMeetingMoment.minute(moment(firstMeeting, 'HH.mm').minute());

      // Create a meeting for each meeting
      for (let i = 0; i < numMeetings; i += meetingLength) {
        const startTime = moment(firstMeetingMoment);
        startTime.add(i, 'hour');
        const endTime = moment(startTime);
        endTime.add(meetingLength, 'hour');
        meetingPromises.push(MeetingFacade.create({
          startTime,
          endTime
        }));
      }
      Promise.all(meetingPromises).then((docs) => {
        // Add meetings to exam and save
        doc.meetings = docs;
        // doc.meetings.push(docs[0]._id)
        doc.save();
        // Respond to teacher
        return res.send();

        // respond using slack API: text: `Exam - ${examName} created with ${numMeetings} meetings`
      });
    })
    .catch((err) => {
      console.log(err);
      return res.json({ error: 'Sorry, something went wrong.' });
    });
  }

  payload(req, res, next) {
    switch (JSON.parse(req.body.payload).callback_id) {
      case 'createExam':
        return this.saveExam(req, res, next);
      default:
        break;
    }

    return res.send();
  }
}

module.exports = new InteractivecompController();
