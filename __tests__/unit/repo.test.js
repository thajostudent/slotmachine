const fs = require('fs');
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
