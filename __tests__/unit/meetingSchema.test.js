/* global expect */

var mockingoose = require('mockingoose').default;
var model = require('../../model/meeting/facade');




describe('test mongoose User model', () => {
    it('should return the doc with findById', () => {

        const _doc = {
            _id: '507f191e810c19729de860ea',
            startTime: "2018-01-25T08:00:00.000Z",
            endTime: "2018-01-25T09:00:00.000Z"
        };

        mockingoose.Meeting.toReturn(_doc, 'findOne');

        return model
            .findById({ _id: '507f191e810c19729de860ea' })
            .then(doc => {
                expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc);
            });
    });
    it('should return the doc with update', () => {

        const _doc = {
            _id: '507f191e810c19729de860ea',
            startTime: '2018-01-25T08:00:00.000Z',
            endTime: '2018-01-25T09:00:00.000Z',
        };

        mockingoose.Meeting.toReturn(_doc, 'update');

        return model
            .update({ _id: '507f191e810c19729de860ea' }, { $set: { username: 'changed' } })
            .then(doc => {
                expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc);
            });
    });
    it('should return error for missing details', () => {

        const _doc = {
            _id: '507f191e810c19729de860ea',
            startTime: "2018-01-25T08:00:00.000Z",
            endTime: "2018-01-25T09:00:00.000Z",
        };

        mockingoose.Meeting.toReturn(new Error(), 'save');
        return model
            .create({})
            .catch(err => {
                expect(err).toBeInstanceOf(Error);
            });
    });
});
