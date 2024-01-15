window.onload = function () {
    loadCatalogue()
};

function loadCatalogue() {
    var xhr = new XMLHttpRequest();
    xhr.open('get', 'http://localhost:5001/catalogue/all');
    xhr.send();
    xhr.onload = function () {
        allProducts = JSON.parse(xhr.response);
        var table = document.getElementById('maintable')
        var count = 1;
        for (product in allProducts.product ) {
            //once the catalogue has been loaded, display them into table format 
            var row = table.insertRow(count);
            var productID = row.insertCell(0);
            var name = row.insertCell(1);
            var totalSales = row.insertCell(2)
            var category = row.insertCell(3);
            var button = row.insertCell(4);
            productID.innerHTML = allProducts.product[product].productID
            name.innerHTML = allProducts.product[product].name;
            totalSales.innerHTML = allProducts.product[product].totalSales;
            category.innerHTML = allProducts.product[product].category;
            button.innerHTML += '<div onclick ="view(this);" class="viewbutton">View More</div>'
            count++
        }
    }
}

//open popup to add a new product 
function openAddMenu(){
    var modal = document.querySelector('.create-form');
    modal.classList.add('create-form-active');
    let sidebar = document.querySelector(".sidebar")
    sidebar.classList.remove("active");
}

//Add a new product to the catalogue 
function addProduct(){
    var xhr = new XMLHttpRequest();

    xhr.open("POST","http://localhost:5001/addproduct",true);    
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

   //var formdata = new FormData();
   var name = document.getElementById("inputName").value;
   var category = document.getElementById("inputCategory").value;
   var description = document.getElementById("inputDescription").value;

   //Collect the information into one object 
   var newProductInformation = {
       name:name, 
       category: category,
       description: description
   }

    var JSONformatdata = JSON.stringify(newProductInformation);
    //Send the new data into the backend for the new record to be added into the database 
    xhr.send(JSONformatdata);
    
    xhr.onreadystatechange = function(){
    if(xhr.readyState == 4 && xhr.status == 200)
    {
    }
    var modal = document.querySelector('.success');
    modal.classList.add('success-active');
    setTimeout(function () {
        window.location.replace('http://localhost:5001/catalogue/admin')
    }, 2000);
    }
}

function view(row) {
    var table = document.getElementById('maintable')
    var rowNumber = row.parentElement.parentElement.rowIndex
    var productID = table.rows[rowNumber].cells[0].innerHTML;
    window.location.replace('http://localhost:5001/catalogue/admin/' + productID.toString())
    
}