const {Usercollection} = require('../modals/userData');
const {Product} = require('../modals/products')
const nodemailer = require('nodemailer');
const session = require('express-session');
const generate_otp = require('generate-otp');
const Cart= require('../modals/cart');
const { isLoggedIn } = require('../controller/userController');
const Address = require('../modals/adress');
const Order = require('../modals/orders')
const Wishlist = require('../modals/whislist');
const OrderHistory = require('../modals/orderhis');
const Razorpay = require('razorpay');
const Coupon = require('../modals/coupon')
const moment = require('moment');
const express = require('express');

const app = express();
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure to true if using HTTPS
}));



let details;
// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'testtdemoo11111@gmail.com',
      pass: 'wikvaxsgqyebphvh',
    },
  });
  

let isUser, isOtp, otp;
const PRODUCTS_PER_PAGE = 3; // Define the number of products per page
const menPage = async (req, res) => {
    try {
      const page = req.query.page || 1;
      const PRODUCTS_PER_PAGE = 3;
  
      let filterApplied = false;
  
      let minPrice = 0;
      let maxPrice = Infinity;
  
      let priceFilter = {};
  
      const priceRange = req.query.priceRange || ''; // Get selected price range
  
      if (priceRange) {
        // Extract min and max prices from selected range
        const [minRange, maxRange] = priceRange.split('-');
        minPrice = parseInt(minRange);
        maxPrice = parseInt(maxRange);
  
        priceFilter = {
          price: { $gte: minPrice, $lte: maxPrice }
        };
        filterApplied = true; // Set flag to true if price range filter applied
      }
  
      let category = req.query.category || '';
      let categoryFilter = {};
  
      if (category !== '') {
        categoryFilter = {
          category: category // Adjust the field name based on your schema
        };
        filterApplied = true;
      }
  
      let searchQuery = {};
  
      const search = req.query.search;
  
      if (search) {
        searchQuery = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } }
          ]
        };
        filterApplied = true;
      }
  
      let productsQuery = {};
  
      if (filterApplied) {
        productsQuery = {
          ...priceFilter,
          ...categoryFilter,
          ...searchQuery
        };
      }
  
      const productsCount = await Product.countDocuments(productsQuery);
      const totalPages = Math.ceil(productsCount / PRODUCTS_PER_PAGE);
  
      const products = await Product.find(productsQuery)
        .skip((page - 1) * PRODUCTS_PER_PAGE)
        .limit(PRODUCTS_PER_PAGE);
  
      const email = req.session.user;
      const userdata = await Usercollection.findOne({ email: email });
      const userId = userdata._id;
      const cart = await Cart.findOne({ userId: userId });
      const walletBalance = userdata.wallet;
      const cartLength = cart ? cart.Cart.items.length : 0;
  
      const wishlist = await Wishlist.findOne({ user: userId }).populate('products');
      const coupons = await Coupon.find({ active: true });
  
      const productsWithWishlist = products.map(product => {
        const inWishlist = wishlist ? wishlist.products.some(wishlistProduct => wishlistProduct._id.equals(product._id)) : false;
        return { ...product._doc, inWishlist };
      });
  
      res.render('men', {
        products: productsWithWishlist,
        cartLength,
        totalPages,
        coupons,
        userdata,
        walletBalance,
        currentPage: page,
        searchKeyword: search,
        // Pass filters data to the template only if filters are applied
        ...(filterApplied && { minPrice, maxPrice, category, priceRange })
      });
    } catch (error) {
      console.error(error);
      res.render('login',{message :'User Blocked  Contack Admin'})
    }
  };
  
  
  
const womenPage = (req, res) => {
    res.render('women');
};

const cartPage=('/cart', isLoggedIn, async (req,res)=>{
    try {
        const productId = req.query.productId;
        const email=req.session.user
        const userdata= await Usercollection.findOne({email:email})
        const userId= userdata._id
        const product = await Product.findById(productId);
        const addresses = await Address.find({ userId });
        const user = await Usercollection.findOne({ email: email });
        const walletBalance = userdata.wallet;
        
           
        
        
        const cart = await Cart.findOne({ userId: userId,  });
        const cartLength = cart ? cart.Cart.items.length : 0;
        
        console.log("user",cart);
        if (!cart) {
            return res.redirect('/');
        }
        const calculateTotalPrice = (items) => {
            let total = 0;
            items.forEach(item => {
                total += item.price * item.quantity;
            });
            return total;
        };
        const totalPrice = calculateTotalPrice(cart.Cart.items);
    cart.Cart.totalPrice = totalPrice;


        res.render('cart', { calculateTotalPrice,walletBalance,product ,_id: user, userCart :cart,addresses,cartLength });

    } catch (error) {
        console.error(error);
        res.render('login',{message :'User Blocked  Contack Admin'})
    }
});
const couponRemove = async (req, res) => {
    try {
        const email = req.session.user;
        const user = await Usercollection.findOne({ email: email });
        const userId = user._id;
        const addresses = await Address.find({ userId });
        const userdata = await Usercollection.findOne({ email: email }); 
        

        // Find the user's cart
        const userCart = await Cart.findOne({ userId: userId });

        // Check if the cart exists and is not empty
        if (!userCart || userCart.Cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty. Cannot place an order.' });
        }

        // Iterate through each item in the cart
        for (const item of userCart.Cart.items) {
            const productId = item.productId;
            const quantityPurchased = item.quantity;

            // Find the product by ID
            const product = await Product.findById(productId);
           
        }

        const couponCode = req.body.couponCode;
        console.log('cup',couponCode)

        // Find the coupon based on the provided code
        const coupon = await Coupon.findOne({ code: couponCode });
        console.log('coupoee',coupon)
        const cart = await Cart.findOne({ userId: userId });
        const calculateTotalPrice = (items) => {
            let total = 0;
            items.forEach(item => {
                total += item.price * item.quantity;
            });
            return total;
        };

        const totalPrice = calculateTotalPrice(cart.Cart.items);
        cart.Cart.totalPrice = totalPrice;
        console.log('cccccc',calculateTotalPrice)
        console.log('toleee',totalPrice)
        

        // Validate the coupon and calculate discounts
        let discountPercentage = 0;
        let updatedTotalPrice = totalPrice;
        console.log('uppdatedfiss',totalPrice)
        // console.log('ttott',item.totalprice)

        if (coupon) {

            // Apply discount if the coupon is active
            if (coupon.active) {
                let CouponApplied = true;
                console.log('active',coupon.active)
                // Implement discount logic based on coupon code and total price tlds
                if ( updatedTotalPrice >= coupon.amount) {
                    
                    // Assuming discountPercentage should be 10 for this coupon code and price threshold
                    discountPercentage = 30;
                    console.log('Discount Percentage:', discountPercentage);
                    const discountAmount = (updatedTotalPrice * discountPercentage) / 100; // Calculate discount amount
                    updatedTotalPrice -= discountAmount;
                    userCart.Cart.items.forEach(item => {
                        // Assuming each item has a price attribute to update
                        item.price -= (item.price * discountPercentage) / 1000;
                        console.log('prrriz',item.price)
                        console.log('Discount Percentage:', discountAmount);
                        
                    });
                     // Deactivate the used coupon by updating its 'active' status to false
            coupon.active = false;
            // Save the updated coupon to mark it as used
             // Deduct discount from the total price
                }
                console.log('suppzz',userCart)
                
                console.log('Updated Total Price:', updatedTotalPrice);

                console.log("coupon",updatedTotalPrice)
                // Add more conditions for other coupon codes and price thresholds here
            
            

                // Assuming redirecting to a 'delivery' page and passing discount details
                let message;
                let code = couponCode;
                console.log('couponzzzzz',code)
                let discountAmount;
                
                
                return res.render('checkout', {
                    calculateTotalPrice,
                    Product,
                    userdata,
                    code,
                    razorpayConfig,
                    userCart,
                    message,
                    CouponApplied,
                    addresses,
                    CouponApplied,
                    couponCode, // Pass the coupon code for display
                    discountPercentage,
                    discountAmount, // Pass the discount percentage for display
                    updatedTotalPrice // Pass the updated total price after discount for display
                });
                    } else {
                        let code
                        let CouponApplied;
                        let discountAmount
                        return res.render('checkout', {
                            calculateTotalPrice,
                            Product,
                            userdata,
                            code,
                            razorpayConfig,
                            CouponApplied,
                            discountAmount,
                            userCart,
                            addresses,
                            couponCode, // Pass the coupon code for display
                            discountPercentage, // Pass the discount percentage for display
                            updatedTotalPrice,
                            message: 'Coupon is not Valid or Expired.', // Pass the updated total price after discount for display
                        });
                    }
        } else {
            let code
            let CouponApplied
            let discountAmount
            return res.render('checkout', {
                calculateTotalPrice,
                Product,
                userdata,
                razorpayConfig,
                CouponApplied,
                userCart,
                addresses,
                code,
                couponCode, // Pass the coupon code for display
                discountPercentage,
                discountAmount, // Pass the discount percentage for display
                updatedTotalPrice,
                message: 'Coupon Cleared', // Pass the updated total price after discount for display
            });
        }
    } catch (error) {
        console.error(error);
        res.redirect('checkout')
    }
};
const couponPost = async (req, res) => {
    try {
        const email = req.session.user;
        const user = await Usercollection.findOne({ email: email });
        const userId = user._id;
        const addresses = await Address.find({ userId });
        const userdata = await Usercollection.findOne({ email: email }); 
        

        // Find the user's cart
        const userCart = await Cart.findOne({ userId: userId });

        // Check if the cart exists and is not empty
        if (!userCart || userCart.Cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty. Cannot place an order.' });
        }

        // Iterate through each item in the cart
        for (const item of userCart.Cart.items) {
            const productId = item.productId;
            const quantityPurchased = item.quantity;

            // Find the product by ID
            const product = await Product.findById(productId);
           
        }

        const couponCode = req.body.couponCode;
        console.log('cup',couponCode)

        // Find the coupon based on the provided code
        const coupon = await Coupon.findOne({ code: couponCode });
        console.log('coupoee',coupon)
        const cart = await Cart.findOne({ userId: userId });
        const calculateTotalPrice = (items) => {
            let total = 0;
            items.forEach(item => {
                total += item.price * item.quantity;
            });
            return total;
        };

        const totalPrice = calculateTotalPrice(cart.Cart.items);
        cart.Cart.totalPrice = totalPrice;
        console.log('cccccc',cart.Cart.totalPrice)
        console.log('toleee',totalPrice)
        

        // Validate the coupon and calculate discounts
        let discountPercentage = 0;
        let updatedTotalPrice = totalPrice;
        console.log('uppdatedfiss',totalPrice)
        // console.log('ttott',item.totalprice)

        if (coupon) {

            // Apply discount if the coupon is active
            if (coupon.active) {
                let CouponApplied = true;
                console.log('coupss',coupon.offer)
                console.log('active',coupon.active)
                // Implement discount logic based on coupon code and total price tlds
                if ( updatedTotalPrice >= coupon.amount) {
                    
                    // Assuming discountPercentage should be 10 for this coupon code and price threshold
                    discountPercentage = coupon.offer;
                    console.log('Discount Percentage:', discountPercentage);
                    const discountAmount = (updatedTotalPrice * discountPercentage) / 100; // Calculate discount amount
                    updatedTotalPrice -= discountAmount;
                    userCart.Cart.items.forEach(item => {
                        // Assuming each item has a price attribute to update
                        item.price -= (item.price * discountPercentage) / 100;
                        console.log('prrriz',item.price)
                        console.log('Discount Percentage:', discountAmount);
                        
                    });
                     // Deactivate the used coupon by updating its 'active' status to false
            coupon.active = false;
            // Save the updated coupon to mark it as used
             // Deduct discount from the total price
                }
                else {
                    let code
                    let CouponApplied;
                    let discountAmount
                    return res.render('checkout', {
                        calculateTotalPrice,
                        Product,
                        userdata,
                        code,
                        razorpayConfig,
                        CouponApplied,
                        discountAmount,
                        userCart,
                        addresses,
                        couponCode, // Pass the coupon code for display
                        discountPercentage, // Pass the discount percentage for display
                        updatedTotalPrice,
                        message: 'Min price for offer didnt Exeeded', // Pass the updated total price after discount for display
                    });
                }
                console.log('suppzz',userCart)
                
                console.log('Updated Total Price:', updatedTotalPrice);

                console.log("coupon",updatedTotalPrice)
                // Add more conditions for other coupon codes and price thresholds here
            
            

                // Assuming redirecting to a 'delivery' page and passing discount details
                let message;
                let code = couponCode;
                console.log('couponzzzzz',code)
                let discountAmount;
                
                
                return res.render('checkout', {
                    calculateTotalPrice,
                    Product,
                    userdata,
                    code,
                    razorpayConfig,
                    userCart,
                    message,
                    CouponApplied,
                    addresses,
                    CouponApplied,
                    couponCode, // Pass the coupon code for display
                    discountPercentage,
                    discountAmount, // Pass the discount percentage for display
                    updatedTotalPrice // Pass the updated total price after discount for display
                });
                    } else {
                        let code
                        let CouponApplied;
                        let discountAmount
                        return res.render('checkout', {
                            calculateTotalPrice,
                            Product,
                            userdata,
                            code,
                            razorpayConfig,
                            CouponApplied,
                            discountAmount,
                            userCart,
                            addresses,
                            couponCode, // Pass the coupon code for display
                            discountPercentage, // Pass the discount percentage for display
                            updatedTotalPrice,
                            message: 'Coupon is not Valid or Expired.', // Pass the updated total price after discount for display
                        });
                    }
        } else {
            let code
            let CouponApplied
            let discountAmount
            return res.render('checkout', {
                calculateTotalPrice,
                Product,
                userdata,
                razorpayConfig,
                CouponApplied,
                userCart,
                addresses,
                code,
                couponCode, // Pass the coupon code for display
                discountPercentage,
                discountAmount, // Pass the discount percentage for display
                updatedTotalPrice,
                message: 'Coupon not found', // Pass the updated total price after discount for display
            });
        }
    } catch (error) {
        console.error(error);
        res.redirect('checkout')
    }
};
const downloadInvoice = (req, res) => {
    const orderId = req.params.orderId;

    // Here you'd typically fetch order details and generate the invoice content
    // This is a placeholder example to send a PDF file as a response
    const invoiceContent = generateInvoice(orderId); // Implement your invoice generation logic

    // Set the appropriate headers for a PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice_${orderId}.pdf"`);

    // Send the invoice content as a downloadable file
    res.send(invoiceContent);
};



const razorpayConfig = {
    key_id: 'rzp_test_U3wApGAM5gGpOR',
    key_secret: 'HyCBL2HkQVecOmAEi44gUonh',
};

                const orderPage = async (req, res) => {
                    
                    try {
                        const email = req.session.user;
                        const user = await Usercollection.findOne({ email: email });
                        const userId = user._id;
                        const couponCode = req.body.couponCode;
                        const userCart = await Cart.findOne({ userId: userId });
                        const addresses = await Address.find({ userId });
                        for (const item of userCart.Cart.items) {
                            const productId = item.productId;
                            const quantityPurchased = item.quantity;
                
                            // Find the product by ID
                            const product = await Product.findById(productId);
                           
                        }
                
        console.log('cup',couponCode)

        // Find the coupon based on the provided code
        const coupon = await Coupon.findOne({ code: couponCode });
        let discountPercentage = 0;
        let updatedTotalPrice = calculateTotalPrice(userCart.Cart.items); 
        console.log('diss',updatedTotalPrice)
                        if (coupon) {

                            // Apply discount if the coupon is active
                            if (coupon.active) {
                                let CouponApplied = true;
                                console.log('active',coupon.active)
                                // Implement discount logic based on coupon code and total price tlds
                                if ( updatedTotalPrice >= 500) {
                                    // Assuming discountPercentage should be 10 for this coupon code and price threshold
                                    discountPercentage = 10;
                                    console.log('Discount Percentage:', discountPercentage);
                                    const discountAmount = (updatedTotalPrice * discountPercentage) / 100; // Calculate discount amount
                                    updatedTotalPrice -= discountAmount;
                                    userCart.Cart.items.forEach(item => {
                                        // Assuming each item has a price attribute to update
                                        item.price -= (item.price * discountPercentage) / 100;
                                        console.log('prrriz',item.price)
                                        

                                        
                                    });
                                    await userCart.save()
                                    console.log('userCart')
                                    

                                     // Deactivate the used coupon by updating its 'active' status to false
                            coupon.active = false;
                            await coupon.save()
                            // Save the updated coupon to mark it as used
                             // Deduct discount from the total price
                                }
                            }
                        }
                        for (const item of userCart.Cart.items) {
                            const productId = item.productId;
                            const quantityPurchased = item.quantity;

                            // Find the product by ID
                            const product = await Product.findById(productId);
                            

                            if (!product) {
                                return res.status(404).json({ message: 'Product not found.' });
                            }

                            // Check if the available stock is sufficient for the order
                            // Inside the block where product stocks are insufficient
if (product.stocks < quantityPurchased) {
    userCart.Cart.items.forEach(item => {
        if (item.productId === productId) {
            item.stockAvailable = false; // For the product with insufficient stock
        } else {
            item.stockAvailable = true; // For other products with available stock
        }
    });
    let CouponApplied = false
    // Store necessary data in variables
    const dataToRender = {
        calculateTotalPrice, // Assuming this is a function needed for rendering
        Cart: userCart.Cart,
        message: 'Product out of stock occured .',
        code: couponCode,
        CouponApplied, // Set based on your logic
        discountPercentage: discountPercentage, // Set based on your logic
        product: product, // Store the product causing the issue
        userdata: user, // Store user data if needed
        razorpayConfig: razorpayConfig, // Store Razorpay config if needed
        userCart: userCart, // Store userCart if needed
        addresses: addresses, // Store addresses if needed
    };

    // Render the checkout page with stored data
    return  res.render('checkout', dataToRender);
}


                            // Reduce the product's stock by the purchased quantity
                            product.stocks -= quantityPurchased;

                            // Save the updated product
                            await product.save();
                        }

                        if (!userCart || userCart.Cart.items.length === 0) {
                            return res.status(400).json({ message: 'Cart is empty. Cannot place an order.' });
                        }


                        // Fetch the selected payment method from the request body
                        const selectedPaymentMethod = req.body.deliveryMethod;

                        // Calculate total price and quantity for the order
                        let totalQuantity = 0;
                        let totalPrice = 0;


                        for (const item of userCart.Cart.items) {
                            totalQuantity += item.quantity;
                            totalPrice += item.price * item.quantity;
                        }
                        if (selectedPaymentMethod === 'Wallet') {
                            // Fetch the user's wallet
                            const user = await Usercollection.findOne({ email: email });

                            // Add the refunded amount (totalPrice) to the user's wallet
                            // Save the updated wallet balance

                            // Ensure the user has a wallet and sufficient funds
                            if (!user.wallet || user.wallet < totalPrice) {
                                return res.status(400).json({ message: 'Insufficient funds in wallet.' });
                            }
                            const debitTransaction = {
                                type: 'debit',
                                amount: totalPrice,
                                description: 'Payment for order',
                                date: new Date()
                            };

                            // Deduct the total price from the user's wallet balance
                            user.wallet -= totalPrice;
                            user.transactions.push(debitTransaction); // Add the transaction to the user's transaction history
                            await user.save();
                        }
                        if (selectedPaymentMethod === 'Razorpay') {
                            console.log('razooor pay')
                            var instance = new Razorpay({ key_id: 'rzp_test_U3wApGAM5gGpOR', key_secret: 'HyCBL2HkQVecOmAEi44gUonh' })

                            var options = {
                              amount: 50000,  // amount in the smallest currency unit
                              currency: "INR",
                              receipt: "order_rcptid_11"
                            };
                            instance.orders.create(options, function(err, order) {
                              console.log(order);
                              res.json({order})
                            });

                            // Handle Razorpay order creation response
                            

                            // Return the Razorpay order ID and amount to the client-side
                        }

                        // Create a new array for order items
                        const orderItems = userCart.Cart.items.map(item => ({
                            productId: item.productId,
                            productName: item.productName,
                            quantity: item.quantity,
                            price: item.price,
                            paymentMethod: selectedPaymentMethod,
                            images: item.images,
                            deliveryStatus: 'Pending',
                        }));

                // Create a new order
                const order = new Order({
                    userId: userId,
                    items: orderItems,
                    address: req.body.addressId,
                    paymentMethod: selectedPaymentMethod,
                    deliveryStatus: 'Pending',
                    orderDate: new Date(),
                    totalQuantity: totalQuantity,
                    totalPrice: totalPrice,
                });
                console.log('address',order)

                await order.save();
                const orderHistory = new OrderHistory({     
                              userId: userId,
                         items: orderItems,
                        address: req.body.addressId,
                         orderDate: new Date(),
                       });
                      
                       await orderHistory.save();
                       console.log('aaa',orderHistory);

                // Clear the user's cart after placing the order
                userCart.Cart.items = [];
                await userCart.save();

                // Fetch orders for the user
                const orders = await Order.find({ userId: userId });
                res.render('thank', { orders });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Server error' });
            }
        };
        
        const orderPay = async (req, res) => {
                    
            try {
                const email = req.session.user;
                const user = await Usercollection.findOne({ email: email });
                const userId = user._id;

                // Find the user's cart
                const userCart = await Cart.findOne({ userId: userId });
                for (const item of userCart.Cart.items) {
                    const productId = item.productId;
                    const quantityPurchased = item.quantity;

                    // Find the product by ID
                    const product = await Product.findById(productId);
                    

                    if (!product) {
                        return res.status(404).json({ message: 'Product not found.' });
                    }

                    // Check if the available stock is sufficient for the order
                    if (product.stocks < quantityPurchased) {
                        return res.status(400).json({ message: 'Insufficient stock for this product.' });
                    }

                    // Reduce the product's stock by the purchased quantity
                    product.stocks -= quantityPurchased;

                    // Save the updated product
                    await product.save();
                }

                if (!userCart || userCart.Cart.items.length === 0) {
                    return res.status(400).json({ message: 'Cart is empty. Cannot place an order.' });
                }

                // Fetch the selected payment method from the request body
                const selectedPaymentMethod = req.body.deliveryMethod;

                // Calculate total price and quantity for the order
                let totalQuantity = 0;
                let totalPrice = 0;

                for (const item of userCart.Cart.items) {
                    totalQuantity += item.quantity;
                    totalPrice += item.price * item.quantity;
                }
                

                // Create a new array for order items
                const orderItems = userCart.Cart.items.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    price: item.price,
                    paymentMethod:'Razorpay',
                    images: item.images,
                    deliveryStatus: 'Pending',
                }));

        // Create a new order
        const order = new Order({
            userId: userId,
            items: orderItems,
            address: req.body.addressId,
            paymentMethod:'Razorpay',
            deliveryStatus: 'Pending',
            orderDate: new Date(),
            totalQuantity: totalQuantity,
            totalPrice: totalPrice,
        });

        await order.save();
        console.log('razzzr',order)
        const orderHistory = new OrderHistory({     
                      userId: userId,
                 items: orderItems,
                address: req.body.addressId,
                 orderDate: new Date(),
               });
              
               await orderHistory.save();
               console.log('aaa',orderHistory);

        // Clear the user's cart after placing the order
        userCart.Cart.items = [];
        await userCart.save();

        // Fetch orders for the user
        const orders = await Order.find({ userId: userId });
        res.render('thank', { orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const razorpayorder = (req,res) =>{
const amount = req.body.totalamount
console.log('amounts',amount)
var instance = new Razorpay({ key_id: 'rzp_test_U3wApGAM5gGpOR', key_secret: 'HyCBL2HkQVecOmAEi44gUonh' })

var options = {
  amount: amount*100,  // amount in the smallest currency unit
  currency: "INR",
  receipt: "order_rcptid_11"
};
instance.orders.create(options, function(err, order) {
  console.log(order);
  res.json({order})
});
}


// const orderPage = async (req, res) => {
//     try {
//       const email = req.session.user;
//       const user = await Usercollection.findOne({ email: email });
//       const userId = user._id;
  
//       // Find the user's cart
//       const userCart = await Cart.findOne({ userId: userId });
  
//       if (!userCart || userCart.Cart.items.length === 0) {
//         return res.status(400).json({ message: 'Cart is empty. Cannot place an order.' });
//       }
  
//       // Create a new array for order items
//       const orderItems = [];
  
//       // Calculate total price and quantity for each order
//       let totalQuantity = 0;
//       let totalPrice = 0;
  
//       for (const item of userCart.Cart.items) {
//         orderItems.push({
//           productId: item.productId,
//           productName: item.productName,
//           quantity: item.quantity,
//           price: item.price,
//           images: item.images,
//           deliveryStatus: 'Pending',
//         });
  
//         // Calculate total quantity and price for this order item
//         totalQuantity += item.quantity;
//         totalPrice += item.price * item.quantity;
  
//         // Update product stocks based on the quantity in each order item
//         const product = await Product.findById(item.productId);
//         if (product) {
//           product.stocks -= item.quantity;
//           await product.save();
//         }
//       }
  
//       // Create a new order
//       const order = new Order({
//         userId: userId,
//         items: orderItems,
//         address: req.body.addressId,
//         deliveryStatus: 'Pending',
//         orderDate: new Date(),
//         totalQuantity: totalQuantity,
//         totalPrice: totalPrice,
//       });
  
//       await order.save();
  
//       // Add ordered items to the order history
//       const orderHistory = new OrderHistory({
//         userId: userId,
//         items: orderItems,
//         address: req.body.addressId,
//         orderDate: new Date(),
//       });
  
//       await orderHistory.save();
//       console.log('aaa',orderHistory);
  
//       // Clear the user's cart after placing the order
//       userCart.Cart.items = [];
//       await userCart.save();
  
//       const orders = await Order.find({ userId: userId });
//       res.render('thank', { orders });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Server error' });
//     }
//   };

  
  const showPage = async (req, res) => {
    try {
        const email = req.session.user;
        const user = await Usercollection.findOne({ email: email });
        const userId = user._id;  
        const walletBalance = user.wallet;
    
        // Retrieve the user's orders
        const orders = await Order.find({ userId: userId }).populate('userId');
        const cart = await Cart.findOne({ userId: userId });
    
                // Pass the cart length to the EJS template
                const cartLength = cart ? cart.Cart.items.length : 0;

    
        res.render('detail', { walletBalance,orders,cartLength }); // Assuming you have a 'orders' view to display the orders
      } catch (error) {
        console.error(error);
        res.render('login',{message :'User Blocked  Contack Admin'})
      }
    };
    const orderProfile = async (req, res) => {
        try {
          const email = req.session.user;
          const user = await Usercollection.findOne({ email: email });
          const name = user.name;
          const userId = user._id;
      
          // Retrieve the user's orders
          const orders = await Order.find({ userId: userId }).populate('userId');
          const cart = await Cart.findOne({ userId: userId });
          const orderHistory = await OrderHistory.find({ userId: req.session.userId }).populate('items.productId');
          console.log('ordhist',orderHistory)
      
          // Pass the cart length to the EJS template
          const cartLength = cart ? cart.Cart.items.length : 0;
      
          console.log('Orders:', orders); // Log fetched orders for debugging
          console.log('Order History:', orderHistory); // Log fetched order history for debugging
      
          res.render('userorders', { name, orders, cartLength, orderHistory });
        } catch (error) {
          console.error(error);
          res.render('login',{message :'User Blocked  Contack Admin'})
        }
      };
      
const aboutPage=(req,res)=>{
    res.render('product');
}
const contactPage=(req,res)=>{
    res.render('contact')
}
const checkoutPage=(req,res)=>{
    res.render('checkout')
}
const profilePage = async (req, res) => {
    try {
        const email = req.session.user;
        const user = await Usercollection.findOne({ email: email });
        const name = user.name;
        const referralCode = user.referralCode;

        if (!user) {
            return res.status(404).send('User not found');
        }

        const userId = user._id;

        // Query addresses associated with the user
        const addresses = await Address.find({ userId });

        res.render('userprofile', { addresses,email,name,addresses,_id: user,referralCode });
    } catch (error) {
        console.error(error);
        res.render('login',{message :'User Blocked  Contack Admin'})
    }
};
// const orderProfile = async (req, res) => {
//     try {
//         const email = req.session.user;
//         const user = await Usercollection.findOne({ email: email });
//         const name = user.name;

//         if (!user) {
//             return res.status(404).send('User not found');
//         }

//         const userId = user._id;

//         // Query addresses associated with the user
//         const addresses = await Address.find({ userId });

//         res.render('userorders', { addresses,email,name,addresses,_id: user });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error fetching addresses');
//     }
// };
const addressProfile = async (req, res) => {
    try {
        const email = req.session.user;
        const user = await Usercollection.findOne({ email: email });
        const name = user.name;

        if (!user) {
            return res.status(404).send('User not found');
        }

        const userId = user._id;

        // Query addresses associated with the user
        const addresses = await Address.find({ userId });

        res.render('useraddresses', { addresses,email,name,addresses,_id: user });
    } catch (error) {
        console.error(error);
        res.render('login',{message :'User Blocked  Contack Admin'})    }
};

const calculateTotalPrice = (items) => {
    let total = 0;
    items.forEach(item => {
        total += item.price * item.quantity;
    });
    return total;
};
const cartPost = async (req, res) => {
    try {
        const email = req.session.user;
        const id = req.params.id;
        const user = await Usercollection.findOne({ email: email });
        const userId = user._id;
        const walletBalance = user.wallet;

        // Fetch the cart for the user
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({
                userId,
                Cart: { items: [] }
            });
        }

        const productId = req.body.productId;
        const quantity = req.body.quantity;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const existingItem = cart.Cart.items.find(item => item.productId.equals(productId));

        if (existingItem) {
            const totalQuantity = existingItem.quantity + parseInt(quantity, 10);
            if (totalQuantity <= product.stocks) {
                existingItem.quantity = totalQuantity;

                // If the product has a discount, calculate the discounted price
                if (product.discount && product.discount > 0) {
                    existingItem.price = product.discount;
                }
            } else {
                return res.status(400).json({ message: 'Stock exceeded. Cannot add more.' });
            }
        } else {
            const newItem = {
                productId: productId,
                productName: product.name,
                stocks: product.stocks,
                quantity: parseInt(quantity, 10),
                price: product.price,
                discount: product.discount, // By default, set the price as original product price
                images: product.images
            };

            // If the product has a discount, set the discounted price in the cart
            if (product.discount && product.discount > 0) {
                newItem.price = product.discount
            }

            cart.Cart.items.push(newItem);
        }

        cart.Cart.totalAmount = calculateTotalPrice(cart.Cart.items);
        await cart.save();

        const addresses = await Address.find({ userId });

        res.redirect('/cart');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateCart = async (req, res) => {
    try {
        const email = req.session.user;
        const user = await Usercollection.findOne({ email: email });
        const userId = user._id;
        const productId = req.body.productId;
        const adjust = req.body.adjust;
       

        const product = await Product.findById(productId);
        const cart = await Cart.findOne({ userId });
       

        const cartItem = cart.Cart.items.find(item => item.productId.equals(productId));

        if (cartItem) {
            if (adjust === 'add' && cartItem.quantity < product.stocks) {
                cartItem.quantity += 1; // Increase quantity by 1 for 'add' if it's within stock limit
            } else if (adjust === 'subtract' && cartItem.quantity > 1) {
                cartItem.quantity -= 1; // Decrease quantity by 1 for 'subtract' if quantity is greater than 1
            }

            // Update total price
            cart.Cart.totalPrice = calculateTotalPrice(cart.Cart.items);
            await cart.save();
        }

        res.redirect('/cart');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}






const removePage = async (req, res) => {
    try {
        const cartId = req.params.id;
        console.log('CARTID', cartId);
        const email = req.session.user;
        console.log('cart', cartId);
        console.log('email', email);
        const user = await Usercollection.findOne({ email: email });
        const userCart = await Cart.findOne({ userId: user });
        console.log('usercart', userCart);

        if (userCart) {
            // Use filter to remove the item with the specified _id
            userCart.Cart.items = userCart.Cart.items.filter((item) => item._id.toString() !== cartId);
            await userCart.save();
        }
        res.redirect('/cart');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
const placeOrder = async (userId, cartId, addressId) => {
    try {
        // Find the user's cart and selected address
        const cart = await Cart.findById(cartId).populate('items.productId');
        const address = await Address.findById(addressId);

        if (!cart || !address) {
            throw new Error("Cart or address not found.");
        }

        // Calculate the total order amount
        const totalAmount = cart.items.reduce((total, item) => {
            return total + item.quantity * item.price;
        }, 0);

        // Create a new order based on the cart and selected address
        const order = new Order({
            userId: userId,
            items: cart.items,
            address: addressId,
            totalAmount: totalAmount
        });

        // Save the order and update the cart (you may want to clear the cart or mark items as purchased)
        await order.save();

        // You can add code here to update the user's cart, remove purchased items, etc.

        return order;
    } catch (error) {
        throw error;
    }
};
    const loginPage = (req,res)=>{
        if(isUser){
            res.redirect('/')
        }else{
            res.render('login', {message: null});
        }
    }


    const indexGet = async (req, res) => {
        try {
            if (isUser) {
                // Assuming you have access to the user's email in req.session.user
                const email = req.session.user;
                
                // Fetch user data and cart information
                const userdata = await Usercollection.findOne({ email: email });
                const userId = userdata._id;
                
                const cart = await Cart.findOne({ userId: userId });
                    const cartLength = cart ? cart.Cart.items.length : 0;
                    const walletBalance = userdata.wallet;
                    const coupons = await Coupon.find({ active: true });
                    
    
                res.render('index', {walletBalance,cartLength,coupons });
            } else {
                res.redirect('/login');
            }
        } catch (error) {
            console.error(error);
            res.render('login',{message :'User Blocked  Contack Admin'})
        }
    };
    

    const loginPost = async(req, res)=>{
        try{
            const valid = await Usercollection.findOne({email: req.body.email});
            let blocked = valid.isBlocked;
            console.log(blocked);
            console.log(valid);
            if(req.body.password === valid?.password && !blocked){
                isUser= true
                req.session.user=valid.email
                const x=req.session.user
                console.log(x);
                res.redirect('/');
            }else if(blocked){
                res.render('login', {message:'Account blocked'})
            }
            else{
                res.render('login', {message: "Invalid username/password"});
            }
        }catch(err){
            console.error(err.message);
            res.status(500).json('Internal server error');
        }
    }
    const namePage = async(req, res) => {
        try {
            const email = req.session.user;
            const user = await Usercollection.findOne({ email: email });
            const name = user.name;
    
            if (!user) {
                return res.status(404).send('User not found');
            }
    
            const userId = user._id;
    
            // Query addresses associated with the user
            const addresses = await Address.find({ userId });
    
            res.render('changeusername', {name,_id: user });// Render a page with a form to change the username
      }
      catch{
        res.render('login',{message :'User Blocked  Contack Admin'})
      }
    }

      // Handle the POST request to update the username
const namePost = async (req, res) => {
    const newUsername = req.body.newUsername;
    const email = req.session.user; // Get the current user's email
  
    try {
      // Find the user by email
      const user = await Usercollection.findOne({ email: email });
  
      if (user) {
        user.name = newUsername; // Update the user's name
        await user.save(); // Save the updated user
  
        // Redirect to the profile page or another appropriate page
        res.redirect('/profile');
      } else {
        res.render('error', { message: 'User not found' });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json('Internal server error');
    }
  };
  const adressPage = async (req,res)=>{
    const email = req.session.user;
    const user = await Usercollection.findOne({ email: email })//;
   // const user = await Usercollection.findOne({ email: email });
        const name = user.name;
        const userId = user._id;
    res.render('AddAdress',{_id: userId,name})
  }
//   const addressPage = async (req, res) => {
//     try {
//         const userId=await Usercollection.findById(id);
//       const addresses = await Address.find();
//       res.render('addresses', { addresses }); // Render an EJS page to display all addresses
//     } catch (error) {
//       console.error(error);
//       res.status(500).send('Error fetching addresses');
//     }
//   };

const addressPost = async (req, res) => {
    try {
        const email = req.session.user;
        const user = await Usercollection.findOne({ email: email });

        if (!user) {
            return res.status(404).send('User not found');
        }

        const userId = user._id;
        const { state, district, address, pincode } = req.body;

        const newAddress = new Address({
            userId: userId, // Associate the address with the user
            state,
            district,
            address,
            pincode,
        });

        await newAddress.save(); // Save the address to the database
        res.redirect('/useraddress'); // Redirect to a page that displays all addresses
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding address');
    }
};
// Route for rendering the edit address form
const editAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        console.log('addreid',addressId);
        const address = await Address.findById(addressId);
        console.log('addreid',address);
        const email = req.session.user;
    const user = await Usercollection.findOne({ email: email })//;
   // const user = await Usercollection.findOne({ email: email });
        const name = user.name;
        const userId = user._id;

        if (!address) {
            return res.status(404).send('Address not found');
        }

        res.render('editAddress', { address: address,_id: userId,name });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching address');
    }
};

  const displayAddresses = async (req, res) => {
    try {
      const email = req.session.user;
      const user = await Usercollection.findOne({ email: email });
  
      if (!user) {
        // Handle the case when the user is not found
        return res.status(404).send('User not found');
      }
  
      // Query the addresses associated with the user
      const userAddresses = await Address.find({ userId: user._id });
  
      // Render a view with the user's addresses
      res.render('addresses', { addresses: userAddresses });
    } catch (error) {
      console.error(error);
      res.render('login',{message :'User Blocked  Contack Admin'})
    }
  };
  const editPost = async (req, res) => {
    try {
        const email = req.session.user;
        const user = await Usercollection.findOne({ email: email });

        if (!user) {
            return res.status(404).send('User not found');
        }

        const userId = user._id;
        const addressId = req.params.id; // Get the address ID from the request parameters
        const { state, district, address, pincode } = req.body;

        // Find the address to be updated
        const existingAddress = await Address.findOne({ _id: addressId, userId: userId });

        if (!existingAddress) {
            return res.status(404).send('Address not found');
        }

        // Update the address fields
        existingAddress.state = state;
        existingAddress.district = district;
        existingAddress.address = address;
        existingAddress.pincode = pincode;

        await existingAddress.save(); // Save the updated address to the database
        res.redirect('/useraddress'); // Redirect to the profile page after editing
    } catch (error) {
        console.error(error);
        res.status(500).send('Error editing address');
    }
};
const deleteAddress = async (req, res) => {
    try {
        const email = req.session.user;
        const user = await Usercollection.findOne({ email: email });

        if (!user) {
            return res.status(404).send('User not found');
        }

        const userId = user._id;
        const addressId = req.params.id; // Get the address ID from the request parameters

        // Find the address to be deleted
        const address = await Address.findOne({ _id: addressId, userId: userId });

        if (!address) {
            return res.status(404).send('Address not found');
        }

        await Address.findByIdAndDelete(addressId); // Delete the address
        res.redirect('/useraddress'); // Redirect to the profile page after deletion
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting address');
    }
};

  const deliveryPage = async (req, res) => {
    try {
        // Retrieve necessary data
        const productId = req.query.productId;
        const quantity = req.body.quantity;
        console.log('ssssssuuuii',quantity) // This should contain the updated quantity
        const email = req.session.user;
        const userdata = await Usercollection.findOne({ email: email });
        const userId = userdata._id;
        const product = await Product.findById(productId);
        const addresses = await Address.find({ userId });
        
        const cart = await Cart.findOne({ userId: userId });
        
        
        if (!cart) {
            return res.redirect('/');
        }
        const updatedQuantity = cart && cart.Cart.items.find(item => item.productId.equals(productId));
        console.log(quantity);
        if (updatedQuantity) {
            // If the product exists, update the quantity
            updatedQuantity.quantity += parseInt(quantity, 10); // Ensure quantity is treated as a number
            console.log('suiiiiieeee',updatedQuantity.quantity);
        }
        
      
        const calculateTotalPrice = (items) => {
            let total = 0;
            items.forEach(item => {
                total += item.price * item.quantity;
            });
            return total;
        };

        const totalPrice = calculateTotalPrice(cart.Cart.items);
        cart.Cart.totalPrice = totalPrice;

        // Render checkout with updated quantities
        const razorpayConfig = {
            key_id: 'rzp_test_U3wApGAM5gGpOR',
            key_secret: 'HyCBL2HkQVecOmAEi44gUonh',
            
        };
        let discountPercentage
        let message
        let CouponApplied
        let code
        res.render('checkout', { calculateTotalPrice,message,code,CouponApplied,discountPercentage,product,userdata,razorpayConfig, userCart: cart, addresses });

    } catch (error) {
        console.error(error);
        res.render('login',{message :'User Blocked  Contack Admin'})
    }
};
const orderDetail = async (req, res) => {
    try {
      const orderId = req.params.orderId;
      console.log('Order ID:', orderId);
  
      // Fetch the order details based on orderId
      const order = await Order.findById(orderId)
      .populate('userId')
      .populate('items.productId')
      .populate('address'); 
      console.log('oder',order)  
      if (!order) {
        // If order is not found, handle accordingly
        return res.status(404).render('error', { message: 'Order not found' });
      }
  
      // Calculate the total price of the items
      let totalPrice = 0;
      order.items.forEach((item) => {
        totalPrice += item.price * item.quantity;
      });
  
      // Log the total price
      const address = order.address; 
      console.log('add',address)
      console.log('Total Price:', totalPrice);
  
      // Render the order details page with the order data
      res.render('orderDetail', { order, totalPrice,address });
    } catch (error) {
      console.error(error);
      res.render('login',{message :'User Blocked  Contack Admin'})
    }
  };
  
  

  const orderPost = async (req, res) => {
    try {
    //   const email = req.session.user;
    //   const user = await Usercollection.findOne({ email: email });
    //   const userId = user._id;
  
      // Find the user's cart
      const userCart = await Cart.findOne({ userId: userId });
  
      if (!userCart || userCart.Cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty. Cannot place an order.' });
      }
  
      // Create a new array for order items
      const orderItems = [];
  
      // Copy the items from the cart to the order
      userCart.Cart.items.forEach(item => {
        orderItems.push({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          images: item.images,
        });
      });
               console.log('oorder',orderItems)
      // Create a new order
      const order = new Order({
        userId: userId,
        items: orderItems, // Use the new order items array
        address: req.body.addressId, // Use the selected address from the request
        orderDate: new Date(),
      });
  
      await order.save();
  
      // Clear the user's cart after placing the order
      userCart.Cart.items = [];
      await userCart.save();
  
      res.status(201).json({ message: 'Order placed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  


    const signupPage=(req,res)=>{
       let passwordError
        res.render('signup',{ passwordError })
    }
  
const signupPost = async(req, res)=>{
     try {
        details = {
           name: req.body.username,
            email: req.body.email,
            password: req.body.password
        }
        const code = req.body.referralCode


        // Regular expression for a strong password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!passwordRegex.test(details.password)) {
            const passwordError = 'Password should be Strong';
        res.render('signup',{ passwordError })
            
             
        }
        const valid = await Usercollection.findOne({email: req.body.email});
           if (valid) {
            const message = "Your email is already registered. Please log in.";
                res.render('login', { message });
           }
           let referringUser = null;

    if (code) {
      referringUser = await Usercollection.findOne({ referralCode: code });
      console.log('uszzspotted',referringUser)
      if (!referringUser) {
        // Invalid referral code, proceed without referring user
        console.log("Invalid referral code provided");
      } else {
        // Update the referring user's wallet with 50 units
        referringUser.wallet += 50;
        referringUser.transactions.push({
            type: 'credit',
            amount: 50,
            description: 'Referral Bonus',
            date: new Date()
            // You might want to add more details to the transaction like a description or date
          });
        await referringUser.save();

        req.session.refferal='true'
      }
    }
            otp = generate_otp.generate(6, { digits: true, alphabets: false, specialChars: false });
            req.session.Otp = otp;
            console.log("otte",otp)

            
            
       
        const mailOptions = { 
            from: 'footwearZ',
            to: `${details.email}`,
            subject: 'Your OTP Code',
            text:`Your OTP code is: ${otp}`
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.log('Error sending email: ' + error);
          } else {
              console.log('Email sent: ' + info.response);
          }
          isOtp = true;
          const otpExpiryTime = 1 * 60 * 1000; // 1 minute in milliseconds

            setTimeout(() => {
                console.log("jjhd")
                console.log('Timeout executed');
                delete req.session.Otp;
                isOtp = false
                console.log("mann",isOtp)
        
              }, otpExpiryTime);
          res.redirect('/otp')
      });
const otpExpiryTime = 1 * 60 * 1000; // 1 minute in milliseconds

setTimeout(() => {
    console.log("jjhd")
    console.log('Timeout executed');
    delete req.session.Otp;
    isOtp = false
    console.log("mann",isOtp)

  }, otpExpiryTime);
        } catch (error) {
            console.log(error.message);
            res.status(500).json('Internal server error')
        }
    }
    const resendOtp = async (req, res, email) => {
        console.log('hello planet')
      try {
           otp = generate_otp.generate(6, { digits: true, alphabets: false, specialChars: false });
           req.session.Otp = otp;
           console.log("ote",otp)
          
          
       const mailOptions = { 
           from: 'footwearZ',
           to: `${details.email}`,
           subject: 'Your OTP Code',
           text:`Your OTP code is: ${otp}`
       };
            transporter.sendMail(mailOptions, (error, info) => {
       if (error) {
                     console.log('Error sending email: ' + error);
         } else {
             console.log('Email sent: ' + info.response);
        }
        isOtp = true;
        const otpExpiryTime = 1 * 60 * 1000; // 1 minute in milliseconds
        res.render('verify-otp',{message: "OTP Resended"})

        setTimeout(() => {
            console.log("jjhd")
            console.log('Timeout executed');
            delete req.session.Otp;
            isOtp = false
            console.log("mann",isOtp)
    
          }, otpExpiryTime);
        // res.redirect('/otp')
    });
res.render('verify-otp',{message: "OTP Resended"})
      } catch (error) {
           console.log(error.message);
           res.status(500).json('Internal server error')
       }
    };
   
  
    
    
    
    // 1 minute in milliseconds

const sendOtp = async (req, res) => {
 try {
    // ... (previous code)

    // Set a timeout to remove the OTP from the session after the expiry time
    setTimeout(() => {
        console.log("jjhd")
        console.log('Timeout executed');
        // delete req.session.Otp;
        req.session.Otp = null

      }, otpExpiryTime);
      
    // ... (previous code)
 } catch (error) {
    console.log(error.message);
    res.status(500).json('Internal server error')
 }
}



    const otpGet = (req, res)=>{
      try {
        if(isOtp){
            
            res.render('verify-otp',{message: null});
        }else{
            res.redirect('/signup')
        }
      } catch (err) {
        res.status(500).json("Internal server error");
      }
    }
    
    

    const otpPost = async (req, res) => {
        try {
           const userOtp = req.body.otp;
           otp = req.session.Otp;
           console.log("brwww",req.session.Otp)
           console.log('OOtp',otp)
           
           

           
       
           if (otp) {
             if (userOtp === otp) {
                const referralCode = generateReferralCode();
                        function generateReferralCode() {
                return Math.floor(10000 + Math.random() * 90000).toString();
                }

                newUser = await Usercollection.create({ ...details, referralCode });


              if(req.session.refferal){
                newUser.wallet += 100;
                newUser.transactions.push({
                    type: 'credit',
                    amount: 100,
                    description: 'Referral Signup Bonus',
                    date: new Date()
                  });
                await newUser.save();
                req.session.refferal = null
                res.redirect('/login')
              }else{
                res.redirect('/login')     
                
              }
                   
             } else {
               res.render('verify-otp', { message: "Invalid otp/Expired Otp" });
             }
           } else {
             res.render('verify-otp', { message: "OTP has expired" });
           }
      }catch(err){
        console.log(err.message)
        res.redirect('/signup')
              
      }
    }
    const thankPage = async(req,res)=>{
      try{
        res.render('thank')
      }
       catch{
        console.log('Error')
       }
    }
    const removePost = async (req, res) => {
        try {
            const orderId = req.params.orderId;
            const itemIdToRemove = req.body.itemId;
    
            // Find the order by ID
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
    
            // Find the item to remove within the items array
            const itemToRemove = order.items.find(item => item._id.toString() === itemIdToRemove);
    
            if (!itemToRemove) {
                return res.status(404).json({ message: 'Item not found in order' });
            }
    
            const productId = itemToRemove.productId;
            const quantityToRestore = itemToRemove.quantity;
            const pricePerItem = itemToRemove.price;
    
            // Fetch the user associated with the order
            const email = req.session.user;
            const user = await Usercollection.findOne({ email: email });
            const product = await Product.findById(productId);
    
            if (product) {
                product.stocks += quantityToRestore;
                await product.save();
            }
            console.log('reemm',itemToRemove.paymentMethod)
    
            // Check if payment method is 'Wallet'
            if (itemToRemove.paymentMethod === 'Wallet') {
                const totalPrice = quantityToRestore * pricePerItem;
    
                // Refund the amount to the user's wallet
                const creditTransaction = {
                    type: 'credit',
                    amount: totalPrice,
                    description: 'Refund for returned item',
                    date: new Date()
                };
                
                 // Add the transaction to the user's transaction history
                user.wallet += totalPrice;
                user.transactions.push(creditTransaction);
                await user.save();
            }
            if (itemToRemove.paymentMethod === 'Razorpay') {
                const totalPrice = quantityToRestore * pricePerItem;
    
                // Refund the amount to the user's wallet
                const creditTransaction = {
                    type: 'credit',
                    amount: totalPrice,
                    description: 'Refund for returned item',
                    date: new Date()
                };
                
                 // Add the transaction to the user's transaction history
                user.wallet += totalPrice;
                user.transactions.push(creditTransaction);
                await user.save();
            }
    
            // Check if the item is delivered or not and handle accordingly
            if (itemToRemove.deliveryStatus === 'Delivered') {
                // Remove the item using filter to get the updated items array
                itemToRemove.deliveryStatus = 'Cancelled';
                await order.save();
                // Regain product stocks if necessary
            } else {
                // Item not delivered, just remove it from the order
                itemToRemove.deliveryStatus = 'Cancelled';
                await order.save();
            }
    
            res.redirect('/detail'); // Redirect to appropriate page after handling the order removal
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    };
    const removePostt = async (req, res) => {
        try {
            const orderId = req.params.orderId;
            const itemIdToRemove = req.body.itemId;
    
            // Find the order by ID
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
    
            // Find the item to remove within the items array
            const itemToRemove = order.items.find(item => item._id.toString() === itemIdToRemove);
    
            if (!itemToRemove) {
                return res.status(404).json({ message: 'Item not found in order' });
            }
    
            const productId = itemToRemove.productId;
            const quantityToRestore = itemToRemove.quantity;
            const pricePerItem = itemToRemove.price;
    
            // Fetch the user associated with the order
            const email = req.session.user;
            const user = await Usercollection.findOne({ email: email });
            const product = await Product.findById(productId);
    
            if (product) {
                product.stocks += quantityToRestore;
                await product.save();
            }
            console.log('reemm',itemToRemove.paymentMethod)
    
            // Check if payment method is 'Wallet'
            if (itemToRemove.paymentMethod === 'Wallet') {
                const totalPrice = quantityToRestore * pricePerItem;
    
                // Refund the amount to the user's wallet
                const creditTransaction = {
                    type: 'credit',
                    amount: totalPrice,
                    description: 'Refund for returned item',
                    date: new Date()
                };
                
                 // Add the transaction to the user's transaction history
                user.wallet += totalPrice;
                user.transactions.push(creditTransaction);
                await user.save();
            }
            if (itemToRemove.paymentMethod === 'Razorpay') {
                const totalPrice = quantityToRestore * pricePerItem;
    
                // Refund the amount to the user's wallet
                const creditTransaction = {
                    type: 'credit',
                    amount: totalPrice,
                    description: 'Refund for returned item',
                    date: new Date()
                };
                
                 // Add the transaction to the user's transaction history
                user.wallet += totalPrice;
                user.transactions.push(creditTransaction);
                await user.save();
            }
    
            // Check if the item is delivered or not and handle accordingly
            if (itemToRemove.deliveryStatus === 'Delivered') {
                // Remove the item using filter to get the updated items array
                itemToRemove.deliveryStatus = 'Cancelled';
                await order.save();
                // Regain product stocks if necessary
            } else {
                // Item not delivered, just remove it from the order
                itemToRemove.deliveryStatus = 'Cancelled';
                await order.save();
            }
    
            res.redirect('/userorders'); // Redirect to appropriate page after handling the order removal
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    };
    
    

    
      const remover = async (req, res) => {
        try {
          const orderId = req.params.orderId;
          const itemIdToRemove = req.body.itemId;
      
          // Find the order by ID
          const order = await Order.findById(orderId);
      
          if (!order) {
            return res.status(404).json({ message: 'Order not found' });
          }
      
          // Filter the items array to exclude the item to remove
          order.items = order.items.filter(item => item._id.toString() !== itemIdToRemove);
      
          // Save the updated order
          await order.save();
      
          res.redirect('/detail');
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Server error' });
        }
      };
      const removerr = async (req, res) => {
        try {
          const orderId = req.params.orderId;
          const itemIdToRemove = req.body.itemId;
      
          // Find the order by ID
          const order = await Order.findById(orderId);
      
          if (!order) {
            return res.status(404).json({ message: 'Order not found' });
          }
      
          // Filter the items array to exclude the item to remove
          order.items = order.items.filter(item => item._id.toString() !== itemIdToRemove);
      
          // Save the updated order
          await order.save();
      
          res.redirect('/userorders');
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Server error' });
        }
      };
      
      


      const returnPostt = async (req, res) => {
        const orderId = req.params.orderId; // Get the order ID from the request parameters
  const itemId = req.body.itemId; // Get the item ID from the request body
  const returnReason = req.body.returnReason; // Get the return reason from the request body

  try {
    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find the item in the order's items array
    const item = order.items.find((item) => item._id.toString() === itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found in the order" });
    }

    // Check if the item can be returned (e.g., it's in a 'Delivered' status)
    if (item.deliveryStatus !== 'Delivered') {
      return res.status(400).json({ message: "Item cannot be returned" });
    }

    // Update the delivery status and add return reason
    item.deliveryStatus = 'Returned';
    item.returnReason = returnReason;

    // Calculate the refund amount based on quantity and price
    const refundAmount = item.quantity * item.price;

    // Update the user's wallet by adding the refund amount
    const user = await Usercollection.findOneAndUpdate(
        { _id: order.userId },
        { $inc: { wallet: refundAmount } }, // Increment the wallet by refund amount
        { new: true }
    );
    
    // Create a credit transaction record
    const creditTransaction = {
        type: 'credit',
        amount: refundAmount,
        description: 'Refund for returned item',
        date: new Date()
    };
    
    user.transactions.push(creditTransaction); // Add the transaction to the user's transaction history
    await user.save();

    // Restore the product stock by adding the returned quantity
    const product = await Product.findById(item.productId);
    if (product) {
      product.stocks += item.quantity; // Restore the product quantity
      await product.save(); // Save the updated product quantity
    }

    // Save the changes to the order
    await order.save();

    // Redirect to a success page after returning the item
    // Change '/success-page' to the route or URL where you want to redirect
    return res.redirect('/detail');
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
const returnPost = async (req, res) => {
    const orderId = req.params.orderId; // Get the order ID from the request parameters
const itemId = req.body.itemId; // Get the item ID from the request body
const returnReason = req.body.returnReason; // Get the return reason from the request body

try {
// Find the order by ID
const order = await Order.findById(orderId);

if (!order) {
  return res.status(404).json({ message: "Order not found" });
}

// Find the item in the order's items array
const item = order.items.find((item) => item._id.toString() === itemId);

if (!item) {
  return res.status(404).json({ message: "Item not found in the order" });
}

// Check if the item can be returned (e.g., it's in a 'Delivered' status)
if (item.deliveryStatus !== 'Delivered') {
  return res.status(400).json({ message: "Item cannot be returned" });
}

// Update the delivery status and add return reason
item.deliveryStatus = 'Returned';
item.returnReason = returnReason;

// Calculate the refund amount based on quantity and price
const refundAmount = item.quantity * item.price;

// Update the user's wallet by adding the refund amount
const user = await Usercollection.findOneAndUpdate(
    { _id: order.userId },
    { $inc: { wallet: refundAmount } }, // Increment the wallet by refund amount
    { new: true }
);

// Create a credit transaction record
const creditTransaction = {
    type: 'credit',
    amount: refundAmount,
    description: 'Refund for returned item',
    date: new Date()
};

user.transactions.push(creditTransaction); // Add the transaction to the user's transaction history
await user.save();

// Restore the product stock by adding the returned quantity
const product = await Product.findById(item.productId);
if (product) {
  product.stocks += item.quantity; // Restore the product quantity
  await product.save(); // Save the updated product quantity
}

// Save the changes to the order
await order.save();

// Redirect to a success page after returning the item
// Change '/success-page' to the route or URL where you want to redirect
return res.redirect('/userorders');
} catch (error) {
return res.status(500).json({ message: "Internal server error", error: error.message });
}
};

      
      
    
    
      
    

    const productpage = async (req, res) => {
        try {
            const id = req.params.id;
            const productData = await Product.findById(id);
            const userId = await Usercollection.findById(id);
            const addresses = await Address.find({ userId });
            const cart = await Cart.findOne({ userId: userId });
            const cartLength = cart ? cart.Cart.items.length : 0;
            const wishlist = await Wishlist.findOne({ user: userId }).populate('products');

                let productInWishlist = false;

                if (wishlist) {
                    productInWishlist = productData.map(product => {
                        const inWishlist = wishlist.products.some(wishlistProduct => wishlistProduct._id.equals(product._id))
                        return { ...product._doc, inWishlist };

                    });
                }
                console.log('pordd',productInWishlist)

                res.render('product', {
                    _id: userId,
                    wishlist,
                    productData,
                    addresses,
                    cartLength,
                    productInWishlist,
                    products:productInWishlist,
                });

        } catch (error) {
            console.error(error);
            res.render('login',{message :'User Blocked  Contack Admin'})
        }
    };
    
    
    const whislistPage = async (req, res) => {
        try {
            const email = req.session.user;
            const user = await Usercollection.findOne({ email: email });
            const userId = user._id;
            const productId = req.body.productId;
    
            const product = await Product.findById(productId);
    
            // Check if the user already has the product in the wishlist
            const userWishlist = await Wishlist.findOne({ user: userId });
    
            if (userWishlist && userWishlist.products.includes(productId)) {
                console.log('Product is already in the wishlist:', product);
            } else {
                // Add the product to the wishlist if it's not already there
                await Wishlist.findOneAndUpdate(
                    { user: userId },
                    { $addToSet: { products: productId } },
                    { upsert: true }
                );
                console.log('Product added to wishlist:', product);
            }
    
            // Redirect to the wishlist page or wherever needed
            res.redirect('/wishList');
        } catch (error) {
            console.error('Error adding product to wishlist:', error);
            res.render('login',{message :'User Blocked  Contack Admin'})        }
    };
    
    
    

    
    
    const wishShow = async (req, res) => {
        try {
            const email = req.session.user;
            const userdata = await Usercollection.findOne({ email: email });
            const userId = userdata._id;
            const cart = await Cart.findOne({ userId: userId });

            // Pass the cart length and product data to the EJS template
            const cartLength = cart ? cart.Cart.items.length : 0;
    
            const productId = req.query.productId;
            const id = req.params.id;
    
            const product = await Product.findById(productId);
    
            const userWishlist = await Wishlist.findOne({ user: userId }).populate('products');
            const productData = await Product.findById(id);
    
            res.render('whishList', { cartLength,wishlist: userWishlist, productData });
        } catch (error) {
            console.error('Error displaying wishlist: ' + error);
            res.render('login',{message :'User Blocked  Contack Admin'})        }
    };
    
    const removeWishlist = async (req, res) => {
        try {
            const email = req.session.user;
            const user = await Usercollection.findOne({ email: email });
            const userId = user._id;
            const productId = req.body.productId;
    
            // Find the user's wishlist
            const userWishlist = await Wishlist.findOne({ user: userId });
    
            if (!userWishlist) {
                // Wishlist doesn't exist, no items to remove
                return res.status(404).send('Wishlist not found');
            }
    
            // Check if the product is in the wishlist
            const productIndex = userWishlist.products.indexOf(productId);
            if (productIndex !== -1) {
                // Remove the product from the wishlist
                userWishlist.products.splice(productIndex, 1);
                await userWishlist.save();
            } else {
                // Product not found in the wishlist
                return res.status(404).send('Product not found in wishlist');
            }
    
            res.redirect('/wishlist'); // Redirect to the home page or any desired page
        } catch (error) {
            console.error('Error removing product from wishlist: ' + error);
            res.status(500).send('Internal Server Error');
        }
    };
    
    const changePassword = async(req,res) =>{
        try {
            const email = req.session.user;
            const user = await Usercollection.findOne({ email: email });
            const name = user.name;
    
            if (!user) {
                return res.status(404).send('User not found');
            }
    
            const userId = user._id;
    
            // Query addresses associated with the user
            const addresses = await Address.find({ userId });
            res.render('ChangePassword', {name,_id: user });
    }
    catch{
        res.render('sampl')
    }
}
    const changePost = async (req, res) => {
        console.log('passwordeeeeee')
        const { oldPassword, newPassword } = req.body;
        const email = req.session.user; // Get the user's email from the 
        const user = await Usercollection.findOne({ email: email });
            const name = user.name;
    
        try {
            const user = await Usercollection.findOne({ email });
            if (!user) {
                res.render('ChangePassword', { _id: user ,name,message: 'User not found' });
                return;
            }
    
            if (user.password === oldPassword) {
                // Update the user's password with the new one
                user.password = newPassword;
                await user.save();
                res.redirect('/profile'); // Redirect to the profile page or any other page you want
            } else {
                res.render('ChangePassword',{ _id: user ,name,message: 'Old password incorrect' });
            }
        } catch (err) {
            console.error(err.message);
            res.status(500).json('Internal server error');
        }
    };
    const TRANSACTIONS_PER_PAGE = 25; // Number of transactions to display per page

    const viewWalletTransactions = async (req, res) => {
        try {
            const email = req.session.user; // Assuming the user's email is stored in the session
            const user = await Usercollection.findOne({ email: email });
    
            if (!user) {
                res.render('login',{message :'User Blocked  Contack Admin'})   
            }
    
            const walletTransactions = user.transactions; // Assuming transactions is the array containing transaction history
    
            const page = req.query.page || 1; // Get the requested page number from the query parameters
    
            const totalTransactions = walletTransactions.length; // Get the total number of transactions
    
            const startIndex = (page - 1) * TRANSACTIONS_PER_PAGE;
            const endIndex = page * TRANSACTIONS_PER_PAGE;
    
            const transactions = walletTransactions.slice(startIndex, endIndex); // Get transactions for the current page
    
            // Format dates in transactions array using moment.js
            transactions.forEach(transaction => {
                transaction.date = moment(transaction.date).format('YYYY-MM-DD HH:mm:ss');
            });
    
            const totalPages = Math.ceil(totalTransactions / TRANSACTIONS_PER_PAGE); // Calculate total pages
    
            res.render('walletTransactions', { transactions, currentPage: page, totalPages, moment });

        } catch (error) {
            console.error(error);
            res.render('login',{message :'User Blocked  Contack Admin'})        }
    };
    
    
   
    
    
    

    const userLogout = (req, res) =>{
        isUser = false;
        res.redirect('/login');
    }
    exports.isLoggedIn = (req, res, next) => {
        if (req.isAuthenticated()) {
           return next();
        }
        res.redirect('/login');
       };
module.exports = {
    menPage,
    womenPage,
    indexGet,
    cartPage,
    contactPage,
    signupPost,
    razorpayorder,
    userLogout,
    checkoutPage,
    aboutPage,
    couponRemove,
    loginPage,
    otpGet,
    otpPost,
    resendOtp,
    loginPost,
    signupPage,
    sendOtp,
    productpage,
    editAddress,
    cartPost,
    updateCart,
    profilePage,
    orderProfile,
    addressProfile,
    editPost,
    removePage,
    downloadInvoice,
    changePassword,
    changePost,
    namePage,
    namePost,
    adressPage,
    addressPost,
    //addressPage,
    displayAddresses,
    viewWalletTransactions,
    deleteAddress,
    orderPage,
    orderPost,
    orderPay,
    orderDetail,
    couponPost,
    showPage,
    removePost,
    returnPost,
    remover,
    returnPostt,
    removePostt,
    removerr,
    thankPage,
    deliveryPage,
    removeWishlist,
    wishShow,
    whislistPage,


}