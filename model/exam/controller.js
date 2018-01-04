const moment = require('moment');
const axios = require('axios');

const Controller = require('../../lib/controller');
const examFacade = require('./facade');
const meetingFacade = require('../meeting/facade');
const {
  createExamToObject,
  getSemester
} = require('../../lib/tools');


class ExamController extends Controller {
  bookExam(req, res, next) {
    return this.facade.findOne({
      course: req.body.channel_name + getSemester()
    }).then((doc) => {
      if (!doc) {
        return res.send({
          text: 'Sorry, no exams found for this course.'
        });
      }

      return res.send({
        text: `Meetings for exam ${doc.name}:`,
        attachments: doc.meetings.map((meeting, index) => (
          {
            title: `Meeting ${index + 1}:`,
            title_link: 'https://www.google.com',
            text: `${moment(meeting.startTime).format('HH:mm')} - ${moment(meeting.endTime).format('HH:mm')}`,
            callback_id: "bookExam",
            actions: [
                {
                    "name": "book",
                    "text": "Book",
                    "type": "button",
                    "style": "primary",
                    "value": "test",
                    "confirm": {
                        "title": "Are you sure?",
                        "ok_text": "Yes",
                        "dismiss_text": "No"
                    }
                }
            ]
          }
        ))
      });
    })
    .catch((err) => {
      console.error(err);
      res.send({ text: 'Sorry, something went wrong.' });
    });
  }

  createExam(req, res, next) {
    // INSERT TOKEN HERE!!!!
    const token = '';
    const trigger = req.body.trigger_id;
    const data = {
      callback_id: '12345',
      title: 'Create exam',
      elements: [
        {
          type: 'text',
          label: 'Exam name',
          name: 'examName',
          placeholder: 'Exam name'
        },
        {
          type: 'text',
          label: 'Exam date',
          name: 'examDate',
          placeholder: 'Please enter date in the format DD/MM'
        },
        {
          type: 'text',
          label: 'No. of meetings/length',
          name: 'meetings',
          placeholder: 'No. of meetings/length in hours separated by a slash, e.g. 8/1'
        },
        {
          type: 'text',
          label: 'First meeting',
          name: 'firstMeeting',
          placeholder: 'First meeting time, e.g. 8.00'
        },
        {
          type: 'text',
          label: 'Lunch break',
          name: 'lunchBreak',
          placeholder: 'Two times separated by a dash, e.g. 12.00-13.00',
          optional: true
        }
      ]
    };

    axios({
      url: `https://www.slack.com/api/dialog.open?token=${token}&trigger_id=${trigger}`,
      data: `dialog=${encodeURIComponent(JSON.stringify(data))}`,
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .then(resp => {
      console.log(resp.data);
      res.send();
    })
    .catch(err => res.send('Sorry, something went wrong.'));
  }

  saveExam(req, res, next) {
    const {
      examName,
      examDate,
      meetings,
      firstMeeting,
      lunchBreak
    } = JSON.parse(req.body.payload).submission;
    const errors = [];
    let lunchBreakStart = null;
    let lunchBreakEnd = null;

    if (lunchBreak) {
      lunchBreakStart = moment(lunchBreak.split('-')[0], 'HH.mm');
      lunchBreakEnd = moment(lunchBreak.split('-')[1], 'HH.mm');
    }

    // Meeting string error validation
    let meetingError = false;
    const meetingSplit = meetings.split('/');
    if (meetingSplit.length !== 2) {
      meetingError = true;
    } else {
      const numMeetings = parseInt(meetingSplit[0], 10);
      const meetingLength = parseInt(meetingSplit[1], 10);

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
    return res.send();
  }

  registerExam(req, res, next) {
    // /createExam Exam-1 31/12 noOfMeetings Length
    
    // /createexam Exam1 25/11 8 1
    // one day exam, max 8 1 hour meetings
    this.facade.remove({}, function(err) { 
   console.log('collection removed') 
    });
    const bodyObj = createExamToObject(req.body.text);

    // Create the exam
    this.facade.create({
      course: req.body.channel_name + bodyObj.semester,
      name: bodyObj.name,
      attempt: 1
    }).then((doc) => {
      const meetingPromises = [];

      // Create a meeting for each meeting, time needs fixing...
      for (let i = 0; i < bodyObj.meetings; i += 1) {
        var date = new Date();
        date = bodyObj.date.setHours(bodyObj.date.getHours() + 1)
        meetingPromises.push(meetingFacade.create({
          startTime: date,
          endTime: date
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
  
  create(req, res, next){
    console.log(req.body.text);
  }
}

module.exports = new ExamController(examFacade);
