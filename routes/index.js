let express = require('express');
let router = express.Router();

let route_controller = require('../controllers/routeController');

router.get('/', route_controller.index);

router.get('/logout', route_controller.logout_get);

/* GET login page. */
router.get('/login', route_controller.login_get);
/* POST login page. */
router.post('/login', route_controller.login_post);

/* GET signup page. */
router.get('/signup', route_controller.signup_get);
/* POST signup page. */
router.post('/signup', route_controller.signup_post);

/* GET msgboard page. */
router.get('/messageboard', route_controller.messageboard_get);
/* POST msgboard page. */
router.post('/messageboard', route_controller.messageboard_post);

module.exports = router;