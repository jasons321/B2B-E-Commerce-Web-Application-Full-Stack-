window.onload = function () {
    loadCatalogue();
};

var allProductAndModelInformation

function loadCatalogue() {
    var currentLocation = window.location.pathname;
    productID = currentLocation.replace("/catalogue/admin/", "");
    createXhrRequest("GET", 'http://localhost:5001/getallcatinfo/' + productID, function (err, response) {
        if (err) { console.log("Error!"); }
        allProductInformation = JSON.parse(response);
        allProductAndModelInformation =allProductInformation
        //Inserting all the specific product information into either forms or static information as it cant be edited 
        document.getElementById("prodID").innerHTML += allProductInformation.product[0].productID
        document.getElementById("totalSales").innerHTML += allProductInformation.product[0].totalSales
        document.getElementById("dateAdded").innerHTML += allProductInformation.product[0].dateAdded.split('T')[0]
        document.getElementById("dateModified").innerHTML += allProductInformation.product[0].dateModified.split('T')[0]
        document.getElementById("desc").innerHTML += '<li><input class ="inputform" id = "descriptionform" type="text"  value="' + allProductInformation.product[0].description + '" </li>'
        document.getElementById("nameul").innerHTML += '<li><input class ="inputform" id = "newnameform" type="text"  value="' + allProductInformation.product[0].name + '" </li>'
        document.getElementById("cat").innerHTML += '<li><input class ="inputform" id = "categoryform" type="text"  value="' + allProductInformation.product[0].category + '" </li>'

        var table = document.getElementById('varianttable')
        var count = 1;

        //Loop that generates a table filled with all the variants of a specific product 
        for (var x = 0; x < allProductInformation.variantInformation.length; x++) {
            var row = table.insertRow(count);
            var variantID = row.insertCell(0);
            var modelName = row.insertCell(1);
            var quantity = row.insertCell(2);
            var price = row.insertCell(3);
            var button = row.insertCell(4);
            variantID.innerHTML = allProductInformation.variantInformation[x].variant.idvariant.toString();
            modelName.innerHTML = '<input class ="inputform" type="text"  value= "' + allProductInformation.variantInformation[x].variant.variantName + '" >';
            quantity.innerHTML = '<input class ="inputform" type="text"  value= "' + allProductInformation.variantInformation[x].variant.quantity + '" >';
            price.innerHTML = '<input class ="inputform" type="text"  value= "' + allProductInformation.variantInformation[x].variant.price + '" >';
            button.innerHTML += '<div onclick ="view(this);" class="viewimage">View Image</div>  <div onclick ="confirmChange(this);" class="editthis">Confirm</div>'
            count++
        }

    });

}

//when the admin confirms the change fo information - this function is triggered 
function confirmChange(row) {
    var table = document.getElementById('varianttable')
    var rowNumber = row.parentElement.parentElement.rowIndex
    var variantID = table.rows[rowNumber].cells[0].innerHTML;
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", "http://localhost:5001/editModel/" + variantID, true);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.onload = function () {
        if (xhr.readyState == 4 && xhr.status == "200") {

        } else {
        }
    }
    var updatedModel = {};

    updatedModel.name = table.rows[rowNumber].cells[1].firstChild.value;
    updatedModel.quantity = parseInt(table.rows[rowNumber].cells[2].firstChild.value);
    updatedModel.price = parseInt(table.rows[rowNumber].cells[3].firstChild.value);

    var JSONformatdata = JSON.stringify(updatedModel);
    xhr.send(JSONformatdata);
    window.location.reload();
}

function addMenu() {
    var modal = document.querySelector('.create-form');
    modal.classList.add('create-form-active');
    let sidebar = document.querySelector(".sidebar")
    sidebar.classList.remove("active");
}

//https://stackoverflow.com/questions/5587973/javascript-upload-file
//Add a new model or variant to the product 
function addModel() {
    var xhr = new XMLHttpRequest();
    var formData = new FormData()
    var currentLocation = window.location.pathname;
    productID = currentLocation.replace("/catalogue/admin/", "");
    var modelName = document.getElementById("inputmodel").value;
    var price = document.getElementById("inputprice").value;
    var quantity = document.getElementById("inputstock").value;
    if (modelName == "" || price == "" || quantity == "") {
        alert("Can't be empty");
    } else {
        xhr.open("POST", "http://localhost:5001/addmodel/" + productID, true);
        var ins = document.getElementById('myFile').files.length
        for (var x = 0; x < ins; x++) {
            formData.append("uploaded_file", document.getElementById('myFile').files[x]);
        }
        var newModel = {
            name: modelName,
            price: price,
            quantity: quantity
        }
        formData.append("newModel", JSON.stringify(newModel));
        xhr.send(formData);

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
            }
        }
        var modal = document.querySelector('.addedmodel');
        modal.classList.add('addedmodel-active');
        setTimeout(function () {
            window.location.reload();
        }, 2000);
    }


}

//Save changes for the product information if edited 
function saveChanges() {
    var newcat = {};
    newcat.description = document.getElementById("descriptionform").value;
    newcat.name = document.getElementById("newnameform").value;
    newcat.category = document.getElementById("categoryform").value;
    var currentLocation = window.location.pathname;
    productID = currentLocation.replace("/catalogue/admin/", "");
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", "http://localhost:5001/editCatalogue/" + productID, true);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

    var JSONformatdata = JSON.stringify(newcat);

    xhr.onload = function () {
        var users = JSON.parse(xhr.responseText);
        if (xhr.readyState == 4 && xhr.status == "200") {
        } else {
            console.error(users);
        }
    }
    xhr.send(JSONformatdata);
    var modal = document.querySelector('.editproduct');
    modal.classList.add('success-active');
    setTimeout(function () {
        window.location.reload();
    }, 2000);
}

var imageList
var count 
var numlist

//View the images of a particular variant 
function view(row) {
    var table = document.getElementById('varianttable')
    var rowNumber = row.parentElement.parentElement.rowIndex
    var variantID = table.rows[rowNumber].cells[0].innerHTML;
    var allImage = []
    for (info in allProductAndModelInformation.variantInformation) {
        if (allProductAndModelInformation.variantInformation[info].variant.idvariant === parseInt(variantID)) {
            for (image in allProductAndModelInformation.variantInformation[info].imageInformation ){
                allImage.push(allProductAndModelInformation.variantInformation[info].imageInformation[image].imageaddress)
                numlist = info 
            }
        }
        var modal = document.querySelector('.image-container');
        modal.classList.add('image-container-active');
    }
    document.getElementById('imageid').innerHTML += '<div id="changeimage" onclick="editimage('+allProductAndModelInformation.variantInformation[numlist].imageInformation[0].idimages+')">Edit Image</div>'
    document.getElementById('image-carousel').innerHTML +=  '<img id="images" src="'+ allImage[0]+'"> '
    count =0 
    imageList = allImage
}

function move(num){
    //Triggers when the user clicks the "next" button to view the next images 
    var child = document.getElementById("images");
    var file = document.getElementById("changeimage");
    var parent = document.getElementById("image-carousel");
    var parentID = document.getElementById("imageid");
    parent.removeChild(child);
    parentID.removeChild(file);
    //Count is added to keep track of the image that is being viewed 
    count = count + num
    if (count>imageList.length-1){
        count=0;
    }
    else if(count<0){
        count = imageList.length-1
    }
    document.getElementById('imageid').innerHTML += '<div id="changeimage" onclick="editimage('+allProductAndModelInformation.variantInformation[numlist].imageInformation[count].idimages+')">Edit Image</div>'
    document.getElementById('image-carousel').innerHTML +=  '<img id="images" src="'+ imageList[count]+'"> '
}

function closeContainer() {
    var child = document.getElementById("images");
    var file = document.getElementById("changeimage");
    var parent = document.getElementById("image-carousel");
    var parentID = document.getElementById("imageid");
    parent.removeChild(child);
    parentID.removeChild(file);
    var modal = document.querySelector('.image-container');
    modal.classList.remove('image-container-active');
}

//Source: https://stackoverflow.com/questions/48859546/upload-image-to-server-with-xmlhttprequest-and-formdata-in-react-native 
function editimage(imageID){
    var xhr = new XMLHttpRequest();

    var formData = new FormData()

    if (document.getElementById('imagefile').files[0]==undefined){
        alert("You need to upload an image")
    }else{
        xhr.open("POST", "http://localhost:5001/updateimage/" + imageID, true);

        formData.append("uploaded_file", document.getElementById('imagefile').files[0]);

        xhr.send(formData);

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
            }

        }

        setTimeout(function () {
            window.location.reload();
        }, 2000);
    }
    
}