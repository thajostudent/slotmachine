/* global expect */

const fs = require('fs');
const { isValidUrl, getRepoName, getOrgAndRepo, getJob, getTestCases } = require('../../lib/helpers/repo');
const XMLStringToObject = require('../../lib/tools').XMLStringToObject;

const testXML = fs.readFileSync('lib/jenkinsconfig/config.xml');

describe('XMLStringToObject', () => {
  it('returns an object', () => (
    XMLStringToObject(testXML)
    .then((result) => {
      expect(result).toBeInstanceOf(Object);
    })
  ));
  it('has the correct properties', () => (
    XMLStringToObject(testXML)
    .then((result) => {
      expect(result).toHaveProperty('project');
    })
  ));
  it('throws an error with invalid XML', () => {
    expect.assertions(1);
    XMLStringToObject('test')
      .catch((err) => {
        expect(err).toBeInstanceOf(Error);
      });
  });
});


const correctUrl = 'https://github.com/0dv000/xx00xx-exam-1';
const badUrl = '/0dv000/xx00xx-exam-1';

describe('isValidUrl', () => {
  it('returns true on correct URL', () => (
    expect(isValidUrl(correctUrl)).toBeTruthy()
  ));
  it('return false on bad URL', () => (
    expect(isValidUrl(badUrl)).toBeFalsy()
  ));
});

const getOrgAndRepoInput = "https://github.com/0dv000/xx00xx-exam-1";
const getOrgAndRepoOutput = "0dv000/xx00xx-exam-1";

describe('getOrgAndRepo', () => {
  it('returns correct string', () => (
    expect(getOrgAndRepo(getOrgAndRepoInput)).toMatch(getOrgAndRepoOutput)
  ));
});


describe('getRepo', () => {
  it('returns correct string', () => (
    expect(getOrgAndRepo(getOrgAndRepoInput)).toMatch("xx00xx-exam-1")
  ));
});


const testResultdata = require('../../__tests__/unit/lib/test-result.json');

describe('getTestCases', () => {
  it('String should match', () => {
    expect(getTestCases(testResultdata)).toMatch(":o: return values analyze([4, 2, 6, 1, 3, 7, 5, 3]; should return {{max: 7, mean: 3.875, median: 3.5, min: 1, mode: [3], range: 6}} \n:o: return values analyze([3, 5, 2, -5, 9, 2, -5, 5, 10, 4, 1, 0, -1, 9, 0]; should return {{max: 10, mean: 2.6, median: 2, min: -5, mode: [-5, 0, 2, 5, 9], range: 15}} \n:o: return values analyze([5, 1, 1, 1, 3, -2, 2, 5, 7, 4, 5, 16]); should return {max: 16, mean: 4, median: 3.5, min: -2, mode: [1, 5], range: 18} \n");
  });
});

const getJobUrl = "http://194.47.174.62:8080/job/0dv000_xx00xx-exam-1/11";

describe('getJob', () => {
  it('object contains correct name', () => (
    expect(getJob(getJobUrl).name).toMatch("xx00xx-exam-1")
  ));
  it('object contains correct user', () => (
    expect(getJob(getJobUrl).user).toMatch("xx00xx")
  ));
  it('object contains correct org', () => (
    expect(getJob(getJobUrl).org).toMatch("0dv000")
  ));
  it('object contains correct build number', () => (
    expect(getJob(getJobUrl).number).toMatch("11")
  ));
  it('object contains correct build number', () => (
    expect(getJob(getJobUrl).exam).toMatch("exam-1")
  ));
});
