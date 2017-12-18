function createExamToObject(body) {
  const data = {};
  const bodyArr = body.split(' ');
  const day = bodyArr[1].split('/')[0];
  const month = bodyArr[1].split('/')[1];
  const date = new Date();

  date.setMonth(month);
  date.setDate(day);
  date.setHours(8);

  data.date = date;
  data.name = bodyArr[0];
  data.meetings = bodyArr[2];
  data.meetingLength = bodyArr[3];
  data.semester = getSemester();

  return data;
}

function getSemester() {
  let semester;

  const d = new Date();
  const n = d.getMonth();
  const y = d.getFullYear();

  if (n > 6) {
    semester = 'ht';
  } else {
    semester = 'vt';
  }

  return semester + y;
}

module.exports = {
  createExamToObject
};
