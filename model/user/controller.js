const axios = require('axios');
const moment = require('moment');
const Controller = require('../../lib/controller');
const userFacade = require('./facade');
const meetingFacade = require('../meeting/facade')


class UserController extends Controller {
  async create(req, res, next) {
    try {
      const response = await axios({
        method: 'post',
        url: 'https://slack.com/api/users.info',
        headers: {
          Authorization: `Bearer ${process.env.SLACK_API_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: `user=${req.body.user_id}`
      });

      console.log(response);

      if (!response.data.user.is_admin) {
        return res.send('Not authorized');
      }
    } catch (e) {
      console.log(e);
      return res.send('Sorry, something went wrong.');
    }

    // console.log(req.body);
    const users = req.body.text.split(' ');
    const channel = req.body.channel_name.split('-')[0];
    console.log(users);
    console.log(channel);

    const promises = users.map(user => (
      userFacade.create({ username: user })
    ));

    Promise.all(promises)
      .then(() => (
        res.send({
          text: 'Users added'
        })
      ))
      .catch((e) => {
        console.log(e);
        return res.send('Sorry, something went wrong');
      });
  }

  async getExams(req, res, next) {
    console.log(req.body.user_name);
    userFacade.findOne({ username: req.body.user_name })
      .then((user) => {
        meetingFacade.find({ student: user._id })
          .then(meetings => {
            return res.send({
              text: `Your booked meetings:`,
              attachments: meetings.map((meeting, index) => (
                {
                  title: `Meeting ${index + 1}:`,
                  title_link: 'https://www.google.com',
                  text: `${moment(meeting.startTime).format('HH:mm')} - ${moment(meeting.endTime).format('HH:mm')}`,
                  callback_id: 'removeBooking',
                  actions: [
                    {
                      name: 'removeBooking',
                      text: 'Remove',
                      type: 'button',
                      style: 'primary',
                      value: JSON.stringify({
                        meetingId: `${meeting._id}`
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
            });
          })
        /*console.log(doc);
        if (!doc || !doc.exams) return res.send({ text: 'You don\'t have any booked exams' });
        console.log(doc.exams);
        doc.exams.forEach((exam) => {
          examFacade.findOne({ _id: exam })
          .then((doc) => {
            let text = `
            *Course: ${doc.course}*
            Exam: ${doc.name}
            Attempts: ${doc.attempt}
            Results: ${doc.results}
            *Upcoming meetings:*
            `;
            doc.meetings.forEach((meeting) => {
              text += `
                Id: ${meeting._id}
                `;
              text += `
                Start: ${meeting.startTime}
                `;
              text += `
                End: ${meeting.endTime}
                `;
            });
            return res.send({
              username: 'ExamBot',
              mrkdwn: true,
              text
            });
          });
        });*/
      })
      .catch(error => (
        console.log(error)
      ));
  }
  async whatsMyName(req, res, next) {
    res.send(req.body.user_name);
  }

}


module.exports = new UserController(userFacade);
