
//Source: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
var createXhrRequest = function (httpMethod, url, callback) {
    //Create a XML HTTP Request 
    var xhr = new XMLHttpRequest();
    //The method accepts the http method (post,put,delete, get...) and the URL to be requested
    xhr.open(httpMethod, url);
    //When the request is complete uses a callback so the process can come back to retrieve the response
    xhr.onload = function () {
        callback(null, xhr.response);
    };
    //Called when a request wasnt successful 
    xhr.onerror = function () {
        callback(xhr.response);
    };
    //Not necessary for get requests, but POST/PUT requires this 
    xhr.send();
}

window.onload = function () {
    loadTransactions();
};

var alltransactions

//Load the transactions that relevant to the logistics department 
function loadTransactions() {
    var table = document.getElementById('maintable-log')
    var count = 1;
    //
    createXhrRequest("GET", 'http://localhost:5001/getalllogistics' , function (err, response) {
        if (err) { console.log("Error!"); } 
        allTransactions = JSON.parse(response);
        alltransactions = allTransactions 
        for (var x = 0; x < allTransactions.length; x++) {
            //insert all the values into a table 
            var row = table.insertRow(count);
            var transactionID = row.insertCell(0);
            var name = row.insertCell(1);
            var storeName = row.insertCell(2);
            var status = row.insertCell(3);
            var button = row.insertCell(4);
            transactionID.innerHTML = allTransactions[x].transaction.idTransaction.toString();
            name.innerHTML =  allTransactions[x].user.name
            storeName.innerHTML = allTransactions[x].user.storeName
            status.innerHTML =  allTransactions[x].transaction.orderStatus
            //Include different buttons for different types of statuses 
            if ( allTransactions[x].transaction.orderStatus=="Processing"){
                button.innerHTML += '<div onclick ="view(this);" class="viewtransc">View Transaction</div>  <div onclick ="confirmChange(this);" class="update">Delivering</div>'
            }
            else if (allTransactions[x].transaction.orderStatus=="Payment Approved"){
                button.innerHTML += '<div onclick ="view(this);" class="viewtransc">View Transaction</div>  <div onclick ="confirmChange(this);" class="update">Processing</div>'
            }
            else{
                button.innerHTML += '<div onclick ="view(this);" class="viewtransc">View Transaction</div> '

            }
            count++
        }

    });
}

function view(row){
    var table = document.getElementById('maintable-log')
    var count = 1;
    var rowNumber = row.parentElement.parentElement.rowIndex
    var tID = table.rows[rowNumber].cells[0].innerHTML;
    for(transaction in allTransactions){
        if (allTransactions[transaction].transaction.idTransaction == parseInt(tID)){
            document.getElementById('addressform').innerHTML+= "Address: "+allTransactions[transaction].user.address
            var table1 = document.getElementById('maintable-det')
            for (var x = 0; x < allTransactions[transaction].transactionDetails.length; x++) {
                //When user clicks view, load all the transaction details which include - products ordered, quantity, model name, date ordered... 
                var row = table1.insertRow(count);
                var productName = row.insertCell(0);
                var category = row.insertCell(1);
                var totalSales = row.insertCell(2);
                var quantity = row.insertCell(3);
                productName.innerHTML = allTransactions[transaction].transactionDetails[x].products.name.toString();
                category.innerHTML =  allTransactions[transaction].transactionDetails[x].products.category
                totalSales.innerHTML = allTransactions[transaction].transactionDetails[x].variant
                quantity.innerHTML = allTransactions[transaction].transactionDetails[x].details.quantity
                count++
            }
        } 
    }
    var modal = document.querySelector('.create-form');
    modal.classList.add('create-form-active');
}

//Remove the rows and details in html once the user closes the popup 
function removeRows(){
    var address = document.getElementById('addressform');
    address.removeChild(address.firstChild);
    var tableLists = document.getElementById('maintable-det');
    var numofrows = tableLists.rows.length;
    for (let x = numofrows - 1; x > 0; x--) {
        tableLists.deleteRow(x)
    }
    var modal = document.querySelector('.create-form');
    modal.classList.remove('create-form-active');
}

//This function is mainly used to update records 
function confirmChange(row){
    var table = document.getElementById('maintable-log')
    var rowNumber = row.parentElement.parentElement.rowIndex
    var transactionID = table.rows[rowNumber].cells[0].innerHTML;
    for(transaction in allTransactions){
        if (allTransactions[transaction].transaction.idTransaction == parseInt(transactionID)){
            if (allTransactions[transaction].transaction.orderStatus == "Payment Approved")
            var newStatus = {
                orderStatus: "Processing"
            }
            else if(allTransactions[transaction].transaction.orderStatus == "Processing"){
                var newStatus = {
                    orderStatus: "Delivering"
                }
            }
            var JSONformatdata = JSON.stringify(newStatus);
            var xhr = new XMLHttpRequest();
            //Calls the api to update the record 
            xhr.open("PUT", "http://localhost:5001/updateStatus/"+transactionID.toString(), true);
            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            xhr.onload = function () {
                if (xhr.readyState == 4 && xhr.status == "200") {
                } else {
                    console.error(users);
                }
            }
            xhr.send(JSONformatdata);
            location.reload()
        
        } 
}}