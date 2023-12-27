const express = require('express');
const router = express.Router();

const {blockUser, unblockUser} = require('../controller/adminController')


router.get('/block/:_id',blockUser);
router.get('/unblock/:_id', unblockUser)

module.exports = router;