/* global expect */

const fs = require('fs');
const {isValidUrl, getRepoName } = require('../../lib/helpers/repo')
const XMLStringToObject = require('../../lib/tools').XMLStringToObject;

const testXML = fs.readFileSync('lib/test/config.xml');

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
