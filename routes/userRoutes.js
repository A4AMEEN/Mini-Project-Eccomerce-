const express = require('express');
const router = express.Router();


const userController = require('../controller/userController')

router.get('/login',userController.loginPage);
router.get('/', userController.indexGet);

router.get('/signup',userController.signupPage)
router.post('/signup',userController.signupPost)


router.get('/otp',userController.otpGet)
router.post('/otp',userController.otpPost)
router.post('/otp',userController.sendOtp)
router.post('/resendotp', userController.resendOtp);

router.post('/login',userController.loginPost)
router.get('/logout', userController.userLogout)


router.get('/men',userController.menPage);
router.get('/women',userController.womenPage);
router.get('/cart',userController.cartPage);
router.get('/checkout',userController.checkoutPage);
router.get('/about',userController.aboutPage)
router.get('/contact',userController.contactPage);
router.get('/product-detail/:id',userController.productpage)
router.post('/cart/:productId',userController.cartPost);
router.post('/close/:productId',userController.updateCart);
router.get('/profile',userController.profilePage)
router.get('/userorders',userController.orderProfile)
router.get('/useraddress',userController.addressProfile)
router.get('/wallet',userController.viewWalletTransactions)
router.get('/remove/:id',userController.removePage)
router.get('/changepassword',userController.changePassword);
router.post('/changepassword',userController.changePost);
router.get('/changename',userController.namePage);
router.post('/changename',userController.namePost);
router.get('/addadress',userController.adressPage);
router.post('/addadress/:id',userController.addressPost)
router.get('/editaddress/:id',userController.editAddress)
router.post('/editadress/:id',userController.editPost);
router.post('/deleteaddress/:id',userController.deleteAddress);
router.get('/address',userController.displayAddresses);
router.get('/detail',userController.showPage)
router.post ('/checkout',userController.orderPage);
router.post('/razorpay',userController.orderPay)
router.post('/place-order/:id',userController.orderPost);
router.get('/download/invoice/:orderId',userController.downloadInvoice);
router.get('/ordetail/:orderId',userController.orderDetail);
router.post('/wishList/:productId',userController.whislistPage)    
router.post('/remove-item/:orderId',userController.removePost)
router.post('/return-item/:orderId',userController.returnPost)
router.post('/returnr-item/:orderId',userController.remover)
router.post('/remove-itemm/:orderId',userController.removePostt)
router.post('/return-itemm/:orderId',userController.returnPostt)
router.post('/returnr-itemm/:orderId',userController.removerr)
router.get('/delivery',userController.deliveryPage);
router.get('/thank',userController.thankPage);
router.get('/wishlist',userController.wishShow);
router.get('/userorder',userController.orderProfile);
router.post('/remove',userController.removeWishlist);
router.post('/createorder',userController.razorpayorder),
router.post('/coupon',userController.couponPost);
router.post('/removecoupon',userController.couponRemove);


module.exports = router;