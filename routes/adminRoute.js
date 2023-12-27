const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');


const {adminLogin,adminLogout,brandPage,adminDetail,deleteBrand,updateBrand,addBrand,adminHistory,editCat,reCoupon,couponDelete,cataOffer,generateSalesReport,productImageAdd,couponAdd,adminCoupon,adminCatagory,categoryDelete,adminBack,adminAdd, adminLoginPost,updateDeliveryStatus,adminOrders,adminUsers,adminStock,CatagoryPage,adminProduct, categoryAdd,categoryPage,adminHome,productAdd,productDelete,productEdit,productUpdate,} = require('../controller/adminController');
const storage = multer.diskStorage({
   
 destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "public", "images"))
 },
 filename:  (req, file, cb)=> {
    cb(null, file.originalname + '_' + Date.now() + path.extname(file.originalname))
 }
})

const upload = multer({ storage: storage});

router.get('/login',adminLogin);
router.post('/login',adminLoginPost);
router.get('/home',adminHome);
router.get('/product',adminProduct);
router.get('/sales-report',generateSalesReport);
router.get('/addProduct',adminAdd)
router.get('/adminCatagory',adminCatagory);
router.post('/category/:id',categoryDelete);
router.post('/home',upload.array('images', 5), productAdd);
router.get('/logout',adminLogout);
router.get('/delete/:id',productDelete);
router.get('/edit/:id',productEdit);
router.post('/imgadd/:id', productImageAdd);
router.post('/update/:id',upload.array('images', 5),productUpdate);
router.get('/addCategory',categoryPage);
router.post('/categories',categoryAdd);
router.post('/categories/:categoryId',editCat);
router.post('/offer',cataOffer);
router.get('/users',adminUsers);
router.get('/orders',adminOrders);
router.get('/history',adminHistory);
router.post('/update-status/:orderId',updateDeliveryStatus)
router.get('/detail/:productId',adminDetail);
router.get('/back',adminBack)
router.get('/coupon',adminCoupon)
router.post('/addcoupon',couponAdd);
router.post('/deleteCoupon',couponDelete)
router.post('/reCoupon',reCoupon);
router.get('/brand',brandPage);
router.post('/addBrand',addBrand);
router.post('/deleteBrand',deleteBrand);
router.post('/updateBrand',updateBrand);




module.exports = router;