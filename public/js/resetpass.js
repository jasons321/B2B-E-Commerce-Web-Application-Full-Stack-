
var currentLocation = window.location.pathname;
//Takes the current url and findout the userid
userID = currentLocation.replace("/reset/", "");

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

//Make sure that both passwords match 
function confirm(){
    var password1 = document.getElementById("password1").value;
    var password2 = document.getElementById("password2").value;
    if (password1==password2){
        var xhr = new XMLHttpRequest();
            xhr.open("PUT", "http://localhost:5001/updatePassword/"+userID, true);
            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            xhr.onload = function () {
                var users = JSON.parse(xhr.responseText);
                if (xhr.readyState == 4 && xhr.status == "200") {

                } else {
                    console.error(users);
                }
            }
            //Send the updated password to the backend to be updated 
            var updatedPassword = {};
            updatedPassword.password = password1;
            var JSONformatdata = JSON.stringify(updatedPassword);
            xhr.send(JSONformatdata);
            var modal = document.querySelector('.success');
            modal.classList.add('success-active');
            setTimeout(function() {
                window.location.replace('http://localhost:5001/login')
            }, 2000);
    }
    else{
        var modal = document.querySelector('.modal-container');
        modal.classList.add('container-active');
    }
}

//close a confirmation popup 
function closeSent(){
    var modal = document.querySelector('.password-sent');
    modal.classList.remove('password-sent-active');
}

//Allow user to close a popup
function back() {
    var modal = document.querySelector('.modal-container');
    modal.classList.remove('container-active');
}