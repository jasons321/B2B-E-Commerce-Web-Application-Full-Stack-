window.onload = function () {
    loadallTransactions();
};

var allTransactions

function loadallTransactions() {
    createXhrRequest("GET", 'http://localhost:5001/getalltransactions', function (err, response) {
        if (err) { console.log("Error!"); }
        var allTransactions = JSON.parse(response);
        allTransactions = allTransactions

    });
    var count = 1;
    for (transaction in allTransactions) {
        //Get all the transactions where the payment has been uploaded and needs to be reviewed 
        if (allTransactions[transaction].transaction.orderStatus == "Payment Uploaded") {
            var table = document.getElementById('maintable')
            var row = table.insertRow(count);
            var transactionID = row.insertCell(0);
            var status = row.insertCell(1);
            var paymentProof = row.insertCell(2);
            var userID = row.insertCell(3);
            var totalValue = row.insertCell(4);
            var button = row.insertCell(5);

            transactionID.innerHTML = allTransactions[transaction].transaction.idTransaction.toString();
            status.innerHTML = allTransactions[transaction].transaction.orderStatus.toString();
            paymentProof.innerHTML = '<div onclick ="viewImage(this);" class="viewimage">View</div>'
            userID.innerHTML = allTransactions[transaction].transaction.userID.toString();
            totalValue.innerHTML = parseInt(allTransactions[transaction].transaction.totalValue.toString());
            button.innerHTML += '<div onclick ="viewMore(this);" class="viewbutton">View More</div>'
            button.innerHTML += '<div onclick ="accept(this);" class="acceptbutton">Accept</div>'
            button.innerHTML += '<div onclick ="reject(this);" class="rejectbutton">Reject</div>'

            count++
        }
    }
}

//View the payment proof uploaded in the form of an image 
function viewImage(row) {
    var modal = document.querySelector('.create-form');
    modal.classList.add('create-form-active');
    let sidebar = document.querySelector(".sidebar")
    sidebar.classList.remove("active");
    var table = document.getElementById('maintable')
    var rowNumber = row.parentElement.parentElement.rowIndex
    var transactionID = table.rows[rowNumber].cells[0].innerHTML;
    for (transaction in allTransactions) {
        if (allTransactions[transaction].transaction.idTransaction == transactionID) {
            document.getElementById('proofofpayement').innerHTML += '<img class="allimages" src="' + allTransactions[transaction].transaction.paymentproof + '">'
        }
    }
}

function removeAll() {
    var modal = document.querySelector('.create-form');
    modal.classList.remove('create-form-active');
    document.getElementById('proofofpayement').innerHTML = ''
}

function accept(row) {
    var table = document.getElementById('maintable')
    var rowNumber = row.parentElement.parentElement.rowIndex
    var transactionID = table.rows[rowNumber].cells[0].innerHTML;
    for (transaction in allTransactions){
        if (allTransactions[transaction].transaction.idTransaction == transactionID){
            var totalSales = allTransactions[transaction].transaction.totalUnits
            var totalRevenue = allTransactions[transaction].transaction.totalValue
        }
    }
    //Update the status if accepted 
    var newStatus = {
        orderStatus: "Payment Approved",
        totalSales: totalSales, 
        totalRevenue: totalRevenue
    }
    var JSONformatdata = JSON.stringify(newStatus);
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", "http://localhost:5001/updateStatus/" + transactionID, true);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
        }
    }
    xhr.send(JSONformatdata);
    window.location.reload()
}


function reject(row) {
    var table = document.getElementById('maintable')
    var rowNumber = row.parentElement.parentElement.rowIndex
    var transactionID = table.rows[rowNumber].cells[0].innerHTML;
    var newStatus = {
        orderStatus: "Payment Rejected"
    }
    //Update the status if rejected 
    var JSONformatdata = JSON.stringify(newStatus);
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", "http://localhost:5001/updateStatus/" + transactionID, true);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
        }
    }
    xhr.send(JSONformatdata);
    window.location.reload()
}

function sortByAmount() {
    var table = document.getElementById('maintable')
    var tr = table.getElementsByTagName("tr");
    var tableLength = tr.length - 1
    for (var x = 1; x <= tableLength; x++) {
        for (var y = 1; y <= tableLength - 1; y++) {
            if (document.getElementById('amount').value == "Descending") {
                if (parseInt(tr[y].getElementsByTagName("td")[4].innerHTML) < parseInt(tr[y + 1].getElementsByTagName("td")[4].innerHTML)) {
                    tr[y].parentNode.insertBefore(tr[y + 1], tr[y])
                }
            }
            else if (document.getElementById('amount').value == "Ascending") {
                if (parseInt(tr[y].getElementsByTagName("td")[4].innerHTML) > parseInt(tr[y + 1].getElementsByTagName("td")[4].innerHTML)) {
                    tr[y].parentNode.insertBefore(tr[y + 1], tr[y])
                }
            }

        }
    }
}

function filterListByUserId() {
    var userID = document.getElementById('userid').value
    var table = document.getElementById('maintable')
    var tr = table.getElementsByTagName("tr");
    var tableLength = tr.length - 1

    for (var x = 1; x <= tableLength; x++) {
        if (userID == "") {
            table.getElementsByTagName("tr")[x].style.display = ""
        } else {
            if (tr[x].getElementsByTagName("td")[3].innerHTML.toString() == userID) {
                table.getElementsByTagName("tr")[x].style.display = ""
            }
            else {
                table.getElementsByTagName("tr")[x].style.display = "none"         
            }
        }

    }
}

function viewMore(row) {
    var table = document.getElementById('maintable')
    var rowNumber = row.parentElement.parentElement.rowIndex
    var modal = document.querySelector('.modal-container');
    var transactionID = table.rows[rowNumber].cells[0].innerHTML;

    modal.classList.add('create-form-active');
    for (transaction in allTransactions) {
        if (allTransactions[transaction].transaction.idTransaction == transactionID) {

            document.getElementById('transcID').innerHTML = "Transaction ID: " + allTransactions[transaction].transaction.idTransaction
            document.getElementById('ordered').innerHTML = "Date Ordered: " + allTransactions[transaction].transaction.dateOrdered.split('T')[0]
            document.getElementById('status').innerHTML = "Order Status: " + allTransactions[transaction].transaction.orderStatus

            var alldetails = allTransactions[transaction].details
            var detailsCount = 1;
            for (details in alldetails) {
                var detailsTable = document.getElementById('table-list')
                var detailsRow = detailsTable.insertRow(detailsCount);
                var productName = detailsRow.insertCell(0);
                var category = detailsRow.insertCell(1);
                var quantity = detailsRow.insertCell(2);
                productName.innerHTML = alldetails[details].products.name + " - " + alldetails[details].variant.variantName
                category.innerHTML = alldetails[details].products.category
                quantity.innerHTML = alldetails[details].details.quantity

                detailsCount++
            }
        }
    }

}

function closeTransaction() {
    var detailsTable = document.getElementById('table-list')
    var numofrows = detailsTable.rows.length;
    for (let x = numofrows - 1; x > 0; x--) {
        detailsTable.deleteRow(x)
    }
    var modal = document.querySelector('.modal-container');
    modal.classList.remove('create-form-active');

}