let express = require('express');
let router = express.Router();

let user_controller = require('../controllers/userController');

/* GET user based on ID. */
router.get('/:id', user_controller.user_update_get);
/* POST user, updated info based on ID. */
router.post('/:id', user_controller.user_update_post);

module.exports = router;