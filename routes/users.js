var express = require('express');
var router = express.Router();

let user_controller = require('../controllers/userController');

/* GET user based on ID. */
router.get('/:id', user_controller.user_id_get);
/* POST user updated info based on ID. */
router.post('/:id', user_controller.user_id_post);

module.exports = router;
