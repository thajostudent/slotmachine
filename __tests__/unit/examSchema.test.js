/* global expect */

var mockingoose = require('mockingoose').default;
var model = require('../../model/exam/facade');




describe('test mongoose User model', () => {
    it('should return the doc with findById', () => {

        const _doc = {
            _id: '507f191e810c19729de860ea',
            course: "0dv000vt2018",
            name: "exam-1",
            attempt: 1,
            results: [],
            meetings: []
        };

        mockingoose.Exam.toReturn(_doc, 'findOne');

        return model
            .findById({ _id: '507f191e810c19729de860ea' })
            .then(doc => {
                expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc);
            });
    });
    it('should return the doc with update', () => {

        const _doc = {
            _id: '507f191e810c19729de860ea',
            course: "0dv000vt2018",
            name: "exam-1",
            attempt: 1,
            results: [],
            meetings: []
        };

        mockingoose.Exam.toReturn(_doc, 'update');

        return model
            .update({ _id: '507f191e810c19729de860ea' }, { $set: { name: 'changed' } })
            .then(doc => {
                expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc);
            });
    });
    it('should return error for missing details', () => {

        const _doc = {
            _id: '507f191e810c19729de860ea',
            course: "0dv000vt2018",
            name: "exam-1",
            attempt: 1,
            results: [],
            meetings: []
        };

        mockingoose.Exam.toReturn(new Error(), 'save');
        return model
            .create({})
            .catch(err => {
                expect(err).toBeInstanceOf(Error);
            });
    });
});
