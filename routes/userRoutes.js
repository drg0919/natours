const express = require('express');
const multer = require('multer');
const router = express.Router();
const {getAllUsers,newUser,getUser,updateUser,updateMe,deleteUser,deleteMe,getUserId,uploadPhoto,resizePhoto} = require('../controllers/userController');
const {signUp,login,logout,forgotPassword,resetPassword,passwordChange,protected,permission} = require('../controllers/authController');

router.post('/signup',signUp);
router.post('/login',login);
router.get('/logout',logout);
router.post('/forgotpassword',forgotPassword);
router.patch('/resetpassword/:token',resetPassword);

router.use(protected);  //Authentication required for routes beyond this point

router.route('/me')
.get(getUserId, getUser);

router.patch('/changepassword', passwordChange);
router.delete('/deleteMe', deleteMe);
router.patch('/updateMe', uploadPhoto, resizePhoto, updateMe);

router.use(permission('admin'));    //Only admins can access routes beyond this point

router.route('/')
.get(getAllUsers)
.post(newUser);

router.route('/:id')
.get(getUser)
.patch(updateUser)
.delete(deleteUser);

module.exports = router;