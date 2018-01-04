const xml2js = require('xml2js');

function getSemester(date) {
  const d = date || new Date();

  let semester;

  const n = d.getMonth();
  const y = d.getFullYear();

  if (n > 6) {
    semester = 'ht';
  } else {
    semester = 'vt';
  }

  return semester + y;
}

function createExamToObject(body) {
  const data = {};
  const bodyArr = body.split(' ');
  const day = bodyArr[1].split('/')[0];
  const month = bodyArr[1].split('/')[1];
  const date = new Date();

  date.setMonth(parseInt(month, 10) - 1);
  date.setDate(day);
  date.setHours(8);

  data.date = date;
  data.name = bodyArr[0];
  data.meetings = bodyArr[2];
  data.meetingLength = bodyArr[3];
  data.semester = module.exports.getSemester();

  return data;
}


function XMLStringToObject(string) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(string, (err, result) => {
      if (err) reject(err);

      return resolve(result);
    });
  });
}

module.exports = {
  createExamToObject,
  getSemester,
  XMLStringToObject
};
