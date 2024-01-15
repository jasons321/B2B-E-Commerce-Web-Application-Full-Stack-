window.onload = function () {
    loadUserInformation();
    };
    

function loadUserInformation(){
    var currentLocation = window.location.pathname;
    userID = currentLocation.replace("/usersdash/admin/", "");
    createXhrRequest("GET", 'http://localhost:5001/users/'+userID, function (err, response) {
        if (err) { console.log("Error!"); }
        allUserInformation = JSON.parse(response);
    });
    
    //Load necessary information into either a form as a placeholder or a static text 
    document.getElementById("profilepic").innerHTML= '<img class="image" src='+allUserInformation.specificUser[0].profilepic+'>' + allUserInformation.specificUser[0].name
    document.getElementById("idinfo").innerHTML='<p class="idinfotext"> <b>User ID: </b>'+ allUserInformation.specificUser[0].userID+'</p>'+ '<p  class="idinfotext"> <b> Email:</b> '+ allUserInformation.specificUser[0].email+'</p>'
    document.getElementById("statusul").innerHTML+= '<li><p>'+allUserInformation.specificUser[0].status+'</p></li>'
    document.getElementById("nameul").innerHTML+= '<li><input type="text" class="allform" id="form1" value="'+allUserInformation.specificUser[0].name+'" </li>'
    document.getElementById("addressul").innerHTML+= '<li><input type="text" class="allform" id="form2" value="'+allUserInformation.specificUser[0].address+'" </li>'
    document.getElementById("phonenumul").innerHTML+= '<li><input type="text" class="allform" id="form3" value="'+allUserInformation.specificUser[0].phonenum+'" </li>'
    document.getElementById("storenameul").innerHTML+= '<li><input type="text" class="allform" id="form4" value="'+allUserInformation.specificUser[0].storename+'" </li>'
    document.getElementById("createdul").innerHTML+= '<li><input type="text" class="allform" id="form5" value="'+allUserInformation.specificUser[0].created.split('T')[0].toString()+'" </li>'

    var count =1;

    var table = document.getElementById('activitiestable')
    
    //Create a table that displays all the users past transaction and current order records 
    for (transaction in allUserInformation.allTransactions)  {
        var row = table.insertRow(count);
        var transactionID = row.insertCell(0);
        var status = row.insertCell(1);
        var dateOrdered = row.insertCell(2);
        var totalValue = row.insertCell(3);
        var button = row.insertCell(4);
        transactionID.innerHTML = allUserInformation.allTransactions[transaction].idTransaction.toString();
        status.innerHTML = allUserInformation.allTransactions[transaction].orderStatus.toString();
        dateOrdered.innerHTML = allUserInformation.allTransactions[transaction].dateOrdered.split('T')[0].toString();
        userID.innerHTML = allUserInformation.allTransactions[transaction].userID.toString();
        totalValue.innerHTML = parseInt(allUserInformation.allTransactions[transaction].totalValue.toString());
        button.innerHTML += '<div onclick ="viewmore(this);" class="viewbutton">View More</div>'
        count++

    }

}

function updateUser(){
    //Function to update user information 
    var newUserInformation = {};
    newUserInformation.phonenum = document.getElementById("form3").value;
    newUserInformation.name = document.getElementById("form1").value;
    newUserInformation.address = document.getElementById("form2").value;
    newUserInformation.storename = document.getElementById("form4").value;
    newUserInformation.created = parseInt(document.getElementById("form5").value);
    
    var currentLocation = window.location.pathname;
    userID = currentLocation.replace("/usersdash/admin/", "");
    var JSONformatdata = JSON.stringify(newUserInformation);

    
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", "http://localhost:5001/updateUsers/"+userID, true);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.onload = function () {
        var users = JSON.parse(xhr.responseText);
        if (xhr.readyState == 4 && xhr.status == "200") {
        } else {
            console.error(users);
        }
    }
    xhr.send(JSONformatdata);
    var modal = document.querySelector('.success');
    modal.classList.add('success-active');
    setTimeout(function() {
        window.location.reload()
    }, 2000);

}


function deleteUser(){
    var currentLocation = window.location.pathname;
    userID = currentLocation.replace("/usersdash/admin/", "");
    createXhrRequest("DELETE", 'http://localhost:5001/deleteUsers/'+userID, function (err, response) {
        if (err) { console.log("Error!"); }
    });

    var modal = document.querySelector('.delete');
            modal.classList.add('success-active');
            setTimeout(function() {
                window.location.replace('http://localhost:5001/usersdash/admin')
            }, 2000);
}