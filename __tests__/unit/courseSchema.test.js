/* global expect */

var mockingoose = require('mockingoose').default;
var model = require('../../model/course/facade');




describe('test mongoose User model', () => {
    it('should return the doc with findById', () => {

        const _doc = {
            _id: '507f191e810c19729de860ea',
            title: "0dv000",
        };

        mockingoose.Course.toReturn(_doc, 'findOne');

        return model
            .findById({ _id: '507f191e810c19729de860ea' })
            .then(doc => {
                expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc);
            });
    });
    it('should return the doc with update', () => {

        const _doc = {
            _id: '507f191e810c19729de860ea',
            title: "0dv000",
        };

        mockingoose.Course.toReturn(_doc, 'update');

        return model
            .update({ _id: '507f191e810c19729de860ea' }, { $set: { title: 'changed' } })
            .then(doc => {
                expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc);
            });
    });
    it('should return error for missing details', () => {

        const _doc = {
            _id: '507f191e810c19729de860ea',
            title: "0dv000",
        };

        mockingoose.Course.toReturn(new Error(), 'save');
        return model
            .create({})
            .catch(err => {
                expect(err).toBeInstanceOf(Error);
            });
    });
});
