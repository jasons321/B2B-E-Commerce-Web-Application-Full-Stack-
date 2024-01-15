//Initializations + dependencies to access certain libraries in nodeJs
const express = require('express');

var app = express();
var bodyParser = require('body-parser');

require("dotenv").config();


const pt = process.env.PORT || 5001;
var connection = require('./database');
const path = require('path');


var multer = require('multer')
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
var moment = require('moment');
const cron = require('node-cron');
const bcrypt = require('bcryptjs');
const Crypto = require('crypto')
var easyinvoice = require('easyinvoice');
var fs = require('fs');
const { reset } = require('browser-sync');
const e = require('express');
const { resolve } = require('path');
const { query } = require('express');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser())
app.use(express.static('public'))

//Relative route to css/javascript/images 
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/images', express.static(__dirname + 'public/images'))

//All general functions/queries needed in the routes 

//Function that takes in a query and returns a promise 
//source: https://stackoverflow.com/questions/60928216/how-can-i-make-my-node-js-mysql-connection-as-a-promise-work
function queryDb(query) {
    return new Promise((resolve, reject) => {
        //Creates a connection to the database using connection. 
        connection.query(query, (err, result) => {
            if (err) {
                return reject(err);
            }
            //Returns the result by resolving in the form of a promise 
            resolve(result);
        });
    })
}


function queryDbWithId(query, newProduct) {
    return new Promise((resolve, reject) => {
        connection.query(query, newProduct, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result.insertId);
        });
    })
}

// Source: https://www.youtube.com/watch?v=mbsmsi7l3r4&t=1052s&ab_channel=WebDevSimplified - setting up jwt token functionality
// Source: https://www.youtube.com/watch?v=894seNhONF8&ab_channel=AlextheEntreprenerd - why use http only cookies
// Source:https://keikaavousi.medium.com/nodejs-authentication-with-jwt-and-cookies-3fb1c8c739ba auth cookie setup 

//Middleware used to authenticate the user's access token or refresh token 
function authenticateToken(req, res, next) {
    //Retrieve the access token from the http only cookie 
    const accessToken = req.cookies.accessToken
    //If there is no access token then the user is not logged in --> redirects to the login page 
    if (accessToken == null) {
        return res.redirect('/login')
    } else {

        //Verify that the token is valid by passsing in the token secret and the accessToken 
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, userInformation) => {
            if (err) {
                //If there is an error, call a function to generates a new access token as there is a token but it is invalid 
                var newAccessToken = generateNewAccessToken(req.cookies.refreshToken)
                //If there is no refresh token it might have been expired --> redirect to the login page so that users can 
                //receive a new token 
                if (newAccessToken.newToken == null) {
                    return res.redirect('/login')
                }
                //Otherwise store the decoded userInformation within the JWT token into req.userInformation which can be access by the requesting api
                else {
                    req.userInformation = newAccessToken.user
                    next()
                    //Also storest the new access token 
                    return res.cookie('accessToken', newAccessToken.newToken, { maxAge: 100000000000, httpOnly: true })
                }
                //This is called if the jwt access token is valid 
            } else if (userInformation) {
                req.userInformation = userInformation
                next()
            }
        })
    }
}

// Source: https://www.youtube.com/watch?v=mbsmsi7l3r4&t=1052s&ab_channel=WebDevSimplified - setting up jwt token functionality
function generateNewAccessToken(refreshToken) {
    if (refreshToken == null) {
        return null
    }
    var newToken
    var userInformation
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, returnedResult) => {
        if (err) return res.sendStatus(403)
        const user = {
            userID: returnedResult.userID,
            status: returnedResult.status
        }
        var newaccess = generateAccessToken(user)
        newToken = newaccess
        userInformation = returnedResult
    })
    return {
        newToken: newToken,
        user: userInformation
    }
}

// Source: https://www.youtube.com/watch?v=mbsmsi7l3r4&t=1052s&ab_channel=WebDevSimplified - setting up jwt token functionality
function generateAccessToken(userInformation) {
    return jwt.sign(userInformation, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10s' })
}

// Source: https://www.youtube.com/watch?v=mbsmsi7l3r4&t=1052s&ab_channel=WebDevSimplified - setting up jwt token functionality
function generateRefreshToken(userInformation) {
    return jwt.sign(userInformation, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })

}

function generateStatusToken(requestedEmail, requestedPassword) {
    //Use a promise keyword to indicate that it is used for async function 
    //Return keyword for an async function 
    return new Promise(async (resolve, reject) => {
        //QueryDb is a wrapper that takes in a query and resolves the results stored in the following variable
        const users = await queryDb('SELECT * FROM user_info')
        //Convert the returned value in a readable format 
        var allUsers = JSON.parse(JSON.stringify(users));
        //Initialize a status as not found 
        var status = "Not Found"
        //Cycle through all the users and find one that matches with the requested password/email
        for (specificUser in allUsers) {
            //Condition: if password matches with the email 
            //source: https://www.youtube.com/watch?v=Ud5xKCYQTjM&ab_channel=WebDevSimplified
            if (requestedEmail == allUsers[specificUser].email && await bcrypt.compare(requestedPassword, allUsers[specificUser].password)) {
                //Create a user object container the ID and status 
                const user = {
                    userID: allUsers[specificUser].userID,
                    status: allUsers[specificUser].status
                }
                //Determine if the user's role/status 
                if (allUsers[specificUser].status == "USER") {
                    status = "USER"
                }
                else if (allUsers[specificUser].status == "ADMIN") {
                    status = "ADMIN"
                }
                else if (allUsers[specificUser].status == "LOGISTICS") {
                    status = "LOGISTICS"
                }
                //Calls a function to generate the token 
                // Source: https://www.youtube.com/watch?v=mbsmsi7l3r4&t=1052s&ab_channel=WebDevSimplified - setting up jwt token functionality
                var accessToken = generateAccessToken(user);
                var refreshToken = generateRefreshToken(user)
            }
        }
        //Resolve results in the form of an object 
        resolve({
            status: status,
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    });
}


function editmodel(variantName, quantity, price, variantID) {
    return new Promise((resolve, reject) => {
        connection.query("UPDATE `variant` SET `variantname`=?,`quantity`=?,`price`=? where `idvariant`=?", [variantName, quantity, price, variantID], function (error, results, fields) {
            resolve(JSON.parse(JSON.stringify(results)));
        });
    });
}

//Source: https://medium.com/swlh/how-to-upload-image-using-multer-in-node-js-f3aeffb90657  - uploading files into a server 
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage });


//Automatically insert a new date every 12 AM
cron.schedule('0 0 0 * * *', async () => {

    var query = 'INSERT INTO `daily` SET date=?' + moment().format("YYYY-MM-DD")
    var empty = await queryDb(query)

});

//Routes to retrieve HTML files
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, './HTML', 'login.html'))
})

app.get('/main', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, './HTML', 'mainmenu.html'))
})

app.get('/maina', authenticateToken, (req, res) => {
    if (req.userInformation.status == "ADMIN") {
        res.sendFile(path.join(__dirname, './HTML', 'mainmenua.html'))
    }
    else {
        res.redirect('/login')
    }
})

app.get('/mainl', authenticateToken, (req, res) => {
    if (req.userInformation.status == "LOGISTICS" || req.userInformation.status == "ADMIN") {
        res.sendFile(path.join(__dirname, './HTML', 'mainl.html'))
    }
    else {
        res.redirect('/login')
    }
})

app.get('/orderhist', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, './HTML', 'orderhist.html'))
})

app.get('/delivery', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, './HTML', 'delivery.html'))
})


app.get('/usersdash/admin', authenticateToken, (req, res) => {
    if (req.userInformation.status == "ADMIN") {
        res.sendFile(path.join(__dirname, './HTML', 'usersa.html'))
    }
    else {
        res.redirect('/login')
    }
})

app.get('/usersdash/admin/:userID', authenticateToken, (req, res) => {
    if (req.userInformation.status == "ADMIN") {
        res.sendFile(path.join(__dirname, './HTML', 'edituser.html'))
    }
    else {
        res.redirect('/login')
    }
})

app.get('/catalogue/admin', authenticateToken, (req, res) => {
    if (req.userInformation.status == "ADMIN") {
        res.sendFile(path.join(__dirname, './HTML', 'cataloguea.html'))
    }

})

app.get('/orders/admin', authenticateToken, (req, res) => {
    if (req.userInformation.status == "ADMIN") {
        res.sendFile(path.join(__dirname, './HTML', 'ordersa.html'))
    }
    else {
        res.redirect('/login')
    }
})

app.get('/catalogue/admin/:catID', authenticateToken, (req, res) => {
    if (req.userInformation.status == "ADMIN") {
        res.sendFile(path.join(__dirname, './HTML', 'editcatalogue.html'))
    }
    else {
        res.redirect('/login')
    }
})

app.get('/transactions/admin', authenticateToken, (req, res) => {
    if (req.userInformation.status == "ADMIN") {
        res.sendFile(path.join(__dirname, './HTML', 'transactionsa.html'))
    }
    else {
        res.redirect('/login')
    }
})

app.get('/cart', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, './HTML', 'cart.html'))
})

app.get('/catalogue', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, './HTML', 'catalogue.html'))
})

app.get('/reset/:userID', (req, res) => {
    res.sendFile(path.join(__dirname, './HTML', 'resetpass.html'))
})

app.get('/productinfo/:pID', authenticateToken, (req, res) => {

    res.sendFile(path.join(__dirname, './HTML', 'product.html'))
})

app.get('/edituser', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, './HTML', 'useredit.html'))
})

//Routes to get all the users from database
app.get('/users', authenticateToken, async (req, res) => {
    if (req.userInformation.status == "ADMIN") {
        var userInformation = await queryDb('SELECT * FROM user_info')
        var allUsersInformation = JSON.parse(JSON.stringify(userInformation))
        var userList = []
        for (user in allUsersInformation) {
            //only retrieve the necessary information
            var necessaryUserInformation = {
                userID: allUsersInformation[user].userID,
                name: allUsersInformation[user].name,
                email: allUsersInformation[user].email,
                sales: allUsersInformation[user].totalSales,
                status: allUsersInformation[user].status,
            }
            userList.push(necessaryUserInformation)
        }
        res.send(userList)
    }
    else {
        res.send("Not Available")
    }
})

//Route to retrieve the user profile picture 
app.get('/getuserprofilepic', authenticateToken, async (req, res) => {
    try {
        var specificUser = await queryDb('SELECT * FROM `user_info` where  userID = ' + req.userInformation.userID)
        var alluserInformation = JSON.parse(JSON.stringify(specificUser))

        var userInformation = {
            imageAddress: alluserInformation[0].profilepic
        }
        res.send(userInformation)
    }
    catch (err) {
        res.send(err)
    }
})

//Route to retrieve the user information of a specific user by ID
app.get('/getuserinfo', authenticateToken, async (req, res) => {
    try {
        var specificUserInformation = queryDb('SELECT * FROM `user_info` where  userID = ' + req.userInformation.userID)

        var allUserInformation = JSON.parse(JSON.stringify(specificUserInformation))
        var userInformation = {
            name: allUserInformation[0].name,
            email: allUserInformation[0].email,
            image: allUserInformation[0].profilepic,
            address: allUserInformation[0].address,
            storename: allUserInformation[0].storename,
            phonenum: allUserInformation[0].phonenum,
        }
        res.send(userInformation)
    }
    catch (err) {
        res.send(err)
    }
})

//Route to retrieve the user information and their transaction records for admins
app.get('/users/:userID', authenticateToken, async (req, res) => {
    try {
        if (req.userInformation.status == "ADMIN") {
            const [specificUser, allTransactions] = await Promise.all([queryDb('SELECT * FROM `user_info` where  userID = ' + req.params.userID), queryDb('SELECT * FROM `transaction` where  userID = ' + req.params.userID)]);
            var userAndTransactions = {
                specificUser: specificUser,
                allTransactions: allTransactions
            }
            res.send(userAndTransactions)
        }
        else {
            res.send('No access')
        }
    }
    catch {
        res.send('something went worng')
    }
})

//Route to determine the most popular product and recently released product for user front page. 
app.get('/promotion', authenticateToken, async (req, res) => {
    const [catalogueDate, catalogueSales] = await Promise.all([queryDb('SELECT * FROM `catalogue` ORDER BY dateAdded DESC'), queryDb('SELECT * FROM `catalogue` ORDER BY totalSales DESC')]);
    //Product is ordered by the date that they were added in 
    var parsedDate = JSON.parse(JSON.stringify(catalogueDate))
    var parsedSales = JSON.parse(JSON.stringify(catalogueSales))
    var promotionList = [];
    var promotion = [];
    promotionList.push(parsedDate[0])
    promotionList.push(parsedSales[0])
    for (var x = 0; x < 2; x++) {
        //Select a random image of the variant to be displayed
        var image = await queryDb('SELECT * FROM `images` where productID=' + promotionList[x].productID)
        var imageDetails = JSON.parse(JSON.stringify(image))
        var imageInformation = {
            product: promotionList[x],
            image: imageDetails[0]
        }
        promotion.push(imageInformation)
    }
    res.send(promotion);
})

//The getUserTransactionDetails function is also marked async as it uses functions that returns promises 
async function getUserTransactionDetails(requestedUserId) {
    //Resolves is used to return a value in the form of a promise 
    return new Promise(async (resolve, reject) => {
        //Calls the function queryDb and continues executing other lines while waiting to get a response 
        const allTransactions = await queryDb('SELECT * FROM `transaction` where  userID = ' + requestedUserId)
        var transactions = JSON.parse(JSON.stringify(allTransactions))
        //Cycles through all the transaction records 
        var collectionOfTransactions = []
        for (transaction in transactions) {
            //Filters the transaction to only records with the following status 
            var details = await queryDb('SELECT * FROM `transaction_details` where  idTransaction = ' + transactions[transaction].idTransaction)
            var allTransactionDetails = JSON.parse(JSON.stringify(details))
            var collectionOfTransactionsDetails = [];

            for (specificDetails in allTransactionDetails) {

                const [productInformation, variantInformation] = await Promise.all([queryDb('SELECT * FROM `catalogue` where  productID = ' + allTransactionDetails[specificDetails].productID), queryDb('SELECT * FROM `variant` where  idvariant = ' + allTransactionDetails[specificDetails].variantID)]);

                var fullinfo = {
                    details: allTransactionDetails[specificDetails],
                    products: productInformation[0],
                    variant: variantInformation[0]
                }
                collectionOfTransactionsDetails.push(fullinfo)
            }
            var alltransc = {
                transaction: transactions[transaction],
                details: collectionOfTransactionsDetails
            }
            collectionOfTransactions.push(alltransc)
        }
        resolve(collectionOfTransactions)
    });
}

//using async can allow returning of value outside of the function 
//Source: https://stackoverflow.com/questions/63103436/cannot-push-object-returned-from-mysql-in-array

//route to retrieve all the onoging transactions/orders from a specific user 
app.get('/getdelivery', authenticateToken, async (req, res) => {
    try {
        //Use the await keyword to indicate to the compiler to hold off on the execution until a promise is returned 
        //Results are stored in the variable alltranscdet
        var allTransactionDetails = await getUserTransactionDetails(req.userInformation.userID)
        //Send the converted reesponse 
        res.send(JSON.parse(JSON.stringify(allTransactionDetails)))
    } catch (err) {
        res.send('something went wrong')
    }
})

//Authtoken to validate the user through tokens is called before the api proceeds with any code
app.get('/getalldashboard', authenticateToken, async (req, res) => {
    try {
        //Use the decoded userInformation to access the user role and determine whether they have access to it 
        if (req.userInformation.status == "ADMIN") {
            //get the stats for the last 7 days
            var statsQuery = 'SELECT * FROM `daily`  WHERE date >= (CURDATE() - INTERVAL 1 MONTH )'
            var customerQuery = 'SELECT * FROM `user_info`  WHERE `status` =  "user" ORDER BY totalSales desc'
            var productQuery = 'SELECT * FROM `catalogue` ORDER BY totalSales desc'
            var transactionQuery = 'SELECT * FROM `transaction`'
            //Query to gather all the necessary statistics 
            const [allStats, allCustomers, allProducts, allTransactions] = await Promise.all([queryDb(statsQuery), queryDb(customerQuery), queryDb(productQuery), queryDb(transactionQuery)]);
            var parsedStatistics = JSON.parse(JSON.stringify(allStats))
            var numberOfCustomers = allCustomers.length
            var orderedCustomers = JSON.parse(JSON.stringify(allCustomers))
            var sortedCustomers = []
            for (customer in orderedCustomers) {
                var customerInformation = {
                    userID: orderedCustomers[customer].userID,
                    name: orderedCustomers[customer].name,
                    totalsales: orderedCustomers[customer].totalSales
                }
                sortedCustomers.push(customerInformation)
            }
            var numberOfProducts = allProducts.length
            var orderedProducts = JSON.parse(JSON.stringify(allProducts))
            var sortedproducts = []
            for (product in orderedProducts) {
                var productinfo = {
                    name: orderedProducts[product].name,
                    totalsales: orderedProducts[product].totalSales
                }
                sortedproducts.push(productinfo)
            }

            var parsedStatistics = JSON.parse(JSON.stringify(allStats))

            var numberOfTransactions = allTransactions.length

            //Initialize three arrays which contains the following information
            var revenue = [];
            var sales = [];
            var date = [];

            //Push all the retrieved data into the respective array
            for (stat in parsedStatistics) {
                revenue.push(parsedStatistics[stat].dailyRevenue)
                sales.push(parsedStatistics[stat].dailySales)
                //Convert the date format into (YYYY-MM-DD)
                date.push(parsedStatistics[stat].date.split('T')[0])
            }

            var collectionOfAllStatistics = {
                revenue: revenue,
                sales: sales,
                date: date,
                customers: numberOfCustomers,
                products: numberOfProducts,
                transactions: numberOfTransactions,
                orderedProducts: sortedproducts,
                orderedCustomers: sortedCustomers
            }
            //Send the data as a response 
            res.send(collectionOfAllStatistics)
        }
    } catch (err) {
        res.send(err)
    }
})

//The getUserTransactionDetails function is also marked async as it uses functions that returns promises 
async function getAllTransactionDetails() {
    //Resolves is used to return a value in the form of a promise 
    return new Promise(async (resolve, reject) => {
        //Calls the function queryDb and continues executing other lines while waiting to get a response 
        const allTransactions = await queryDb('SELECT * FROM `transaction`')
        var transactions = JSON.parse(JSON.stringify(allTransactions))
        //Cycles through all the transaction records 
        var allTransactionsArray = []
        for (transaction in transactions) {
            //Filters the transaction to only records with the following status 
            var details = await queryDb('SELECT * FROM `transaction_details` where  idTransaction = ' + transactions[transaction].idTransaction)
            var allDetails = JSON.parse(JSON.stringify(details))
            var allTransactionDetailsArray = [];

            for (specdetails in allDetails) {
                var productQuery = 'SELECT * FROM `catalogue` where  productID = ' + allDetails[specdetails].productID
                var variantQuery = 'SELECT * FROM `variant` where  idvariant = ' + allDetails[specdetails].variantID

                const [productInformation, variantInformation] = await Promise.all([queryDb(productQuery), queryDb(variantQuery)]);
                var fullInformation = {
                    details: details[specdetails],
                    products: productInformation[0],
                    variant: variantInformation[0]
                }
                allTransactionDetailsArray.push(fullInformation)
            }
            var completeTransactionInformation = {
                transaction: transactions[transaction],
                details: allTransactionDetailsArray
            }
            allTransactionsArray.push(completeTransactionInformation)
        }
        resolve(allTransactionsArray)
    });
}

app.get('/getalltransactions', authenticateToken, async (req, res) => {
    try {
        if (req.userInformation.status == "ADMIN") {
            var allTransactions = await getAllTransactionDetails()
            res.send(JSON.parse(JSON.stringify(allTransactions)))
        }
    } catch (err) {
        res.send(err)
    }
})


async function getLogistics() {
    return new Promise(async (resolve, reject) => {
        //Calls the function queryDb and continues executing other lines while waiting to get a response 
        const allTransactions = await queryDb('SELECT * FROM `transaction` ORDER BY dateOrdered')
        var transactions = JSON.parse(JSON.stringify(allTransactions))
        var allTransactionsArray = [];
        //Cycles through all the transaction records 
        for (transaction in transactions) {
            var allTransactionDetails = []
            //Filters the transaction to only records with the following status 
            if (transactions[transaction].orderStatus == "Payment Approved" || transactions[transaction].orderStatus == "Processing" || transactions[transaction].orderStatus == "Delivering") {
                var queryDetails = 'SELECT * FROM `transaction_details` where  idTransaction = ' + transactions[transaction].idTransaction
                var queryClient = 'SELECT * FROM `user_info` where  userID = ' + transactions[transaction].userID
                //Retrieve the details of the transactions + the details of the user so that logistics know where and who to send to 
                const [clientInfo, details] = await Promise.all([queryDb(queryClient), queryDb(queryDetails)]);
                //parse the results 
                var allClient = JSON.parse(JSON.stringify(clientInfo))
                var allDetails = JSON.parse(JSON.stringify(details))
                //For all the details retrieve the necessary product and variant information 
                for (specificDetails in allDetails) {
                    var queryProduct = 'SELECT * FROM `catalogue` where  productID = ' + allDetails[specificDetails].productID
                    var queryVariant = 'SELECT * FROM `variant` where  idvariant = ' + allDetails[specificDetails].variantID
                    const [productInformation, variantInformation] = await Promise.all([queryDb(queryProduct), queryDb(queryVariant)]);
                    var allVariantInformation = JSON.parse(JSON.stringify(variantInformation))
                    //store the query result in an object and and push it into the array of transaction details 
                    var completeInformation = {
                        details: details[specificDetails],
                        variant: allVariantInformation[0].variantName,
                        products: {
                            category: productInformation[0].category,
                            name: productInformation[0].name
                        }
                    }
                    allTransactionDetails.push(completeInformation)
                }

                //Create another object for each of the transactions and all their details --> push into an array
                if (allClient.length == 0) {
                }
                else {
                    //Final object of all the data required, transaction --> transaction details + product + variant + quantity 
                    var collectiveTransactions = {
                        transaction: transactions[transaction],
                        transactionDetails: allTransactionDetails,
                        user: {
                            name: allClient[0].name,
                            storename: allClient[0].storename,
                            address: allClient[0].address,
                            phonenum: allClient[0].phonenum
                        }
                    }
                    //For each record, there are multiple details and such --> stored in an array for each record
                    allTransactionsArray.push(collectiveTransactions)
                }

            }
        }
        //Return the final result 
        resolve(allTransactionsArray)
    });
}

app.get('/getalllogistics', authenticateToken, async (req, res) => {
    try {
        if (req.userInformation.status == "ADMIN" || req.userInformation.status == "LOGISTICS") {
            var allLogistics = await getLogistics()
            res.send(JSON.stringify(allLogistics))
        }
    } catch (err) {
        res.send(err)
    }
})

app.get('/product/:productID', authenticateToken, async (req, res) => {
    try {
        var specificProductInformation = await queryDb('SELECT * FROM `catalogue` where  productID =' + req.params.productID)
        var specificProductInformation = JSON.parse(JSON.stringify(results));
        res.send(specificProductInformation)
    }
    catch {
        res.send('something went wrong')
    }
})

//Creates a router that returns all information about a product and the variants 

app.get('/getallcatinfo/:catID', authenticateToken, async (req, res) => {
    try {
        //Makes sure that the user is an ADMIN
        if (req.userInformation.status == "ADMIN") {
            //Creates two queries, 1: querying the product info, 2: querying the all the other product types 
            var queryProduct = 'SELECT * FROM `catalogue` where  productID = ' + req.params.catID
            var queryVariant = 'SELECT * FROM `variant` where  productID = ' + req.params.catID
            //Using promise.all allows both functions to run in parallel and holds off on execution until a promise is returned 
            const [allProducts, allVariants] = await Promise.all([queryDb(queryProduct), queryDb(queryVariant)]);
            //The returned values are parsed into javaScript object 
            var productINFO = JSON.parse(JSON.stringify(allProducts));
            var variantINFO = JSON.parse(JSON.stringify(allVariants));
            var finalvariantinfo = []
            for (variant in variantINFO) {
                const imageaddresses = await queryDb('SELECT * FROM `images` where  variantID = ' + variantINFO[variant].idvariant)
                var fullvariant = {
                    variant: variantINFO[variant],
                    imageInformation: imageaddresses
                }
                finalvariantinfo.push(fullvariant)
            }
            //Creates an object that marks the parsed values with the following labels
            var allcat = {
                product: productINFO,
                variantInformation: finalvariantinfo
            }
            //Sends all the data
            res.send(allcat)
        }
    }
    catch (err) {
        res.send(err)
    }
})

//Route to retrieve all the images concerned with a particular product variant 
app.get('/imageaddress/:variantID', authenticateToken, async (req, res) => {
    try {
        if (req.userInformation.status == "ADMIN") {
            const allAddresses = await queryDb('SELECT * FROM `images` where  variantID =' + req.params.variantID)
            res.send(allAddresses)
        }
    }
    catch (err) {
        res.send(err)
    }
})

async function getVariantAndProductInformation(requestedUser) {
    return new Promise(async (resolve, reject) => {
        //Select all the cart items from a requested user
        const allCartItems = await queryDb('SELECT * FROM `cart_item` where  cartID =' + requestedUser)
        const allItemsInformation = JSON.parse(JSON.stringify(allCartItems))
        var cartCollectionsArray = [];
        //For each of those items, retrieve the product, variant, and images to be displayed 
        for (item in allItemsInformation) {
            var queryCatalogue = 'SELECT * FROM `catalogue` where  productID =' + allItemsInformation[item].productID
            var queryVariant = 'SELECT * FROM `variant` where  idvariant =' + allItemsInformation[item].variantID
            var queryImage = 'SELECT * FROM `images` where  variantID =' + allItemsInformation[item].variantID

            //Run the asynchronous functions in parallel to save time. 
            const [allProduct, allVariant, allImage] = await Promise.all([queryDb(queryCatalogue), queryDb(queryVariant), queryDb(queryImage)]);

            var variant = JSON.parse(JSON.stringify(allVariant))
            var product = JSON.parse(JSON.stringify(allProduct))
            var image = JSON.parse(JSON.stringify(allImage))

            //Collect all the information in one giant packet to be sent to the front-end 
            var productInformation = {
                cartItem: allItemsInformation[item],
                product: {
                    name: product[0].name,
                    productID: product[0].productID
                },
                variantInformation: {
                    variantName: variant[0].variantName,
                    price: variant[0].price,
                    stock: variant[0].quantity,
                },
                image: image[0].imageaddress
            }
            cartCollectionsArray.push(productInformation)
        }
        //Return the value in the form of a promise using resolve 
        resolve(cartCollectionsArray)
    })
}

//Route to retrieve all the cart items to be displayed 
app.get('/cartitem', authenticateToken, async (req, res) => {
    try {
        const allCartItems = await getVariantAndProductInformation(req.userInformation.userID)
        res.send(allCartItems)

    }
    catch (err) {
        res.send(err)
    }
})

//Route to get all the products from the catalogue 
app.get('/catalogue/all', authenticateToken, async (req, res) => {
    try {
        var catalogue = await queryDb('SELECT * FROM catalogue')
        var allCatalogue = JSON.parse(JSON.stringify(catalogue));
        var allProducts = []
        for (product in allCatalogue) {
            var allImages = await queryDb('SELECT * FROM `images` where  productID = ' + allCatalogue[product].productID)
            var randomImage = JSON.parse(JSON.stringify(allImages));
            //Choose a random image to represent the product for the user to see 
            if (randomImage.length == 0) {
                var productInformation = {
                    productID: allCatalogue[product].productID,
                    name: allCatalogue[product].name,
                    category: allCatalogue[product].category,
                    totalSales: allCatalogue[product].totalSales,
                    description: allCatalogue[product].description,
                    randomImage: "/images/Screen Shot 2021-12-31 at 14.39.23.png"
                }
                allProducts.push(productInformation)
            }
            else {
                var productInformation = {
                    productID: allCatalogue[product].productID,
                    name: allCatalogue[product].name,
                    category: allCatalogue[product].category,
                    totalSales: allCatalogue[product].totalSales,
                    description: allCatalogue[product].description,
                    randomImage: randomImage[0].imageaddress
                }
                allProducts.push(productInformation)
            }

        }
        var product = {
            product: allProducts
        }
        //Sends all the data
        res.send(JSON.stringify(product))
    }
    catch (err) {
        res.send(err)
    }
})

//Route to retrieve all information of a specific product when the user clicks to view a specific image during browsing 
app.get('/getspecific/:pID', authenticateToken, async (req, res) => {
    try {
        var queryVariant = 'SELECT * FROM variant where productID =' + req.params.pID
        var queryCatalogue = 'SELECT * FROM catalogue where productID =' + req.params.pID
        const [catalogue, variant] = await Promise.all([queryDb(queryCatalogue), queryDb(queryVariant)]);
        var productInformation = JSON.parse(JSON.stringify(catalogue));
        var variantInformation = JSON.parse(JSON.stringify(variant));
        var allVariant = []
        //For each of the variants gather their images and store them in one object 
        for (specificVariant in variantInformation) {
            var allimages = await queryDb('SELECT * FROM `images` where  variantID = ' + variantInformation[specificVariant].idvariant)
            var variantAndImages = {
                variant: variantInformation[specificVariant],
                images: allimages
            }
            allVariant.push(variantAndImages)
        }
        var product = {
            product: productInformation,
            allVariant: allVariant
        }
        //Sends all the data
        res.send(JSON.stringify(product))
    }
    catch (err) {
        res.send(err)
    }
})

app.get('/cart/:cartID', (req, res) => {
    connection.query("SELECT * FROM `cart_item` where  cartID = ?", [req.params.cartID], function (err, results) {
        if (err) throw err;
        var allCartItems = JSON.parse(JSON.stringify(results));
        res.send(allCartItems)
    })
})

app.get('/getcartitems', authenticateToken, async (req, res) => {
    try {
        var cartItems = await queryDb('SELECT * FROM `cart_item` where  cartID= ' + req.userInformation.userID.toString())
        res.send(cartItems)
    }
    catch (err) {
        res.send(err)
    }
})


app.get('/details/:idTransaction', (req, res) => {
    connection.query("SELECT * FROM `transaction_details` where  idTransaction = ?", [req.params.idTransaction], function (err, results) {
        if (err) throw err;
        var allTransactionDetails = JSON.parse(JSON.stringify(results));
        res.send(allTransactionDetails)
    })
})

//Source: https://stackoverflow.com/questions/27978868/destroy-cookie-nodejs - how to destroy cookie when the user logouts
app.get('/logout', (req, res) => {
    cookie = req.cookies;
    for (var prop in cookie) {
        //remove the cookie items: tokens 
        if (!cookie.hasOwnProperty(prop)) {
            continue;
        }
        res.cookie(prop, '', { expires: new Date(0) });
    }
    res.redirect('/login');

})

//Routes to post data into the database 

//Source: https://dev.to/jlong4223/how-to-implement-email-functionality-with-node-js-react-js-nodemailer-and-oauth2-2h7m - sending email using nodemailer 

let transporter = nodemailer.createTransport({
    service: "gmail",
    //Pass retrieved credentials into the auth section for authenticationto use the GMAIL service 
    auth: {
        type: "OAuth2",
        user: process.env.EMAIL,
        pass: process.env.WORD,
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    },
});

//Source: https://sebhastian.com/bcrypt-node/ - hasing/encrypting passwords
//Hashing and encrypting passwords using Bcrypt  
async function hashing(password) {
    return new Promise(async (resolve, reject) => {
        const salt = await bcrypt.genSalt(7);
        const hashPassword = await bcrypt.hash(password, salt);
        resolve(hashPassword)
    })
}

//Source: https://futurestud.io/tutorials/generate-a-random-string-in-node-js-or-javascript 
//Function used to generate random passwords. 
function randomString(size = 21) {
    return Crypto
        .randomBytes(size)
        .toString('base64')
        .slice(0, size)
}

//Route to create a new user and send an email to inform them of their credentials
app.post('/createUsers', authenticateToken, async function (req, res) {
    //Only admin has access to creating a new user 
    if (req.userInformation.status == "ADMIN") {
        //Generate a password of random strings 
        password = randomString()
        //Hash the password using BCRYPT library 
        var hashedPassword = await hashing(password)
        //Connect to the database and insert the following information 
        var dateCreated = moment().format("YYYY-MM-DD")
        connection.query("INSERT INTO `user_info` SET `password`=?, `profilepic`=?,`email`=?, `phonenum`=?, `storename`=?, `address`=?, `status`=?, `name`=?, `created`=?", [hashedPassword, "/images/blank-profile-picture-973460_1280.png", req.body.email, req.body.phonenum, req.body.storename, req.body.address, req.body.status, req.body.name, dateCreated], function (error, results, fields) {
            if (error) throw error;
            //Define the email options so that the api knows where to send the email as well the content of the email 
            let mailOptions = {
                from: process.env.EMAIL,
                to: req.body.email,
                subject: "New Account",
                text: req.body.text,
                //The email content which informs the user of their new account credentials 
                html: `    
            <p> Hi ${req.body.name},<p>  <br> 
            <p>The following includes the login information for your new account. <p><br>    
            <p> Email: ${req.body.email} <p> <br>
            <p> Password: ${password} <p> <br>
            <p> Thanks, <p> <br> 
            <p> Torch ID <p> 
            `
            };
            //Use the pre-defined transported module to send an email to the specified address using the gmail service 
            transporter.sendMail(mailOptions, function (err, data) {
                if (err) {
                    console.log(err)
                } else {
                }
            });
            res.send(JSON.stringify(results));
        });
    }
    else {
        res.redirect('/login')
    }
});



//front end https://stackoverflow.com/questions/48859546/upload-image-to-server-with-xmlhttprequest-and-formdata-in-react-native
//Source: https://www.geeksforgeeks.org/file-uploading-in-node-js/

//Route to add a new model to an exisiting product 
app.post('/addmodel/:productID', authenticateToken, upload.array('uploaded_file', 5), async function (req, res) {
    try {
        if (req.userInformation.status == "ADMIN") {
            var modelInformation = JSON.parse(req.body.newModel)
            var newModel = {
                variantName: modelInformation.name,
                quantity: parseInt(modelInformation.quantity),
                price: parseInt(modelInformation.price),
                productID: req.params.productID
            }
            //Inser the new variant into the table 
            connection.query('INSERT INTO `variant` SET ?', newModel, async function (err, results) {
                if (err) throw err;
                for (var i = 0; i < req.files.length; i++) {
                    var newimage = {
                        variantID: results.insertId,
                        productID: req.params.productID,
                        imageaddress: req.files[i].path.replace('public', '')
                    }
                    var newImageID = await queryDbWithId('INSERT INTO images SET ?', newimage)
                }
            })
            return res.send("success")
        }
        else {
            res.send('Not Available')
        }
    }
    catch {
        res.send('something went wrong')
    }
})

//Upload a new profile picture 
app.post('/uploadimage', authenticateToken, upload.single('uploaded_file'), function (req, res) {
    try {
        var imageAddress = req.file.path.replace('public', '')
        connection.query('UPDATE `user_info` SET  `profilepic` = ? where `userID`=?', [imageAddress, req.userInformation.userID], async function (err, results) {
            if (err) throw err;
            res.send(results)
        })
    }
    catch (err) {
        res.send(err)
    }
})

//Update the picture of a variant 
app.post('/updateimage/:iID', authenticateToken, upload.single('uploaded_file'), function (req, res) {
    try {
        var imageAddress = req.file.path.replace('public', '')
        connection.query('UPDATE `images` SET  `imageaddress` = ? where `idimages`=?', [imageAddress, req.params.iID], async function (err, results) {
            if (err) throw err;
            res.send(results)
        })
    }
    catch (err) {
        res.send(err)
    }
})

//Upload a new payment proof for the users 
app.post('/uploadpayment/:transactionID', authenticateToken, upload.single('uploaded_file'), function (req, res) {
    try {
        var imageAddress = req.file.path.replace('public', '')
        connection.query('UPDATE `transaction` SET  `paymentproof` = ? where `idTransaction`=?', [imageAddress, req.params.transactionID], async function (err, results) {
            if (err) throw err;
        })
    }
    catch (err) {
        res.send(err)
    }
})

//Add a new product in the database 
app.post('/addproduct', authenticateToken, function (req, res) {
    try {
        if (req.userInformation.status == "ADMIN") {
            var newProduct = {
                name: req.body.name,
                category: req.body.category,
                description: req.body.description,
                totalSales: 0,
                dateAdded: moment().format("YYYY-MM-DD"),
                dateModified: moment().format("YYYY-MM-DD"),
            }
            connection.query('INSERT INTO `catalogue` SET ?', newProduct, function (err, results) {
                if (err) throw err;
            })

            res.send("success")
        }
        else {
            res.send('Not Available')
        }
    }
    catch {
        res.send('something went wrong')
    }
})

//A route that calls a function calls generateStatusToken() and stores the retrieved value inside the http only cookie 
//The user status (admin, user, logistics) is returned to the user for page routing. 
app.post('/loginusers', async (req, res) => {
    try {
        //Pass email and password into the function
        const tokenStatus = await generateStatusToken(req.body.email, req.body.password)
        //Store the values inside http only cookies with the following name 
        //             Name      Passing the returned token values   Expiry duration   Can't be accessed through Javscript
        res.cookie('accessToken', tokenStatus.accessToken, { maxAge: 60000000000000, httpOnly: true })
        res.cookie('refreshToken', tokenStatus.refreshToken, { maxAge: 100000000000000, httpOnly: true })
        //Respond the user status to the user 
        res.json({
            status: tokenStatus.status
        })
    }
    //If erorr send the error message
    catch (err) {
        res.send(err)
    }
})

//Route to allow users to add an item to acart 
app.post('/addcartitem', authenticateToken, async (req, res) => {
    try {
        var newCartItems = {
            variantID: req.body.variantID,
            quantity: req.body.quantity,
            cartID: req.userInformation.userID,
            productID: req.body.productID
        }
        //Query to insert it into the database 
        var newcartid = await queryDbWithId('INSERT INTO cart_item SET ?', newCartItems)

        res.send('success')
    }
    catch (err) {
        res.send(err)
    }
})

//When the user checksout and places an order 
async function checkOut(allTransactions, requesteduser) {
    return new Promise(async (resolve, reject) => {
        var fullTransaction = {
            orderStatus: "Waiting Approval",
            userID: requesteduser,
            dateOrdered: moment().format("YYYY-MM-DD"),
            totalUnits: allTransactions.transaction.quantity,
            totalValue: allTransactions.transaction.totalValue
        }
        //Insert the items into new records 
        var newTransactionId = await queryDbWithId('INSERT INTO transaction SET ?', fullTransaction)
        for (detail in allTransactions.details) {
            var completeTransactionDetails = {
                productID: allTransactions.details[detail].productID,
                idTransaction: newTransactionId,
                quantity: allTransactions.details[detail].quantity,
                variantID: allTransactions.details[detail].variantID
            }
            var response = await queryDbWithId('INSERT INTO transaction_details SET ?', completeTransactionDetails)
        }

        var status = await queryDb('DELETE FROM `cart_item` WHERE cartID =' + requesteduser)
        resolve(status)
    })
}

app.post('/checkout', authenticateToken, async (req, res) => {
    try {
        var allTransactions = req.body
        var response = await checkOut(allTransactions, req.userInformation.userID)
    }
    catch (err) {
        res.send(err)
    }
})


//Sends an email when a new user is created 
app.post('/sendemail', async (req, res) => {
    try {
        var specificUser = await queryDb('SELECT * FROM `user_info`')
        var parsedUserInformation = JSON.parse(JSON.stringify(specificUser))
        var status = "NOT FOUND"
        for (user in parsedUserInformation) {
            if (parsedUserInformation[user].email == req.body.email) {
                status = "FOUND"
                let mailOptions = {
                    from: process.env.EMAIL,
                    to: req.body.email,
                    subject: "Password Reset",
                    html: `    
                            <p> Hi ${parsedUserInformation[user].name},<p>  <br> 
                            <p>We received 1 request to reset your web application password.<p><br>    
                            <p> Click the following link to reset your password <p> <br>
                            <a href= http://localhost:5001/reset/${parsedUserInformation[user].userID}> Reset Password </a>
                            <p> Thanks, <p> <br> 
                            <p> Torch ID <p> 
                            `
                };
                transporter.sendMail(mailOptions, function (err, data) {
                    if (err) {
                        console.log(err)
                    } else {
                        res.send(JSON.stringify(mailOptions))
                    }
                });
                break;
            }
        }
        if (status == "NOT FOUND") {
            res.send("NOT FOUND")
        }
    }
    catch {
        res.send('something went worng')
    }
})

//Routes to delete data from the database 
app.delete('/deleteUsers/:userID', function (req, res) {
    connection.query("DELETE FROM `user_info` WHERE userID =?;", [req.params.userID], function (error, results, fields) {
        if (error) throw error;
        res.send(JSON.stringify(results));
    });
});

//Route to delete a cart item for the user 
app.delete('/deletecartItem/:cartID', authenticateToken, async function (req, res) {
    try {
        var deleteQuery = "DELETE FROM `cart_item` WHERE idcart_item =" + req.params.cartID
        var response = await queryDb(deleteQuery)
        res.send("DELETED")
    }
    catch (err) {
        res.send(err)
    }
});

//Rotues to update data in the database 
//Update the user information 
app.put('/uploaduserInformation', authenticateToken, function (req, res) {
    try {
        connection.query('UPDATE `user_info` SET  `name` = ?, `storename` = ?, `address` = ? , `phonenum` = ?, `email` = ? where `userID`=?', [req.body.name, req.body.storename, req.body.address, req.body.phonenum, req.body.email, req.userInformation.userID], async function (err, results) {
            if (err) throw err;
            res.send(results)
        })
    }
    catch (err) {
        res.send(err)
    }
})

//Edit the information of a model/variant of a product 
app.put('/editModel/:vID', authenticateToken, async function (req, res) {
    try {
        if (req.userInformation.status == "ADMIN") {
            var status = await editmodel(req.body.name, req.body.quantity, req.body.price, req.params.vID)
            res.send("edited")
        }
    }
    catch (err) {
        res.send(err)
    }
});

//Route to edit the product information 
app.put('/editCatalogue/:productID', authenticateToken, async function (req, res) {
    try {
        if (req.userInformation.status == "ADMIN") {
            connection.query("UPDATE `catalogue` SET `category`=?,`name`=?,`description`=?,`dateModified`=? where `productID`=?", [req.body.category, req.body.name, req.body.description, moment().format("YYYY-MM-DD"), req.params.productID], function (error, results, fields) {
            });
        }
    }
    catch (err) {
        res.send(err)
    }
});

//User can update a transaction as completed when it arrives 
app.put('/updateComplete/:idTransaction', function (req, res) {
    connection.query("UPDATE `transaction` SET `orderStatus`=? where `idTransaction`=?", [req.body.orderStatus, req.params.idTransaction], function (error, results, fields) {
        if (error) throw error;
        res.send(JSON.stringify(results));
    });
});

//Gather all the transaction details of a particular record so that an invoice can be created 
async function gettransactiondetails(requestedTransaction) {
    return new Promise(async (resolve, reject) => {
        var transactionQuery = "SELECT * FROM transaction where idTransaction =" + requestedTransaction
        var transactionDetailQuery = "SELECT * FROM transaction_details where idTransaction =" + requestedTransaction
        const [allTransactionsInformation, allTransactionDetails] = await Promise.all([queryDb(transactionQuery), queryDb(transactionDetailQuery)]);
        var parsedTransactions = JSON.parse(JSON.stringify(allTransactionsInformation))
        var parsedDetails = JSON.parse(JSON.stringify(allTransactionDetails))
        var collectionOfTransactionDetailsArray = []
        //For all the details query for more product and variant information 
        for (details in parsedDetails) {
            var productQuery = "SELECT * FROM catalogue where productID =" + parsedDetails[details].productID
            var variantquery = "SELECT * FROM variant where idvariant =" + parsedDetails[details].variantID
            const [productInformation, variantInformation] = await Promise.all([queryDb(productQuery), queryDb(variantquery)]);
            var parsedProduct = JSON.parse(JSON.stringify(productInformation))
            var parsedVariant = JSON.parse(JSON.stringify(variantInformation))
            var transcinfo = {
                quantity: parsedDetails[details].quantity,
                description: parsedProduct[0].name + " " + parsedvariant[0].variantName,
                price: parsedVariant[0].price,
                "tax-rate": 0
            }
            collectionOfTransactionDetailsArray.push(transcinfo)
        }
        var fullTransactionDetails = {
            transc: parsedTransactions,
            alldetails: collectionOfTransactionDetailsArray
        }
        resolve(fullTransactionDetails)
    })
}

//Generate a new invoice using the library easyinvocie 
async function generateinvoice(data, reqinfo) {
    const result = await easyinvoice.createInvoice(data);
    fs.writeFileSync(path.join(__dirname, "./public/invoices", "Transaction" + reqinfo + ".pdf"), result.pdf, 'base64');
}

//Source: https://easyinvoice.com/ 
async function getuserbyidtransaction(reqid) {
    return new Promise(async (resolve, reject) => {
        var response = await gettransactiondetails(reqid)
        var data = {
            "images": {
                // The logo on top of your invoice
                "logo": fs.readFileSync('output-onlinepngtools.jpg', 'base64')
                // The invoice background
            },
            // Your own data
            "sender": {
                "company": "Torch Electric ID",
                "zip": "14450",
                "city": "Jakarta",
                "country": "Indonesia"
            },
            "information": {
                // Invoice number
                "number": response.transc[0].idTransaction,
                // Invoice data
                "date": response.transc[0].dateOrdered.split('T')[0],
                "due-date": "-"
            },
            "products": response.alldetails,
            "bottom-notice": "Please pay your invoice within 30 days.",
            "settings": {
                "currency": "IDR"
            }
        };
        generateinvoice(data, response.transc[0].idTransaction, async () => {
            try {
            }
            catch (err) {
                console.log(err)
            }
        })
        resolve(response.transc[0].userID)
    })
}

async function getUserByTransactionId(reqID) {
    return new Promise(async (resolve, reject) => {
        var response = await getuserbyidtransaction(reqID)
        var userInformation = await queryDb('SELECT * FROM user_info where userID =' + response)
        resolve(JSON.parse(JSON.stringify(userInformation)))
    })
}

//Set an interal delay to provide clashing of tasks or requests 
function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

//When the user places an order, reduce the stock quantity 
async function updateStockQuantity(newstock) {
    return new Promise(async function (resolve) {
        for (stock in newstock) {
            var updatestockquery = "UPDATE `variant` SET `quantity`= '" + newstock[stock].newstock + "' where `idvariant`=" + newstock[stock].variantID
            var response = await queryDb(updatestockquery)
        }
        resolve('.')
    })
}

//Add the total sales and revenue when a new order/payment has been acccpeted by an employee 
async function updateSalesAndRevenue(alldata) {
    return new Promise(async function (resolve) {
        var currentdate = moment().format("YYYY-MM-DD")
        var addsalesrev = "UPDATE `daily` SET `dailySales`= dailySales +  " + alldata.totalSales + " , `dailyRevenue`= dailyRevenue+" + alldata.totalRevenue + "  WHERE date = CURDATE()"
        var response = await queryDb(addsalesrev)
        resolve(response)
    })
}

//Updates the status of a record based on its current status 
app.put('/updateStatus/:tID', authenticateToken, async function (req, res) {
    try {
        if (req.body.orderStatus == "Waiting Payment") {

            const [response, newstock] = await Promise.all([getUserByTransactionId(req.params.tID), updateStockQuantity(req.body.newstock)]);

            let mailOptions = {
                from: process.env.EMAIL,
                to: response[0].email,
                subject: "INVOICE",
                html: `    
                    <p> Hi ${response[0].name},<p>  <br> 
                    <p>We have successfully received your order. Please find attached for your payment details and invoice. <p><br>    
                    <p> Thanks, <p> <br> 
                    <p> Torch ID <p> 
                    `,
                attachments: [
                    {
                        filename: 'Transaction' + req.params.tID + '.pdf',
                        path: path.join(__dirname, './public/invoices', 'Transaction' + req.params.tID + '.pdf'),
                        contentType: 'application/pdf'
                    }
                ]
            };
            await delay(4000);
            transporter.sendMail(mailOptions, function (err, data) {
                if (err) {
                    console.log(err)
                } else {
                }
            });
        }
        else if (req.body.orderStatus == "Payment Approved") {
            var response = await updateSalesAndRevenue(req.body)
        }
        var updatequery = "UPDATE `transaction` SET `orderStatus`= '" + req.body.orderStatus.toString() + "' where `idTransaction`=" + req.params.tID
        var response = await queryDb(updatequery)
        res.send(response)
    }
    catch (err) {
        res.send(err)
    }
});


app.put('/updateUsers/:userID', function (req, res) {
    connection.query("UPDATE `user_info` SET `phonenum`=?,`storename`=?,`address`=?,`name`=? where `userID`=?", [req.body.phonenum, req.body.storename, req.body.address, req.body.name, req.params.userID], function (error, results, fields) {
        if (error) throw error;
        res.send(JSON.stringify(results));
    });
});

//Used for resetting password 
app.put('/updatePassword/:userID', async function (req, res) {
    try {
        var hashedPassword = await hashing(req.body.password)
        connection.query("UPDATE `user_info` SET `password`=? where `userID`=?", [hashedPassword, req.params.userID], function (error, results, fields) {
            if (error) throw error;
        });
    }

    catch {

    }
});


app.listen(pt)

