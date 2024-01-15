function openSidebar(){
    let sidebar = document.querySelector(".sidebar")
    sidebar.classList.toggle("active")
}

//logout 

function logOut() {

    var xhr = new XMLHttpRequest();
    xhr.open("GET", 'http://localhost:5001/logout', false);

    xhr.onload = function () {
        window.location.replace('http://localhost:5001/login')

    };
    xhr.onerror = function () {
    };
    xhr.send();

}

//Each of the functions below is used to open and redirect to a specific page 
function users(){
    window.location.replace('http://localhost:5001/usersdash/admin')
}

function orders(){
    window.location.replace('http://localhost:5001/orders/admin') 
}

function catalogue(){
        window.location.replace('http://localhost:5001/catalogue/admin') 
}

function transactions(){
    window.location.replace('http://localhost:5001/transactions/admin') 
}

function mainMenu(){
    window.location.replace('http://localhost:5001/maina') 
}


function remove(){
    var modal = document.querySelector('.create-form');
            modal.classList.remove('create-form-active');
}

//Source: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
//Used to call queries and api from the backend 
var createXhrRequest = function (httpMethod, url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open(httpMethod, url, false);
    xhr.onload = function () {
        callback(null, xhr.response);
    };
    xhr.onerror = function () {
        callback(xhr.response);
    };
    xhr.send();
}
