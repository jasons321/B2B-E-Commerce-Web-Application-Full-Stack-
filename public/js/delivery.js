var allcatalogue;

window.onload = function () {
    loadDelivery();
};

let transactionKey;
var allTransactions

//Load all the transactions/orders from the specific user 
function loadDelivery() {
    createXhrRequest("GET", 'http://localhost:5001/getdelivery', function (err, response) {
        if (err) { console.log("Error!"); }
        alldelivery = JSON.parse(response);
        allTransactions = alldelivery
    });
    var table = document.getElementById('tables')
    var count = 1;
    for (delivery in allTransactions) {
        //Take all the transactions that are not completed - which means it is ongoing 
        if (allTransactions[delivery].transaction.orderStatus != "Completed") {
            //Insert into the table 
            transactionKey = allTransactions[delivery].transaction.idTransaction
            var row = table.insertRow(count);
            var transactionID = row.insertCell(0);
            var status = row.insertCell(1);
            var total = row.insertCell(2);
            var dateOrdered = row.insertCell(3);
            var button = row.insertCell(4);
            transactionID.innerHTML = transactionKey.toString();
            status.innerHTML = allTransactions[delivery].transaction.orderStatus.toString();
            total.innerHTML = parseInt(allTransactions[delivery].transaction.totalValue.toString());
            dateOrdered.innerHTML = allTransactions[delivery].transaction.dateOrdered.split('T')[0];
            button.innerHTML = '<div onclick ="viewMore(this);" class="button">View More</div>'
            if (allTransactions[delivery].transaction.orderStatus == "Waiting Payment" ||allTransactions[delivery].transaction.orderStatus == "Payment Rejected") {
                button.innerHTML += '<div onclick ="viewUpload(this);" class="button-waiting">Upload</div>'
            }
            else if (allTransactions[delivery].transaction.orderStatus == "Delivering") {
                button.innerHTML += '<div onclick ="completed(this);" class="button-complete">Completed</div>'
            }
            count++
        }
    }
}

//View a record in better detail 
function viewMore(selectedRow) {
    var modal = document.querySelector('.modal-container');
    var table = document.getElementById('tables')
    var rownumber = selectedRow.parentElement.parentElement.rowIndex
    modal.classList.add('container-active');
    var idRow = document.getElementById('transcID');
    var dateOrdered = document.getElementById('ordered');
    var orderStatus = document.getElementById('orderStatus')
    var transactionID = table.rows[rownumber].cells[0].innerHTML;
    //Takes all the transaction details - products, variants, quantities ordered... 
    for (transaction in allTransactions) {
        if (allTransactions[transaction].transaction.idTransaction == transactionID) {
            idRow.innerHTML += 'Transaction ID: ' + table.rows[rownumber].cells[0].innerHTML;
            dateOrdered.innerHTML += 'Date Ordered: ' + table.rows[rownumber].cells[3].innerHTML;
            orderStatus.innerHTML += 'Status: ' + table.rows[rownumber].cells[1].innerHTML;
        }
    }
    addProductList(transactionID)
}

//Add all the product ordered into the popup menu in the form of a table 
function addProductList(transactionID) {
    var count = 1;
    var table = document.getElementById('table-list')
    for (transaction in allTransactions){
        if (allTransactions[transaction].transaction.idTransaction == transactionID) {
            var allDetails = allTransactions[transaction].details
            for (detail in allDetails) {

                var row = table.insertRow(count);
                var product = row.insertCell(0);
                var category = row.insertCell(1);
                var quantity = row.insertCell(2);
                product.innerHTML = allDetails[detail].products.name + allDetails[detail].variant.variantName 
                category.innerHTML = allDetails[detail].products.category;
                quantity.innerHTML = allDetails[detail].details.quantity;
                count++
            }
        }
    }

}

//Close the popup menu for viewing transaction/order details 
function back() {
    var modal = document.querySelector('.modal-container');
    modal.classList.remove('container-active');
    var transcID = document.getElementById('transcID');
    var dateOrdered = document.getElementById('ordered');
    var status = document.getElementById('orderStatus')
    transcID.removeChild(transcID.firstChild);
    dateOrdered.removeChild(ordered.firstChild);
    status.removeChild(status.firstChild);
    deleteRows()
}

//Close window for uploading proof of payment if the status of the order is "waiting payment"
function closeUpload() {
    var modal = document.querySelector('.modal-container-upload');
    modal.classList.remove('container-active');
}

function deleteRows() {
    var tablelists = document.getElementById('table-list');
    var numofrows = tablelists.rows.length;
    for (let x = numofrows - 1; x > 0; x--) {
        tablelists.deleteRow(x)
    }
}

//Update a record into completed once it has been delivered 
function completed(selectedRow) {
    var table = document.getElementById('tables')
    var rownumber = selectedRow.parentElement.parentElement.rowIndex
    var transactionID = table.rows[rownumber].cells[0].innerHTML;
    for (delivery in alldelivery) {
        if (alldelivery[delivery].idTransaction = transactionID) {
            var userID = alldelivery[delivery].userID
            var dateOrdered = alldelivery[delivery].dateOrdered
            var total = alldelivery[delivery].Total
        }
    }
    var data = {};
    data.orderStatus = "Completed";
    var JSONformatdata = JSON.stringify(data);
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", "http://localhost:5001/updateComplete/" + transactionID.toString(), true);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.onload = function () {
        var users = JSON.parse(xhr.responseText);
        if (xhr.readyState == 4 && xhr.status == "200") {
        } else {
            console.error(users);
        }
    }
    xhr.send(JSONformatdata);
    location.reload();
}

var transactionID

function viewUpload(selectedRow) {
    var modal = document.querySelector('.modal-container-upload');
    var table = document.getElementById('tables')
    var rownumber = selectedRow.parentElement.parentElement.rowIndex
    var idTransaction = table.rows[rownumber].cells[0].innerHTML;
    transactionID = idTransaction
    modal.classList.add('container-active');
}

//Function that is called when the user uploads an image
function uploadImage() {
    //If it is empty dont proceed with the process 
    if (document.getElementById('myFile').files[0] == undefined) {
        alert("You need to upload an image")
    }
    else {
        //Create a formdata to store the images 
        var formData = new FormData()
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:5001/uploadpayment/" + transactionID, true);
        //Retrieve the uploaded images and store in "uploadedfile"
        formData.append("uploaded_file", document.getElementById('myFile').files[0]);
        xhr.send(formData);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
            }
        }
        var newstatus = {
            orderStatus: "Payment Uploaded"
        }
        var JSONformatdata = JSON.stringify(newstatus);
        var xhr = new XMLHttpRequest();
        xhr.open("PUT", "http://localhost:5001/updateStatus/" + transactionID, true);
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
            }
        }
        //Send the collected data 
        xhr.send(JSONformatdata);
        window.location.reload()
    }
}

//Source: https://newbedev.com/javascript-number-format-javascript-rupiah-code-example
function convertRup(numb) {
    const format = numb.toString().split('').reverse().join('');
    const convert = format.match(/\d{1,3}/g);
    const rupiah = convert.join('.').split('').reverse().join('')

    return rupiah
}