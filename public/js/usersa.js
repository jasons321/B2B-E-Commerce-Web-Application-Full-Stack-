window.onload = function () {
    loadAllUsers();
};


function loadAllUsers() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:5001/users');
    xhr.send();
    xhr.onload = function () {

        allUsersInformation = JSON.parse(xhr.response);
        var table = document.getElementById('maintable')
        var count = 1;
        for (user in allUsersInformation) {
            var row = table.insertRow(count);
            var userID = row.insertCell(0);
            var status = row.insertCell(1);
            var name = row.insertCell(2);
            var sales = row.insertCell(3);
            var email = row.insertCell(4);
            var button = row.insertCell(5);
            userID.innerHTML = allUsersInformation[user].userID.toString();
            status.innerHTML = allUsersInformation[user].status;
            sales.innerHTML = allUsersInformation[user].sales;
            name.innerHTML = allUsersInformation[user].name;
            email.innerHTML = allUsersInformation[user].email;
            button.innerHTML += '<div onclick ="view(this);" class="viewbutton">View More</div>'
            count++
        }
    }
}

function view(row) {
    var table = document.getElementById('maintable')
    var rowNumber = row.parentElement.parentElement.rowIndex
    var userID = table.rows[rowNumber].cells[0].innerHTML;
    window.location.replace('http://localhost:5001/usersdash/admin/' + userID.toString())
}


function openCreate() {
    var modal = document.querySelector('.create-form');
    modal.classList.add('create-form-active');
    let sidebar = document.querySelector(".sidebar")
    sidebar.classList.remove("active");
}

//Confirm to add a new user to the database 
function confirm() {
    var newName = document.getElementById("inputname").value;
    var newEmail = document.getElementById("inputemail").value;
    var newPhone = document.getElementById("inputphone").value;
    var newAddress = document.getElementById("inputaddress").value;
    var newStoreName = document.getElementById("inputstorename").value;
    var newstatus = document.getElementById("inputstatus").value;
    //https://ricardometring.com/getting-the-value-of-a-select-in-javascript
    if (newName == "" || newEmail == "" || newPhone == "" | newAddress == "" | newStoreName == "") {
        alert("Can't be empty");
    } else {

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:5001/createUsers/", true);
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhr.onload = function () {
            var users = JSON.parse(xhr.responseText);
            if (xhr.readyState == 4 && xhr.status == "200") {

            } else {
                console.error(users);
            }
        }
        var newUser = {};
        newUser.email = newEmail;
        newUser.storename = newStoreName;
        newUser.phonenum = newPhone;
        newUser.status = newstatus;
        newUser.address = newAddress;
        newUser.name = newName;

        var JSONformatdata = JSON.stringify(newUser);
        xhr.send(JSONformatdata);
        var modal = document.querySelector('.success');
        modal.classList.add('success-active');
        setTimeout(function () {
            window.location.replace('http://localhost:5001/usersdash/admin')
        }, 2000);
    }

}

//Filters the list by name or email inputted 
function filterListByNameOrEmail(){
    //Front end search bar source: //searchbar: https://codepen.io/huange/pen/rbqsD
    var table = document.getElementById('maintable')
    var tr = table.getElementsByTagName("tr");
    var tableLength = tr.length-1

    for(var x =1;x<=tableLength;x++){
        if(tr[x].getElementsByTagName("td")[2].innerHTML.toLowerCase().includes(document.getElementById('searchbar').value.toLowerCase()) || tr[x].getElementsByTagName("td")[4].innerHTML.toLowerCase().includes(document.getElementById('searchbar').value.toLowerCase())){
            table.getElementsByTagName("tr")[x].style.display =""
        }
        else{
            table.getElementsByTagName("tr")[x].style.display ="none"

        }
    }

}

//Filters the user list by their status 
function filterListByStatus(){
    var table = document.getElementById('maintable')
    var tr = table.getElementsByTagName("tr");
    var tableLength = tr.length-1

    for(var x =1;x<=tableLength;x++){
        if(document.getElementById('status').value==""){
            table.getElementsByTagName("tr")[x].style.display =""
        }else{
            if(tr[x].getElementsByTagName("td")[1].innerHTML.toString()==document.getElementById('status').value.toString()){
                table.getElementsByTagName("tr")[x].style.display =""
            }
            else{
                table.getElementsByTagName("tr")[x].style.display ="none"
    
            }
        }

    }
}

//Filter the user list by sales - admin and logistics is assumed to be 0 
function sortBySales(){
    var table = document.getElementById('maintable')
    var tr = table.getElementsByTagName("tr");
    var tableLength = tr.length-1

    for(var x =1;x<=tableLength;x++){
        for(var y =1;y<=tableLength-1;y++){
            if(document.getElementById('amount').value=="Descending"){
                if(parseInt(tr[y].getElementsByTagName("td")[3].innerHTML)>parseInt(tr[y+1].getElementsByTagName("td")[3].innerHTML)){
                    tr[y].parentNode.insertBefore(tr[y+1],tr[y])
                }
            }
            else if(document.getElementById('amount').value=="Ascending"){
                if(parseInt(tr[y].getElementsByTagName("td")[3].innerHTML)<parseInt(tr[y+1].getElementsByTagName("td")[3].innerHTML)){
                    tr[y].parentNode.insertBefore(tr[y+1],tr[y])
                }
            }

        }
    }
}

