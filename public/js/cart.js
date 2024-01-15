window.onload = function () {
    getCartItemById();
};

var allCartItems

var totalValue = 0;


//Loads all the cart items based on the user ID 
function getCartItemById() {
    createXhrRequest("GET", 'http://localhost:5001/cartItem', function (err, response) {
        if (err) { console.log("Error!"); }
        var userCartItems = JSON.parse(response);
        allCartItems = userCartItems
        var table = document.getElementById('maintable')
        var count = 1;
        for (cart in userCartItems) {
            //Insert the data into the respective rows/columns
            var row = table.insertRow(count);
            var image = row.insertCell(0);
            var variantName = row.insertCell(1);
            var name = row.insertCell(2);
            var total = row.insertCell(3);
            var quantityUpdate = row.insertCell(4);
            var deleteButton = row.insertCell(5);
            image.innerHTML = '<img class="images" src="' + userCartItems[cart].image + '">';
            variantName.innerHTML = userCartItems[cart].variantInformation.variantName;
            name.innerHTML = userCartItems[cart].product.name;
            total.innerHTML = convertRup(parseInt(userCartItems[cart].variantInformation.price) * userCartItems[cart].cartItem.quantity);
            deleteButton.innerHTML= '<i onclick="deleteCartItem('+userCartItems[cart].cartItem.idcart_item+')" id="trashbutton" class="bx bx-trash"></i>'
            quantityUpdate.innerHTML = '<div class="container"> <div onclick="subtractItemQuantity(this)"class="minusbutton"> <i class="bx bx-minus" ></i> </div> <input class="quantity" id="quantity' + cart + '" type="number" value="' + userCartItems[cart].cartItem.quantity + '">  <div onclick="addItemQuantity(this)"class="plusbutton"> <i class="bx bx-plus" ></i> </div>'
            totalValue += (parseInt(userCartItems[cart].variantInformation.price) * parseInt(userCartItems[cart].cartItem.quantity))
            count++
        }
        //Calculates the subtotal 
        document.getElementById('subtotal').innerHTML += '<br> <div id="totalnumber"><b>Rp. ' + convertRup(totalValue) + '</b> </div>'
    });
}

//Delete the cart item from user database 
function deleteCartItem(itemID){
    var xhr = new XMLHttpRequest();

    xhr.open("DELETE", "http://localhost:5001/deletecartItem/"+itemID, true);

    xhr.send();

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
        }
    }
    location.reload();
     
}

//Triggers when the user adds quantity to the select cart item 
function addItemQuantity(row) {
    var table = document.getElementById('maintable')
    var rowNumber = row.parentElement.parentElement.parentElement.rowIndex
    var variantName = table.rows[rowNumber].cells[1].innerHTML
    for (specificCartItem in allCartItems) {
        if (allCartItems[specificCartItem].variantInformation.variantName == variantName) {
            //Increase quantity by 1 everytime the button is clicked
            var newQuantity = parseInt(document.getElementById('quantity' + specificCartItem.toString()).value) + 1
            document.getElementById('quantity' + specificCartItem.toString()).value = newQuantity
            table.rows[rowNumber].cells[3].innerHTML = convertRup(newQuantity * parseInt(allCartItems[specificCartItem].variantInformation.price))
            totalValue += parseInt(allCartItems[specificCartItem].variantInformation.price)
            document.getElementById('subtotal').innerHTML = 'Subtotal: <br> <div id="totalnumber"><b>Rp. ' + convertRup(totalValue) + '</b> </div>'
        }
    }
}

//Triggers when the user subtracts quantity to the select cart item 
function subtractItemQuantity(row) {
    var table = document.getElementById('maintable')
    var rowNumber = row.parentElement.parentElement.parentElement.rowIndex
    var variantName = table.rows[rowNumber].cells[1].innerHTML
    for (specificCartItem in allCartItems) {
        if (allCartItems[specificCartItem].variantInformation.variantName == variantName) {
            var newQuantity = parseInt(document.getElementById('quantity' + specificCartItem.toString()).value) - 1
            document.getElementById('quantity' + specificCartItem.toString()).value = newQuantity
            table.rows[rowNumber].cells[3].innerHTML = convertRup(newQuantity * parseInt(allCartItems[specificCartItem].variantInformation.price))
            totalValue -= parseInt(allCartItems[specificCartItem].variantInformation.price)
            document.getElementById('subtotal').innerHTML = 'Subtotal: <br> <div id="totalnumber"><b>Rp. ' + convertRup(totalValue) + '</b> </div>'
        }
    }
}

//User clicks checkout the trigger the button 
function checkOut() {
    //Empty cart 
   if (allCartItems.length==0){
    alert("You need to place an item in the cart")
   }else{
    var totalQuantity = 0;
    var totalValue = 0;
    var cartAndDetails = []
    //Loops through all the cart items and group them into one array 
    for (var x = 0; x < allCartItems.length; x++) {
        totalQuantity += parseInt(document.getElementById('quantity' + x.toString()).value)
        totalValue += parseInt(document.getElementById('quantity' + x.toString()).value) * parseInt(allCartItems[x].variantInformation.price)
        var details = {
            productID: allCartItems[x].product.productID,
            quantity: parseInt(document.getElementById('quantity' + x.toString()).value),
            variantID: allCartItems[x].cartItem.variantID
        }
        cartAndDetails.push(details)
    }

    var transactionOverview = {
        quantity: totalQuantity,
        totalValue: totalValue,
        productID: allCartItems[0].product.productID
    }

    var xhr = new XMLHttpRequest();

    //Calls the query to create a new order with all the cart items and quantities 
    xhr.open("POST", "http://localhost:5001/checkout", true);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');


    var allTransaction = {
        transaction: transactionOverview,
        details: cartAndDetails
    }
    var JSONformatdata = JSON.stringify(allTransaction);

    xhr.send(JSONformatdata);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
        }
    }
    window.location.replace('http://localhost:5001/main')
   }    
}


