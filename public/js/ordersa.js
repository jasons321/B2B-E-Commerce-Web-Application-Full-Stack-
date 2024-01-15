window.onload = function () {
    loadAllOrders();
};

var allTransactions

function loadAllOrders() {
    //Get all the orders within the system 
    createXhrRequest("GET", 'http://localhost:5001/getallTransactions', function (err, response) {
        if (err) { console.log("Error!"); }
        var transactionAll = JSON.parse(response);
        allTransactions = transactionAll
    });
    var transactionCounts = 1;
    var approvalCounts = 1;
    for (transaction in allTransactions) {
        //If the status of the order is neither of these, place it into the table  
        if (allTransactions[transaction].transaction.orderStatus !== "Waiting Approval" && allTransactions[transaction].transaction.orderStatus !== "Payment Uploaded") {
            var table = document.getElementById('orderstable')
            var row = table.insertRow(transactionCounts);
            var transactionID = row.insertCell(0);
            var status = row.insertCell(1);
            var dateOrdered = row.insertCell(2);
            var dateCompleted = row.insertCell(3);
            var userID = row.insertCell(4);
            var totalValue = row.insertCell(5);
            var button = row.insertCell(6);
            transactionID.innerHTML = allTransactions[transaction].transaction.idTransaction.toString();
            status.innerHTML = allTransactions[transaction].transaction.orderStatus.toString();
            if (allTransactions[transaction].transaction.dateCompleted == null) {
                dateCompleted.innerHTML = ""
            }
            else {
                dateCompleted.innerHTML = allTransactions[transaction].transaction.dateCompleted.toString();
            }
            userID.innerHTML = allTransactions[transaction].transaction.userID.toString();
            totalValue.innerHTML = parseInt(allTransactions[transaction].transaction.totalValue.toString());
            dateOrdered.innerHTML = allTransactions[transaction].transaction.dateOrdered.split('T')[0];
            button.innerHTML = '<div onclick ="viewMore(this);" class="viewbutton">View More</div>'
            transactionCounts++
        }
        //If the status of the order is "waiting for approval", add it to this table  
        else if (allTransactions[transaction].transaction.orderStatus == "Waiting Approval") {
            var table = document.getElementById('pendingtable')
            var row = table.insertRow(approvalCounts);
            var transactionID = row.insertCell(0);
            var status = row.insertCell(1);
            var dateOrdered = row.insertCell(2);
            var userID = row.insertCell(3);
            var totalValue = row.insertCell(4);
            var button = row.insertCell(5);

            transactionID.innerHTML = allTransactions[transaction].transaction.idTransaction.toString();
            status.innerHTML = allTransactions[transaction].transaction.orderStatus.toString();
            userID.innerHTML = allTransactions[transaction].transaction.userID.toString();
            totalValue.innerHTML = parseInt(allTransactions[transaction].transaction.totalValue.toString());
            dateOrdered.innerHTML = allTransactions[transaction].transaction.dateOrdered.split('T')[0];
            button.innerHTML += '<div onclick ="viewMorePending(this);" class="viewbutton">View More</div>'
            button.innerHTML += '<div onclick ="acceptOrder(this);" class="acceptbutton">Accept</div>'

            approvalCounts++
        }
    }
}

function acceptOrder(row) {
    //View an order and accept ones that are waiting for approval 
    var table = document.getElementById('pendingtable')
    var rowNumber = row.parentElement.parentElement.rowIndex
    var transactionID = table.rows[rowNumber].cells[0].innerHTML;
    for (transaction in allTransactions){
        //Cyles through the transactions to find the one that is being accepted 
        if(allTransactions[transaction].transaction.idTransaction==transactionID){
            var allNewVariantInformation = []
            for (details in allTransactions[transaction].details ){
                //Update the stock quantity 
                var newStock = allTransactions[transaction].details[details].variant.quantity -allTransactions[transaction].details[details].details.quantity
                var newVariant = {
                    variantID :allTransactions[transaction].details[details].details.variantID,
                    newStock :newStock
                }
                allNewVariantInformation.push(newVariant)
            }
            break; 
        }
    }
    //New stock indicates the new quantity once the poruct has been ordered 
    var newStatus = {
        orderStatus: "Waiting Payment",
        newStock: allNewVariantInformation
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
    setTimeout(function () {
        window.location.reload()
    }, 4000);
}


function filterOrdersByStatus() {
    var table = document.getElementById('orderstable')
    var tr = table.getElementsByTagName("tr");
    var tableLength = tr.length - 1
    for (var x = 1; x <= tableLength; x++) {
        if (document.getElementById('status').value == "") {
            table.getElementsByTagName("tr")[x].style.display = ""
        } else {
            if (tr[x].getElementsByTagName("td")[1].innerHTML.toString() == document.getElementById('status').value.toString()) {
                table.getElementsByTagName("tr")[x].style.display = ""
            }
            else {
                table.getElementsByTagName("tr")[x].style.display = "none"

            }
        }

    }
}

function sortByAmount() {
    var table = document.getElementById('orderstable')
    var tr = table.getElementsByTagName("tr");
    var tableLength = tr.length - 1
    for (var x = 1; x <= tableLength; x++) {
        for (var y = 1; y <= tableLength - 1; y++) {
            if (document.getElementById('amount').value == "Descending") {
                if (parseInt(tr[y].getElementsByTagName("td")[5].innerHTML) < parseInt(tr[y + 1].getElementsByTagName("td")[5].innerHTML)) {
                    tr[y].parentNode.insertBefore(tr[y + 1], tr[y])
                }
            }
            else if (document.getElementById('amount').value == "Ascending") {
                if (parseInt(tr[y].getElementsByTagName("td")[5].innerHTML) > parseInt(tr[y + 1].getElementsByTagName("td")[5].innerHTML)) {
                    tr[y].parentNode.insertBefore(tr[y + 1], tr[y])
                }
            }

        }
    }
}

function sortByDate() {
    var table = document.getElementById('orderstable')
    var tr = table.getElementsByTagName("tr");
    var tableLength = tr.length - 1
    for (var x = 1; x <= tableLength; x++) {
        for (var y = 1; y <= tableLength - 1; y++) {
            if (document.getElementById('date').value == "Recent") {
                if (tr[y].getElementsByTagName("td")[2].innerHTML < tr[y + 1].getElementsByTagName("td")[2].innerHTML) {
                    tr[y].parentNode.insertBefore(tr[y + 1], tr[y])
                }
            }
            else if (document.getElementById('date').value == "Latest") {
                if (tr[y].getElementsByTagName("td")[2].innerHTML > tr[y + 1].getElementsByTagName("td")[2].innerHTML) {
                    tr[y].parentNode.insertBefore(tr[y + 1], tr[y])
                }
            }
        }
    }
}

function filterListByUserId() {
    var userID = document.getElementById('inputuserid').value
    var table = document.getElementById('orderstable')
    var tr = table.getElementsByTagName("tr");
    var tableLength = tr.length - 1

    for (var x = 1; x <= tableLength; x++) {
        if (userID == "") {
            table.getElementsByTagName("tr")[x].style.display = ""
        } else {
            if (tr[x].getElementsByTagName("td")[4].innerHTML.toString() == userID) {
                table.getElementsByTagName("tr")[x].style.display = ""
            }
            else {
                table.getElementsByTagName("tr")[x].style.display = "none"
            }
        }
    }
}

function sortByAmountPending() {
    var table = document.getElementById('pendingtable')
    var tr = table.getElementsByTagName("tr");
    var tableLength = tr.length - 1
    for (var x = 1; x <= tableLength; x++) {
        for (var y = 1; y <= tableLength - 1; y++) {
            if (document.getElementById('pendingamount').value == "Descending") {
                if (parseInt(tr[y].getElementsByTagName("td")[4].innerHTML) < parseInt(tr[y + 1].getElementsByTagName("td")[4].innerHTML)) {
                    tr[y].parentNode.insertBefore(tr[y + 1], tr[y])
                }
            }
            else if (document.getElementById('pendingamount').value == "Ascending") {
                if (parseInt(tr[y].getElementsByTagName("td")[4].innerHTML) > parseInt(tr[y + 1].getElementsByTagName("td")[4].innerHTML)) {
                    tr[y].parentNode.insertBefore(tr[y + 1], tr[y])
                }
            }
        }
    }
}

function sortByDatePending() {
    var table = document.getElementById('pendingtable')
    var tr = table.getElementsByTagName("tr");
    var tableLength = tr.length - 1

    for (var x = 1; x <= tableLength; x++) {
        for (var y = 1; y <= tableLength - 1; y++) {
            if (document.getElementById('pendingdate').value == "Recent") {
                if (tr[y].getElementsByTagName("td")[2].innerHTML < tr[y + 1].getElementsByTagName("td")[2].innerHTML) {
                    tr[y].parentNode.insertBefore(tr[y + 1], tr[y])
                }
            }
            else if (document.getElementById('pendingdate').value == "Latest") {
                if (tr[y].getElementsByTagName("td")[2].innerHTML > tr[y + 1].getElementsByTagName("td")[2].innerHTML) {
                    tr[y].parentNode.insertBefore(tr[y + 1], tr[y])
                }
            }

        }
    }
}

function filterOrdersByStatusPending() {
    var userid = document.getElementById('pendinguserid').value
    var table = document.getElementById('pendingtable')
    var tr = table.getElementsByTagName("tr");
    var tableLength = tr.length - 1

    for (var x = 1; x <= tableLength; x++) {
        if (userid == "") {
            table.getElementsByTagName("tr")[x].style.display = ""
        } else {
            if (tr[x].getElementsByTagName("td")[3].innerHTML.toString() == userid) {
                table.getElementsByTagName("tr")[x].style.display = ""
            }
            else {
                table.getElementsByTagName("tr")[x].style.display = "none"
            }
        }
    }
}

function viewMore(row){
    var table = document.getElementById('orderstable')
    var rowNumber = row.parentElement.parentElement.rowIndex
    var modal = document.querySelector('.modal-container');
    var transactionID = table.rows[rowNumber].cells[0].innerHTML;

    modal.classList.add('create-form-active');
    for (transaction in allTransactions){
        if(allTransactions[transaction].transaction.idTransaction==transactionID){
            document.getElementById('transcID').innerHTML= "Transaction ID: "+allTransactions[transaction].transaction.idTransaction
            document.getElementById('ordered').innerHTML="Date Ordered: "+allTransactions[transaction].transaction.dateOrdered.split('T')[0]
            document.getElementById('detstatus').innerHTML="Order Status: "+allTransactions[transaction].transaction.orderStatus

            var allDetails = allTransactions[transaction].details
            var detailsCount =1;
            for (details in allDetails){
                var detailsTable = document.getElementById('table-list')
                var detailsTableRow = detailsTable.insertRow(detailsCount);
                var productName = detailsTableRow.insertCell(0);
                var category = detailsTableRow.insertCell(1);
                var quantity = detailsTableRow.insertCell(2);
                productName.innerHTML= allDetails[details].products.name +" - " +allDetails[details].variant.variantName 
                category.innerHTML =allDetails[details].products.category
                quantity.innerHTML =allDetails[details].details.quantity

                detailsCount++
            }
        }
    }

}

function closeTransaction(){
    var detailsTable = document.getElementById('table-list')
    var numberOfRows = detailsTable.rows.length;
    for (let x = numberOfRows - 1; x > 0; x--) {
        detailsTable.deleteRow(x)
    }
    var modal = document.querySelector('.modal-container');
    modal.classList.remove('create-form-active');
    
}

function viewMorePending(row){
    var table = document.getElementById('pendingtable')
    var rowNumber = row.parentElement.parentElement.rowIndex
    var modal = document.querySelector('.modal-container');
    var transactionID = table.rows[rowNumber].cells[0].innerHTML;

    modal.classList.add('create-form-active');
    for (transaction in allTransactions){
        if(allTransactions[transaction].transaction.idTransaction==transactionID){
            document.getElementById('transcID').innerHTML= "Transaction ID: "+allTransactions[transaction].transaction.idTransaction
            document.getElementById('ordered').innerHTML="Date Ordered: "+allTransactions[transaction].transaction.dateOrdered.split('T')[0]
            document.getElementById('detstatus').innerHTML="Order Status: "+allTransactions[transaction].transaction.orderStatus

            var allDetails = allTransactions[transaction].details
            var detailsCount =1;
            for (details in allDetails){
                var detailsTable = document.getElementById('table-list')
                var detailsTableRow = detailsTable.insertRow(detailsCount);
                var productName = detailsTableRow.insertCell(0);
                var category = detailsTableRow.insertCell(1);
                var quantity = detailsTableRow.insertCell(2);
                productName.innerHTML= allDetails[details].products.name +" - " +allDetails[details].variant.variantName 
                category.innerHTML =allDetails[details].products.category
                quantity.innerHTML =allDetails[details].details.quantity
                detailsCount++
            }
        }
    }
}