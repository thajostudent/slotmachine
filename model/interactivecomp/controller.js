const moment = require('moment');
const axios = require('axios');
const getSemester = require('../../lib/tools').getSemester;
const Controller = require('../../lib/controller');
const ExamFacade = require('../exam/facade');
const MeetingFacade = require('../meeting/facade');
const UserFacade = require('../user/facade');

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
      },
      user: {
        id
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
      for (let i = 0; i < numMeetings; i += 1) {
        const startTime = moment(firstMeetingMoment);
        startTime.add(i * meetingLength, 'hour');

        if (lunchBreak && startTime.hour() === lunchBreakStart.hour()) {
          startTime.hour(lunchBreakEnd.hour());
          startTime.minute(lunchBreakEnd.minute());
          numMeetings += 1;
          i += 1;
        }

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

        axios({
          method: 'post',
          url: 'https://slack.com/api/chat.postEphemeral',
          headers: {
            Authorization: `Bearer ${process.env.SLACK_API_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: `user=${id}&text=Exam - ${examName} created with ${numMeetings} meetings&channel=${name}`
        })
        .catch(err => console.log(err));

        return res.send();

        // respond using slack API: text: `Exam - ${examName} created with ${numMeetings} meetings`
      });
    })
    .catch((err) => {
      console.log(err);
      return res.json({ error: 'Sorry, something went wrong.' });
    });
  }

  async removeBooking(req, res, next) {

    const payload = JSON.parse(req.body.payload);
    const buttonValue = JSON.parse(payload.actions[0].value);
    const meetingId = buttonValue.meetingId;
    console.log(meetingId);
    if (meetingId) {
      MeetingFacade.update(
        { _id: meetingId },
        { $unset: { student: '' } }
      );

      return res.send('Your booking is now removed!');


    }


    return res.send('Oops, something went wrong');


  }

  async bookExam(req, res, next) {

    const payload = JSON.parse(req.body.payload);
    const buttonValue = JSON.parse(payload.actions[0].value);

    const slackUserId = payload.user.id;
    const username = payload.user.name;
    const meetingId = buttonValue.meetingId;
    const examId = buttonValue.examId;

    // Check if user exists
    const user = await UserFacade.findOne({ username });
    if (!user) {
      return res.send('Sorry, you don\'t seem to exist in the database.');
    }

    // Check if exam is already booked
    const exam = await ExamFacade.findOne({ _id: examId });
    let responseMessage;
    exam.meetings.forEach((meeting) => {
      if (meeting.student && meeting.student.equals(user._id)) {
        responseMessage = 'Exam already booked';
      }
    });

    if (responseMessage) return res.send(responseMessage);

    // Check if tests are OK
    const testsPassed = await ExamFacade.findById(examId).then((exam) => {
      let passed = false;
      exam.results.forEach((passedUserId) => {
        if (passedUserId.equals(user._id)) {
          passed = true;
        }
      });
      return passed;
    }) || false;

    if (!testsPassed) {
      return res.send('Your tests have not passed. Please fix your code before booking.');
    }

    const meeting = await MeetingFacade.findById(meetingId);
    const response = `Your exam meeting is on ${moment(meeting.startTime).format('MMMM Do YYYY, HH:mm')} - ${moment(meeting.endTime).format('HH:mm')}`;

    // Book exam on choosen meeting time
    MeetingFacade.update(
      { _id: meetingId },
      { $addToSet: { student: user._id } },
      { upsert: true }
    );

    axios({
      method: 'post',
      url: 'https://slack.com/api/chat.postMessage',
      headers: {
        Authorization: `Bearer ${process.env.SLACK_API_TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: `as_user=false&username=slotmachine&channel=${slackUserId}&text=${response}`
    });

    return res.send();
  }

  async listExams(req, res, next) {

    const payload = JSON.parse(req.body.payload);
    const action = JSON.parse(req.body.payload).actions[0].name;
    const courseName = JSON.parse(payload.actions[0].value).courseName;
    const examId = JSON.parse(payload.actions[0].value).examId;
    // let userIsAdmin = false;

    try {
      const response = await axios({
        method: 'post',
        url: 'https://slack.com/api/users.info',
        headers: {
          Authorization: `Bearer ${process.env.SLACK_API_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: `user=${payload.user.id}`
      });

      if (response.data.user.is_admin) {
        // userIsAdmin = true;
      }
    } catch (e) {
      console.log(e);
      return res.send('Sorry, something went wrong.');
    }

    switch (action) {
      case 'showExam':
        ExamFacade.findOne({ _id: examId })
          .then(doc => (
             res.send({
               text: `Meetings for exam ${doc.name}:`,
               attachments: doc.meetings.map((meeting, index) => (
                 {
                   title: `Meeting ${index + 1}:`,
                   title_link: 'https://www.google.com',
                   text: `${moment(meeting.startTime).format('HH:mm')} - ${moment(meeting.endTime).format('HH:mm')}`,
                   callback_id: 'bookExam',
                   actions: [
                     {
                       name: 'bookExam',
                       text: 'Book',
                       type: 'button',
                       style: 'primary',
                       value: JSON.stringify({
                         meetingId: `${meeting._id}`,
                         examId: `${doc._id}`
                       }),
                       confirm: {
                         title: 'Are you sure?',
                         ok_text: 'Yes',
                         dismiss_text: 'No'
                       }
                     }
                   ]
                 }
              ))
             })
          ))
          .catch((err) => {
            console.error(err);
            res.send({ text: 'Sorry, something went wrong.' });
          });
        break;
      case 'deleteExam':
        ExamFacade.remove({ _id: examId })
          .then(() => (
            res.send(`Exam for ${courseName} deleted.`)
          ))
          .catch(err => (
            res.json({ error: 'Sorry, something went wrong.' })
          ));
        break;
      default:
        break;
    }
  }

  payload(req, res, next) {
    switch (JSON.parse(req.body.payload).callback_id) {
      case 'createExam':
        return this.saveExam(req, res, next);
      case 'bookExam':
        return this.bookExam(req, res, next);
      case 'listExams':
        return this.listExams(req, res, next);
      case 'removeBooking':
        return this.removeBooking(req, res, next);
      default:
        break;
    }

    return res.send();
  }
}

module.exports = new InteractivecompController();
