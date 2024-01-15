
var allcatalogue;

window.onload = function () {
    loadProductInformation();
}

var allProductInformation

var count = 0;
var position;

function loadProductInformation() {
    var currentLocation = window.location.pathname;
    productID = currentLocation.replace("/productinfo/", "");
    createXhrRequest("GET", 'http://localhost:5001/getspecific/' + productID, function (err, response) {
        if (err) { console.log("Error!"); }
        var products = JSON.parse(response);
        allProductInformation = products

        document.getElementById('image').innerHTML += '<img id="images" src="' + products.allVariant[0].images[0].imageaddress + '"> '
        document.getElementById('name').innerHTML = '<b>' + products.product[0].name + '</b>'
        document.getElementById('description').innerHTML = 'Description: ' + products.product[0].description

        document.getElementById('category').innerHTML += 'Category: ' + products.product[0].category
        document.getElementById('price').innerHTML = '<b>Rp.</b> <b>' + convertRup(products.allVariant[0].variant.price) + '</b>'
        document.getElementById('stock').innerHTML = 'Stock: <b>' + products.allVariant[0].variant.quantity + '</b>'
        document.getElementById('quantity').innerHTML += ' <input type="number" id="inputquantity" value=1> '
        position = 0;

        for (variant in products.allVariant) {
            document.getElementById('modeltype').innerHTML += '<option value="' + products.allVariant[variant].variant.variantName + '">' + products.allVariant[variant].variant.variantName + '</option>'
        }
    });
}

//Changes the images by cycling through the array of images 
function move(num) {
    var child = document.getElementById("images");
    var parent = document.getElementById("image");
    parent.removeChild(child);

    document.getElementById('image').innerHTML += '<img id="images" src="' + allProductInformation.allVariant[position].images[count].imageaddress + '"> '
    count = count + num
    if (count > allProductInformation.allVariant[position].images.length - 1) {
        count = 0;
    }
}


var index=0;

//Updates the information such as images, variant name, quantities when the user selects a differet model or variant of the product 
function changeValues() {
    for (variant in allProductInformation.allVariant) {
        if (allProductInformation.allVariant[variant].variant.variantName == document.getElementById('modeltype').value) {
            index = variant
            position = variant;
            var child = document.getElementById("images");
            var parent = document.getElementById("image");
            parent.removeChild(child);
            //Update variant information 
            document.getElementById('image').innerHTML += '<img id="images" src="' + allProductInformation.allVariant[variant].images[0].imageaddress + '"> '
            document.getElementById('price').innerHTML = '<b>Rp.</b> <b>' + convertRup(allProductInformation.allVariant[variant].variant.price) + '</b>'
            document.getElementById('stock').innerHTML = 'Stock: <b>' + allProductInformation.allVariant[variant].variant.quantity + '</b>'

        }
    }
}

//Add an item to cart 
function addCart(){
    var exist=false;
    createXhrRequest("GET", 'http://localhost:5001/getcartitems', function (err, response) {
        if (err) { console.log("Error!"); }
        var allCartItems = JSON.parse(response);
        for (item in allCartItems){
            if(allCartItems[item].variantID==allProductInformation.allVariant[index].variant.idvariant){
                exist=true;
            }
        }
    })      
    if(exist==false){
        //If the quantity is less than the available stock, notify the user 
        if (document.getElementById('inputquantity').value>allProductInformation.allVariant[index].variant.quantity){
            alert("Input value greater than stock value")
        }else{
            var newcart = {
                variantID: allProductInformation.allVariant[index].variant.idvariant,
                quantity: document.getElementById('inputquantity').value,
                productID: allProductInformation.allVariant[index].variant.productID,
            }
            var xhr = new XMLHttpRequest();
            //else add the item into user cart 
            xhr.open("POST","http://localhost:5001/addcartitem",true);    
            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    
            var JSONformatdata = JSON.stringify(newcart);
                
            xhr.send(JSONformatdata);
            
            xhr.onreadystatechange = function(){
            if(xhr.readyState == 4 && xhr.status == 200)
            {
            }
            var modal = document.querySelector('.success');
            modal.classList.add('success-active');
            setTimeout(function () {
                window.location.replace('http://localhost:5001/catalogue')
            }, 2000);
            }
        }
    }
    else{
        alert("You have already placed it in cart!")
    }
    
}