/* global expect, jest */

const tools = require('../../lib/tools');

const getSemester = tools.getSemester;
const createExamToObject = tools.createExamToObject;

const testBody = 'Exam1 25/11 8 1';

describe('getSemester', () => {
  it('returns a string', () => {
    expect(getSemester()).toEqual(expect.any(String));
  });
  it('returns the correct string for December', () => {
    expect(getSemester(new Date(2017, 11, 1))).toBe('ht2017');
  });
  it('returns the correct string for January', () => {
    expect(getSemester(new Date(2018, 0, 1))).toBe('vt2018');
  });
});

describe('createExamToObject', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns an object', () => {
    expect(createExamToObject(testBody)).toBeInstanceOf(Object);
  });
  it('calls getSemester', () => {
    const spy = jest.spyOn(tools, 'getSemester');
    createExamToObject(testBody);
    expect(spy).toHaveBeenCalled();
  });
  it('has the correct properties', () => {
    expect(createExamToObject(testBody)).toEqual(
      expect.objectContaining({
        date: expect.any(Date),
        name: expect.any(String),
        meetings: expect.any(String),
        meetingLength: expect.any(String),
        semester: expect.any(String)
      })
    );
  });
  it('returned object is correct', () => {
    tools.getSemester = jest.fn(() => 'vt2000');

    const examObject = createExamToObject(testBody);

    expect(examObject).toEqual({
      date: expect.any(Date),
      name: 'Exam1',
      meetings: '8',
      meetingLength: '1',
      semester: 'vt2000'
    });

    const examDate = examObject.date;

    expect(examDate.getFullYear()).toEqual(new Date().getFullYear());
    expect(examDate.getMonth()).toBe(10);
    expect(examDate.getDate()).toBe(25);
  });
});
