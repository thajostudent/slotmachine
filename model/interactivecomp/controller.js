const Controller = require('../../lib/controller');


class InteractivecompController extends Controller {
    payload(req, res, next) {
        console.log(req.body.payload);
    }
}

module.exports = new InteractivecompController();
