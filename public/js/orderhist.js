var allDelivery; 

window.onload = function () {
    loadCompletedTransactions();
};

function loadCompletedTransactions() {
    createXhrRequest("GET", 'http://localhost:5001/getdelivery', function (err, response) {
        if (err) { console.log("Error!"); }
        allDelivery = JSON.parse(response);
        allTransactions = allDelivery
    });
    var table = document.getElementById('tables')
    var count = 1;
    for (transaction in allTransactions) {
        if (allTransactions[transaction].transaction.orderStatus == "Completed" ) {
            transactionKey = allTransactions[transaction].transaction.idTransaction
            var row = table.insertRow(count);
            var transactionID = row.insertCell(0);
            var status = row.insertCell(1);
            var total = row.insertCell(2);
            var dateOrdered = row.insertCell(3);
            var button = row.insertCell(4);
            transactionID.innerHTML = transactionKey.toString();
            status.innerHTML = allTransactions[transaction].transaction.orderStatus.toString();
            total.innerHTML = parseInt(allTransactions[transaction].transaction.totalValue.toString());
            dateOrdered.innerHTML = allTransactions[transaction].transaction.dateOrdered.split('T')[0];
            button.innerHTML = '<div onclick ="viewMore(this);" class="button">View More</div>'
            if (allTransactions[transaction].transaction.orderStatus == "Waiting Payment" ||allTransactions[transaction].transaction.orderStatus == "Payment Rejected") {
                button.innerHTML += '<div onclick ="viewUpload(this);" class="button-waiting">Upload</div>'
            }
            else if (allTransactions[transaction].transaction.orderStatus == "Delivering") {
                button.innerHTML += '<div onclick ="completed(this);" class="button-complete">Completed</div>'
            }
            count++
        }
    }
}

function viewMore(selectedRow) {
    var modal = document.querySelector('.modal-container');
    var table = document.getElementById('tables')
    var rownumber = selectedRow.parentElement.parentElement.rowIndex
    modal.classList.add('container-active');
    var transacationID = document.getElementById('transcID');
    var dateOrdered = document.getElementById('ordered');
    var status = document.getElementById('status')
    var idTransaction = table.rows[rownumber].cells[0].innerHTML;
    transacationID.innerHTML += 'Transaction ID: ' + idTransaction;
    dateOrdered.innerHTML += 'Date Ordered: ' + table.rows[rownumber].cells[3].innerHTML;
    status.innerHTML += 'Status: ' + table.rows[rownumber].cells[1].innerHTML;
    addProducts(idTransaction)

}

function addProducts(transactionID) {
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

function back() {
    var modal = document.querySelector('.modal-container');
    modal.classList.remove('container-active');
    var transcID = document.getElementById('transcID');
    var dateO = document.getElementById('ordered');
    var status = document.getElementById('status')
    transcID.removeChild(transcID.firstChild);
    dateO.removeChild(dateO.firstChild);
    status.removeChild(status.firstChild);
    deleteRows()
}

function deleteRows() {
    var tablelists = document.getElementById('table-list');
    var numofrows = tablelists.rows.length;
    for (let x = numofrows - 1; x > 0; x--) {
        tablelists.deleteRow(x)
    }
}
