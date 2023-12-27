const { Usercollection } = require("../modals/userData");
const {Product} = require('../modals/products')
const multer = require('multer');
// const {Order} = require('../modals/orders')/
const Order = require('../modals/orders')
const mongoose = require('mongoose');
const { Category } = require('../modals/catagory');
const OrderHistory = require('../modals/orderhis')
const Coupon = require('../modals/coupon')
const Brand = require('../modals/brand')
const Excel = require('exceljs');
let isInvalid;


exports.adminLogin = (req, res) =>{
   if(req.session.admin){
    res.redirect('/admin/home')
   }else{
    
    res.render('adminLogin', {message: null});
   }
  
}
exports.adminLogout=(req,res)=>{
        req.session.destroy((err)=>{
            if(err){
                console.error(err.message);
            }else{
                res.redirect('/admin/login')
            }
        })
}

const credentials = {
    email: 'admin@gmail.com',
    password: 'alameen@123'
};
exports.adminLoginPost = (req, res) => {
    const { email, password } = req.body; // Assuming you're using body-parser middleware

    // Check if email and password match the credentials
    if (email === credentials.email && password === credentials.password) {
        // If credentials match, simulate session creation for admin
        req.session.admin = email;
        console.log(req.session.admin) // Assuming usage of sessions

        res.redirect('/admin/home'); // Redirect to admin home page upon successful login
    } else {
        // If credentials are incorrect, render the login page again with an error message
        const message = 'Invalid credentials. Please try again.';
        res.render('adminLogin', { message });
    }
};


exports.adminUsers=(req,res)=>{
    try{
        res.render('adminUsers',{users});
    }
    catch (error) {
        console.error(error);
     }
}
exports.postProductPage=async(req,res)=>{
    cosnt=imageArray=[];
}
exports.adminCatagory = async (req,res) => {
    try{
        if(req.session.admin){
            
        }else{
            res.redirect('/admin/login')
        }
        const categories = await Category.find();
        let offer 
    res.render('adminCatagory',{categories,offer})
    }catch{
        console.log('error')
    }
}
exports.brandPage = async(req,res)=> {
    try{
        if(req.session.admin){
            
        }else{
            res.redirect('/admin/login')
        }
        // const brand = await brand.find();
        const brands = await Brand.find()
        let error
        let message
        res.render('adminBrand',{brands,error,message})
    }
    catch{
        console.log('eerror')
    }
}
exports.addBrand = async(req,res)=>{
    const brandName = req.body.brandName;
    
    try{
        if(req.session.admin){
            
        }else{
            res.redirect('/admin/login')
        }
       
        const existingBrand = await Brand.findOne({ brandName });

        if (existingBrand) {
            const brands = await Brand.find()
            res.render('adminBrand',{ brands,error: 'Brand already exists' });
        }
         const newBrand = new Brand({
            brandName : brandName,
         })
         const savedBrand = await newBrand.save();
         res.redirect('/admin/Brand')
    }
    catch(err){
        console.log(err)

}
}
exports.updateBrand = async(req,res)=>{
    const brandId = req.body.brandId
    const newName = req.body.updatedBrandName
    if(req.session.admin){
            
    }else{
        res.redirect('/admin/login')
    }
    try{
        const duplicate = await Brand.find({brandName: newName})
        if(duplicate){
            const brands = await Brand.find()
            let error
            
            res.render('adminBrand',{error:'Name already Exist',brands})
        }
        const updateBrand = await Brand.findByIdAndUpdate(
            brandId,
            {brandName:newName}
        )
        await updateBrand.save();
        res.redirect('/admin/Brand')
    }
    catch{
        console.log('errr')
    }
}
exports.deleteBrand = async(req,res)=>{
    const brandId = req.body.brandId
    if(req.session.admin){
            
    }else{
        res.redirect('/admin/login')
    }
    try{
        const deleteBrand = await Brand.findByIdAndDelete(brandId);
        res.redirect('/admin/brand');
    }
    catch{
        console.log(err);
    }
}

  
exports.productAdd = async (req, res) => {
    console.log('hi this is the product add');
    if(req.session.admin){
            
    }else{
        res.redirect('/admin/login')
    }
    try {
        console.log(' i am in the try block');
        const newProduct = {
            name: req.body.name,
            price: req.body.price,
            offer: req.body.offer,
            discount: 0,
            stocks: req.body.stock1,    
            catagory: req.body.catagory, 
            brand: req.body.brand,
            images: req.files.map(file => file.filename)
        };
        if(newProduct.offer > 0){
            newProduct.discount =  ((newProduct.offer / 100) * newProduct.price);
            newProduct.discount = newProduct.price - newProduct.discount;

        }
        console.log('offerrr',newProduct);

        await Product.insertMany([newProduct]);
        const product = await Product.findOne({ name: newProduct.name });

        // Pass the product details to the EJS template
        res.redirect("/admin/Product");
    } catch (error) {
        console.error(error);
    }
};

exports.categoryAdd = async (req, res) => {
    if(req.session.admin){
            
    }else{
        res.redirect('/admin/login')
    }
    try {
        const existingCategory = await Category.findOne({ name: req.body.name });

        if (existingCategory) {
            // If a category with the same name already exists, handle it by sending an error message
            const categories = await Category.find();
            let offer
            return res.render('catagory', { categories, error: 'Category with this name already exists',offer });
        }

        // If the category name is unique, create a new category and save it
        const newCategory = new Category({
            name: req.body.name,
        });

        // Save the new category
        const savedCategory = await newCategory.save();

        // Redirect to a page indicating success or do something similar
        const categories = await Category.find();
        res.render('adminCatagory', { categories });

    } catch (error) {
        console.error(error);
        // Handle the error gracefully, perhaps show an error page or redirect with an error message
        res.status(500).send('Error occurred while adding category');
    }
};
// Function to generate sales report based on different time intervals
            // exports.generateSalesReport = async (req, res) => {
            //     try {
            //     const today = new Date();
            //     const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            //     const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
            
            //     const startOfToday = new Date();
            //     startOfToday.setHours(0, 0, 0, 0); // Set time to the start of the day
            //     const oneWeekAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
            //     const endOfToday = new Date();
            //     endOfToday.setHours(23, 59, 59, 999); // Set time to the end of the day
            //     const monthNames = [
            //         'January', 'February', 'March', 'April', 'May', 'June',
            //         'July', 'August', 'September', 'October', 'November', 'December'
            //       ];
            
            //       const dailyItemsSold = await Order.aggregate([
            //         {
            //           $match: {
            //             orderDate: {
            //               $gte: startOfToday,
            //               $lte: endOfToday
            //             }
            //           }
            //         },
            //         {
            //           $group: {
            //             _id: null,
            //             totalOrders: { $sum: 1 }
            //           }
            //         }
            //       ]);
            
            //     const weeklyItemsSoldByDay = await Order.aggregate([
            //         {
            //         $match: {
            //             orderDate: {
            //             $gte: oneWeekAgo,
            //             $lte: endOfToday,
            //             },
            //         },
            //         },
            //         {
            //         $group: {
            //             _id: { $dayOfWeek: '$orderDate' },
            //             totalOrders: { $sum: 1 },
            //         },
            //         },
            //         {
            //         $sort: { '_id': 1 }
            //         }
            //     ]);
            
            //     const monthlyItemsSold = await Order.aggregate([
            //         {
            //         $match: {
            //             orderDate: {
            //             $gte: oneYearAgo,
            //             $lte: today
            //             }
            //         }
            //         },
            //         {
            //         $group: {
            //             _id: {
            //             year: { $year: '$orderDate' },
            //             month: { $month: '$orderDate' }
            //             },
            //             totalOrders: { $sum: 1 }
            //         }
            //         },
            //         {
            //         $sort: {
            //             '_id.year': 1,
            //             '_id.month': 1
            //         }
            //         }
            //     ]);
                
            
            //     const yearlyItemsSold = await Order.aggregate([
            //         {
            //         $match: {
            //             orderDate: {
            //             $gte: oneYearAgo,
            //             $lte: today
            //             }
            //         }
            //         },
            //         {
            //         $group: {
            //             _id: null,
            //             totalOrders: { $sum: 1 }
            //         }
            //         }
            //     ]);
            
            //     const dailyCount = dailyItemsSold.length > 0 ? dailyItemsSold[0].totalOrders : 0;
            //     const weeklyCountsByDay = [0, 0, 0, 0, 0, 0, 0];
            
            //     weeklyItemsSoldByDay.forEach((day) => {
            //         weeklyCountsByDay[day._id - 1] = day.totalOrders;
            //     });
            
            //     const monthlyItemsSoldByMonth = await Order.aggregate([
            //         {
            //         $match: {
            //             orderDate: {
            //             $gte: oneYearAgo,
            //             $lte: today
            //             }
            //         }
            //         },
            //         {
            //         $group: {
            //             _id: {
            //             year: { $year: '$orderDate' },
            //             month: { $month: '$orderDate' }
            //             },
            //             totalOrders: { $sum: 1 }
            //         }
            //         },
            //         {
            //         $sort: {
            //             '_id.year': 1,
            //             '_id.month': 1
            //         }
            //         }
            //     ]);
            
            //     const monthlyCounts = Array(12).fill(0);
            
            //     monthlyItemsSoldByMonth.forEach((monthData) => {
            //         const yearDiff = today.getFullYear() - monthData._id.year;
            //         const monthDiff = today.getMonth() - monthData._id.month;
            //         const index = yearDiff * 12 + monthDiff;
            
            //         if (index >= 0 && index < 12) {
            //         monthlyCounts[index] = monthData.totalOrders;
            //         }
            //     });
            //     const weeklyOrdersByDayJSON = [];

            // weeklyItemsSoldByDay.forEach((day) => {
            // weeklyOrdersByDayJSON[day._id] = day.totalOrders;
            // });
            
            //     const monthlyCount = monthlyItemsSold.length > 0 ? monthlyItemsSold[0].totalOrders : 0;
            //     const yearlyCount = yearlyItemsSold.length > 0 ? yearlyItemsSold[0].totalOrders : 0;
            
            //     console.log('Weekly Orders Count by Day:', weeklyCountsByDay);
            //     console.log('Daily Orders Count:', dailyCount);
            //     console.log('Monthly Orders Count:', monthlyCount);
            //     console.log('Yearly Orders Count:', yearlyCount);
            //     console.log('Monthly Counts for Last 12 Months:', monthlyCounts);
            
            //     res.render('adminDashboard', {
            //         dailyCount,
            //         weeklyCountsByDay,
            //         monthlyCount,
            //         yearlyCount,
            //         weeklyOrdersByDayJSON,
            //         monthlyCounts
            //     });
            
            //     } catch (error) {
            //     console.error('Error generating sales report:', error);
            //     res.status(500).send('Error generating sales report');
            //     }
            // };
            
            exports.generateSalesReport = async (req, res) => {
                try {
                    if(req.session.admin){
            
                    }else{
                        res.redirect('/admin/login')
                    }
                const today = new Date();
                const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000); // Three days ago
    
    const startOfThreeDaysAgo = new Date(threeDaysAgo);
    startOfThreeDaysAgo.setHours(0, 0, 0, 0); 
                const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
            
                const startOfToday = new Date();
                startOfToday.setHours(0, 0, 0, 0); // Set time to the start of the day
                const oneWeekAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
                const endOfToday = new Date();
                endOfToday.setHours(23, 59, 59, 999); // Set time to the end of the day
            
                const dailyItemsSold = await Order.aggregate([
                    {
                        $match: {
                          orderDate: {
                            $gte: startOfThreeDaysAgo,
                            $lte: endOfToday
                          }
                        }
                      },
                      {
                        $group: {
                          _id: null,
                          totalOrders: { $sum: 1 }
                        }
                      }
                    ]);
            
                const weeklyItemsSoldByDay = await Order.aggregate([
                    {
                    $match: {
                        orderDate: {
                        $gte: oneWeekAgo,
                        $lte: endOfToday,
                        },
                    },
                    },
                    {
                    $group: {
                        _id: { $dayOfWeek: '$orderDate' },
                        totalOrders: { $sum: 1 },
                    },
                    },
                    {
                    $sort: { '_id': 1 }
                    }
                ]);
                                
            
                const yearlyItemsSold = await Order.aggregate([
                    {
                    $match: {
                        orderDate: {
                        $gte: oneYearAgo,
                        $lte: today
                        }
                    }
                    },
                    {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 }
                    }
                    }
                ]);
            
                const dailyCount = dailyItemsSold.length > 0 ? dailyItemsSold[0].totalOrders : 0;
                const weeklyCountsByDay = [0, 0, 0, 0, 0, 0, 0];
            
                weeklyItemsSoldByDay.forEach((day) => {
                    weeklyCountsByDay[day._id - 1] = day.totalOrders;
                });
            
                const monthlyItemsSold = await Order.aggregate([
                    {
                        $match: {
                            orderDate: {
                                $gte: oneMonthAgo,
                                $lte: today,
                            },
                        },
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: '$orderDate' },
                                month: { $month: '$orderDate' },
                            },
                            totalOrders: { $sum: 1 },
                        },
                    },
                    {
                        $sort: {
                            '_id.year': 1,
                            '_id.month': 1,
                        },
                    },
                ]);
                
        
            
                const monthlyCountsMap = new Map();
            
                // Initialize all months with zero counts
                for (let i = 1; i <= 12; i++) {
                    monthlyCountsMap.set(i, 0);
                }
            
                monthlyItemsSold.forEach((monthData) => {
                    const monthIndex = (today.getMonth() - monthData._id.month + 12) % 12; // Calculate the month index
                    const yearDiff = today.getFullYear() - monthData._id.year;
            
                    if (yearDiff === 0 || (yearDiff === 1 && monthIndex >= today.getMonth())) {
                        const count = monthlyCountsMap.get(monthIndex + 1); // Month index starts from 0
                        monthlyCountsMap.set(monthIndex + 1, count + monthData.totalOrders);
                    }
                });
            
                const monthlyCounts = Array.from(monthlyCountsMap.values());
                console.log('Monthly Counts for Last 12 Months:', monthlyCounts);

                const weeklyOrdersByDayJSON = [];

            weeklyItemsSoldByDay.forEach((day) => {
            weeklyOrdersByDayJSON[day._id] = day.totalOrders;
            });
            
            const monthlyCount = monthlyCounts[11]
            const yearlyCount = yearlyItemsSold.length > 0 ? yearlyItemsSold[0].totalOrders : 0;
            
                console.log('Weekly Orders Count by Day:', weeklyCountsByDay);
                console.log('Daily Orders Count:', dailyCount);
                console.log('Monthly Orders Count:', monthlyCount);
                console.log('Yearly Orders Count:', yearlyCount);
                console.log('Monthly Counts for Last 12 Months:', monthlyCounts);
            
                res.render('adminDashboard', {
                    dailyCount,
                    weeklyCountsByDay,
                    monthlyCount,
                    yearlyCount,
                    weeklyOrdersByDayJSON,
                    monthlyCounts
                });
            
                } catch (error) {
                console.error('Error generating sales report:', error);
                res.status(500).send('Error generating sales report');
                }
            };
            
            
            
  // Helper function to calculate sales data
  const calculateSalesData = (orders) => {
    const salesData = {};
  
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.productId;
        const quantity = item.quantity;
  
        if (!salesData[productId]) {
          salesData[productId] = 0;
        }
  
        salesData[productId] += quantity;
      });
    });
  
    return salesData;
  };
  

exports.categoryDelete = async (req, res) => {
    if(req.session.admin){
            
    }else{
        res.redirect('/admin/login')
    }
    try {
        const categoryId = req.params.id; // Extract the category ID from the URL parameters
        
        // Delete the category by ID
        const categories = await Category.find();
        await Category.findByIdAndDelete(categoryId);

        // Redirect or render your response based on your application's logic
        // For example, redirect to the category management page
        res.redirect('/admin/adminCatagory')
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).send('Error deleting category');
    }
};
exports.productDelete = async (req, res) => {
    if(req.session.admin){
            
    }else{
        res.redirect('/admin/login')
    }
    try {
      // Get the product ID from the request parameters
      const productId = req.params.id;
      // Delete the product from the database
      await Product.deleteOne({ _id: productId });
      // Redirect to the product list page
      res.redirect('/admin/Product');
    } catch (error) {
      console.error(error);
    }
  };
  exports.editCat = async (req, res) => {
    if(req.session.admin){
            
    }else{
        res.redirect('/admin/login')
    }
    const categoryId = req.params.categoryId; // Extract category ID from the request parameters
    const newName = req.body.newName; // Assuming you'll send the new name as 'newName' in the request body
  
    try {
      const category = await Category.findById(categoryId); // Find the category by ID
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      category.name = newName; // Update the category name with the new name
      await category.save();
      const categories = await Category.find();
       // Save the updated category
  
       res.redirect('/admin/adminCatagory')
    } catch (err) {
      res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  };
  exports.cataOffer = async (req, res) => {
    if(req.session.admin){
            
    }else{
        res.redirect('/admin/login')
    }
    const categoryId = req.body.categoryId; 
    const offerPercentage  = req.body.offerPercentage;
    console.log('zzzzzzzzzzz',categoryId,offerPercentage)
    // Assuming you get the category ID and offer percentage from the route

    try {
        // Find the category by ID
        const category = await Category.findById(categoryId);
        console.log('Category:', category.name);
    
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
    
        // Update all products with the given category ID and apply the offer discount
        const productsToUpdate = await Product.find({ catagory: category.name });
        console.log('Products:', productsToUpdate);
    
        for (const product of productsToUpdate) {
            if (product.offer <= offerPercentage) {
                console.log('Product Price:', product.price);
    
                // Update offer and discounted price
                product.offer = offerPercentage; // Assuming offerPercentage is defined elsewhere
                const discountedPrice = product.price - (product.price * offerPercentage) / 100;
                product.discount = discountedPrice;
                let offer = offerPercentage
                console.log("ofzzzzzzzzzzzzzzzzzzzzz",offer)
             
                console.log('Discounted Price:', product.discount,offer);
            }
        }
        category.offer = offerPercentage;
        console.log('ofzzer',category.offer) // Assign the offer to the category
        await category.save();
    
        // Save the updated products
        for (const product of productsToUpdate) {
            await product.save();
        }
    
        console.log('Products updated successfully!');
        res.redirect('/admin/adminCatagory?appliedOffer=true&categoryId=' + categoryId);

    } catch (error) {
        console.error('Error:', error);
        // Handle the error accordingly
    }
    
};

  exports.productImageAdd = async (req, res) => {
    console.log('hhahhahahahahah')
    const productId = req.params.id;
    const newImages = req.files; // Assuming you're sending new images in the request

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send("Product not found");
        }

        // Add new images to the existing images array
        product.images.push(...newImages.map(image => image.filename));

        // Save the updated product
        await product.save();

        return res.status(200).send("Images added successfully");
    } catch (error) {
        return res.status(500).send("Error adding images: " + error.message);
    }
};

  exports.productEdit= async (req, res) => {
    if(req.session.admin){
            
    }else{
        res.redirect('/admin/login')
    }
    try {
       // Get the product ID from the request parameters
       const productId = req.params.id;
       // Find the product from the database
       const product = await Product.findById(productId);
       const categories = await Category.find();
       const brands = await Brand.find();
       // Render the edit product page
       res.render('editProduct', { categories,product,brands });
    } catch (error) {
       console.error(error);
    }
   };

   
    exports.productUpdate = async (req, res) => {
        console.log("Hey there");
    
        let updatedImages = [];
    
        if (req.files && req.files.length > 0) {
            updatedImages = req.files.map(file => file.filename);
        } else {
            // If no new images are uploaded, retain the existing images
            const existingProduct = await Product.findById(req.params.id);
            if (existingProduct) {
                updatedImages = existingProduct.images;
                console.log('exxis',existingProduct.offer)
            }
        }
        const existingProduct = await Product.findById(req.params.id);
        console.log('exxe',existingProduct)
    
        const product = await Product.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            price: req.body.price,
            offer: req.body.offer,
            discount: req.body.discount,
            stocks: req.body.stocks,
            category: req.body.category, // Correcting typo in category field name
            brand: req.body.brand,
            images: updatedImages,
        });
        console.log('ezzs',product);
        if(product.offer > 0){
            const discount  = (product.price * product.offer)/100;
            console.log('ddd',discount);
            product.discount = product.price - discount
            console.log('newwwprod',product.discount,product.price)
        }
        console.log('product.price',product.price)
         await product.save()
    
        // Rest of your code (response handling, redirection, etc.)
    
    res.redirect('/admin/Product');
};

// Admin controller to update product quantity


exports.categoryPage=async(req,res)=>{
    try{
        let error

        console.log("ello");
        res.render('catagory',{error})
    }
    catch{
        res.redirect('/admin/home');
    }
}
exports.adminProduct = async (req, res) => {
    try {
        const products = [];
        res.render('adminProducts',{products});
    } catch (error) {
        // Handle the error here, e.g., log it or send an error response
        console.log('Error Bro');
        res.redirect('/admin/Product');
    }
}

exports.adminHome = async(req, res)=>{
    if(req.session.admin){
        const users = await Usercollection.find({},{password:false});
        const products = await Product.find({});

        res.render('adminindex',{users, products});
    }else{
        res.redirect('/admin/login')
    }
}
exports.adminUsers = async(req, res)=>{
    if(req.session.admin){
        const users = await Usercollection.find({},{password:false});
        const products = await Product.find({});
        res.render('adminUsers',{users, products});
    }else{
        res.redirect('/admin/login')
    }
}
exports.adminAdd = async(req, res)=>{
    if(req.session.admin){
        const users = await Usercollection.find({},{password:false});
        const products = await Product.find({});
        const categories = await Category.find();
        const brands = await Brand.find()
        res.render('adminAdd',{users,categories, products,brands});
    }else{
        res.redirect('/admin/login')
    }
}
// Number of products to display per page

exports.adminProduct = async (req, res) => {
    try {
        const ITEMS_PER_PAGE = 5; 
        if (req.session.admin) {
            const page = req.query.page || 1; // Get the requested page number from the query parameters

            // Fetch products from your database
            const totalProducts = await Product.countDocuments({}); // Get the total number of products

            const products = await Product.find({})
                .skip((page - 1) * ITEMS_PER_PAGE) // Calculate how many products to skip
                .limit(ITEMS_PER_PAGE); // Limit the number of products to retrieve

            const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE); // Calculate total pages

            const users = await Usercollection.find({}, { password: false });

            res.render('adminProduct', { users, products, currentPage: page, totalPages });
        } else {
            res.redirect('/admin/login');
        }
    } catch (error) {
        // Handle the error here, e.g., log it or send an error response
        console.error('Error:', error);
        res.redirect('/admin/login');
    }
};

exports.adminDetail = async (req, res) => {
    console.log('pppprrrr')

    try {
      // Retrieve product details from the database based on the productId
      const productId = req.params.productId;
      console.log(productId)
      const product = await Product.findById(productId); 
      console.log(product)
  
      // Render the product details page
      res.render('adminDetails', { product });
    } catch (error) {
      // Handle errors (e.g., product not found)
      console.error(error);
      res.redirect('/admin/Orders')
    }
  };
exports.adminBack =(req,res) =>{
    res.render('adminOrders')
}
exports.updateDeliveryStatus = async (req, res) => {
    // console.log()
    // const orderId = req.params.orderId;
    // const newStatus = req.body.deliveryStatus;
    // console.log('OOder',orderId)
    // console.log('status',newStatus)
  
    // Update the delivery status in the database
    try {
        const orderId = req.params.orderId;
        const newStatus = req.body.deliveryStatus;
        const order = await Order.findById(orderId);
        console.log('OOder',orderId)
          console.log('status',newStatus)
          console.log('mm',order);

        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }
        order.items.forEach((item) => {
            if (item._id.equals(req.body.itemId)) {
              console.log('Updating item', item._id, 'to', newStatus);
              item.deliveryStatus = newStatus;
            }
          });
          await order.save();

          res.redirect('/admin/Orders')
      // Update the deliveryStatus for the specified order
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }
    };
    
    exports.adminCoupon = async (req,res) =>{
        try{
            if(req.session.admin){
            
            }else{
                res.redirect('/admin/login')
            }
            let error;
            const coupons = await Coupon.find({});
                    res.render('coupon',{coupons,error})
        }
        catch{
            console.log('errrrr')
        }
    }
    exports.couponDelete = async(req,res) =>{
        try {
            const { couponId } = req.body; // Assuming the couponId is sent in the request body
    
            // Find the coupon by ID and delete it
            const deletedCoupon = await Coupon.findByIdAndDelete(couponId);
    
            if (!deletedCoupon) {
                return res.status(404).json({ message: 'Coupon not found or already deleted' });
            }
    
            // Respond with a success message or any necessary data
            res.redirect('/admin/coupon')
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
    exports.reCoupon = async(req,res) =>{
        try{
            const { couponId } = req.body;
            const rework = await Coupon.findByIdAndUpdate(couponId,{active : true})
            console.log('worked',rework)
            if(!rework){
                console.log('errreer')
            }
            res.redirect('/admin/coupon');
        }
       
    
    catch{
        console.log('catch')
    }
}
exports.adminOrders = async(req, res) => {
   
    try {
        if(req.session.admin){
            
        }else{
            res.redirect('/admin/login')
        }
        console.log('123')
        
        const orders = await Order.find({}).populate('userId');

    
        console.log('oooordeeeer', orders);
        const generateRandomI=
          function generateRandomId(index) {
    const prefix = "ORDER"; // You can set any prefix you want
    const randomId = prefix + '_' + index + '_' + Math.floor(Math.random() * 10000);
    return randomId;
  }
        
    
        res.render('adminOrders', { generateRandomI,orders });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }
    };
    const ITEMS_PER_PAGE = 20; // Number of products to display per page

    exports.adminHistory = async (req, res) => {
        try {
            if(req.session.admin){
            
            }else{
                res.redirect('/admin/login')
            }
            const page = req.query.page || 1; // Get the requested page number from the query parameters
    
            // Fetch order history for all users
            // Get the total number of orders
            const allUsersOrderHistory = await OrderHistory.find({})
                .populate({
                    path: 'userId',
                    select: 'name email'
                })
                .populate('items.productId')
                .populate('address')
                .sort({ orderDate: -1 }) // Sort in descending order based on orderDate
                .skip((page - 1) * ITEMS_PER_PAGE) // Calculate how many documents to skip
                .limit(ITEMS_PER_PAGE); // Limit the number of documents to retrieve
                
            const totalOrders = await OrderHistory.countDocuments({}); 
            const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);
    
            res.render('adminHistory', { totalPages,allUsersOrderHistory, currentPage: page });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    };
    
        exports.couponAdd = async (req, res) => {
            const { coupon_code } = req.body;
            const  discription = req.body.discription;
            const offer = req.body.offer
            const amount = req.body.amount;
            
          
            try {
              const existingCoupon = await Coupon.findOne({ code: coupon_code });
              const coupons = await Coupon.find({});
          
              if (existingCoupon) {
                const coupons = await Coupon.find({});
                    return res.render('coupon',{ coupons,error: 'Coupon code already exists' });
                // If you want to redirect with an error message:
                // return res.redirect('/admin/coupon?error=Coupon code already exists');
              } else {
                const newCoupon = new Coupon({
                  code: coupon_code,
                  discription: discription,
                  offer: offer,
                  amount : amount,
                  active: true,
                });
          
                await newCoupon.save();
                console.log('newcop',newCoupon)
          
                // Respond with success message or redirect
                res.redirect('/admin/coupon')
                // Or redirect: res.redirect('/admin/coupon?success=Coupon added successfully');
              }
            } catch (err) {
              console.error('Error adding coupon:', err);
              return res.status(500).json({ error: 'Internal server error' });
            }
          };
          

          exports.blockUser = async (req, res) => {
            console.log('Blocked');
            try {
                let id = req.params._id;
                console.log('ID:', id);
                
                // Update the user's isBlocked status to true in the database
                await Usercollection.updateOne({ _id: id }, { $set: { isBlocked: true } });
                res.redirect('/admin/users');
        
                // Find the user session and destroy it
                if (req.session.user) {
                    req.session.user = null; // Clear user information
                    req.session.destroy(); // Clear the session

                }
        
                // Redirect to the admin users' page
                
            } catch (err) {
                console.log(err.message);
                res.json('Internal server Error');
            }
        };
        
        

exports.unblockUser = async(req, res)=>{
    let id = req.params._id;
    await Usercollection.updateOne({_id: id}, {$set:{isBlocked: false}});
    res.redirect('/admin/users');
}

