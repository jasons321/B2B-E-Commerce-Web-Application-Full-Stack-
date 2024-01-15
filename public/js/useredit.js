window.onload = function () {
    loadUserInformation();
};

var userInformation 

function loadUserInformation() {
    //Load the specific user information 
    createXhrRequest("GET", 'http://localhost:5001/getuserinfo', function (err, response) {
        if (err) { console.log("Error!"); }
        var allUserInformation = JSON.parse(response);
        userInformation =allUserInformation; 

        document.getElementById('image').innerHTML += '<img  class="profilepic" src="' + allUserInformation.image + '" /> <br><input type="file" id="myFile"accept="image/*"   name="profile-files" > <div onclick = "uploadImage()" class="uploadbutton"> Upload</div>'
        document.getElementById('name').innerHTML += '<input type="text" id="inputname"  value="' + allUserInformation.name + '">'
        document.getElementById('storeName').innerHTML += '<input type="text" id="inputstore"  value="' + allUserInformation.storeName + '">'
        document.getElementById('address').innerHTML += '<input type="text" id="inputaddress"  value="' + allUserInformation.address + '">'
        document.getElementById('phonenum').innerHTML += '<input type="text" id="inputphone"  value="' + allUserInformation.phonenum + '">'
        document.getElementById('email').innerHTML += '<input type="text" id="inputemail"  value="' + allUserInformation.email + '"> '
    });
}

function updateUser() {

    var formData = new FormData()
    //collect all the inputted information whether it has been updated or not 
    var name = document.getElementById("inputname").value;
    var storeName = document.getElementById("inputstore").value;
    var address = document.getElementById("inputaddress").value;
    var phonenum = document.getElementById("inputphone").value;
    var email = document.getElementById("inputemail").value;
    //none of the fields can be empty 
    if (name == "" || storeName == "" || address == "" || phonenum == "" || email == "") {
        alert("Cant be empty")
    } else {

        var newUserInformation = {
            name: name,
            storeName: storeName,
            address: address,
            phonenum: phonenum,
            email: email,
        }

        var JSONformatdata = JSON.stringify(newUserInformation);
        var xhr = new XMLHttpRequest();
        xhr.open("PUT", "http://localhost:5001/uploaduserinfo", true);
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
            }

        }
        //send the new data 
        xhr.send(JSONformatdata);
        window.location.reload()
    }
}

//Upload a new profile picture 
function uploadImage(){

        if (document.getElementById('myFile').files[0]==undefined){
            alert("You need to upload an image")
        }
        else{
            var formData = new FormData()
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "http://localhost:5001/uploadimage", true);
            formData.append("uploaded_file", document.getElementById('myFile').files[0]);
            xhr.send(formData);
    
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                }  
            }
            window.location.reload()
        }  
}