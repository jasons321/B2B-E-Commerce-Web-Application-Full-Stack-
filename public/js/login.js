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

function login() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var response = {}
    response.email = email
    response.password = password
    //Collect the email and password into an object 
    var JSONformatdata = JSON.stringify(response);

    var modal = document.querySelector('.modal-container');
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:5001/loginusers');
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

    xhr.onload = function () {
        //Once a response has been loaded, the following is executed 
        if (xhr.readyState == 4 && xhr.status == "200") {
            var userResponse = JSON.parse(xhr.responseText)
            //Find out the user role of the person 
            if (userResponse.status == "ADMIN") {
                window.location.replace('http://localhost:5001/maina')
            }
            else if (userResponse.status == "USER") {
                window.location.replace('http://localhost:5001/main')
            }
            else if (userResponse.status == "LOGISTICS") {
                window.location.replace('http://localhost:5001/mainl')
            }
            //Login not successful 
            else if (userResponse.status == "Not Found") {
                modal.classList.add('container-active');
            }

        } else {
            console.error(users);
        }
    }
    //Send email and password to the backend to be authenticated 
    xhr.send(JSONformatdata);
}


function back() {
    var modal = document.querySelector('.modal-container');
    modal.classList.remove('container-active');
}

function openForgot() {
    var modal = document.querySelector('.forgot-password');
    modal.classList.add('forgot-password-active');
}

//Triggers when the user confirms to reset the password 
function confirm() {

    var email = document.getElementById("reset").value;

    var xhr2 = new XMLHttpRequest();
    xhr2.open("POST", "http://localhost:5001/sendemail");
    xhr2.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr2.onload = function () {
        //Checks that the user/email exists within the database 
        if (xhr2.readyState == 4 && xhr2.status == "200") {
            if (xhr2.responseText=="NOT FOUND"){
                var modal = document.querySelector('.email-not-found');
                modal.classList.add('password-sent-active');
            }
            else{
            var modal = document.querySelector('.password-sent');
            modal.classList.add('password-sent-active');

                //https://stackoverflow.com/questions/17883692/how-to-set-time-delay-in-javascript
                setTimeout(function () {
                    location.reload();
               }, 1000);
            }


        } else {
            console.error(users);
        }
    }
    var confirmEmail = {};
    confirmEmail.email = email;

    var JSONformatdata = JSON.stringify(confirmEmail);
    xhr2.send(JSONformatdata);
}

function closeForgot() {
    var modal = document.querySelector('.forgot-password');
    modal.classList.remove('forgot-password-active');
}

function closeSent() {
    var modal = document.querySelector('.password-sent');
    modal.classList.remove('password-sent-active');
}

function closeNotfound() {
    var modal = document.querySelector('.email-not-found');
    modal.classList.remove('password-sent-active');
}


