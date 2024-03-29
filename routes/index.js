const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello World');
});

// @desc Adding new user
//@route POST /adduser
//router.post('/adduser', actions.addNew)

// //@desc Authenticate a user
// //@route POST /authenticate
// router.post('/authenticate', actions.authenticate)

// //@desc Get info on a user
// //@route GET /getinfo
// router.get('/getinfo', actions.getinfo)

module.exports = router;
