
function logOut() {

    var xhr = new XMLHttpRequest();
    //Calls the api to logout as it has to delete the tokens within the http only cookie 
    xhr.open("GET", 'http://localhost:5001/logout', false);

    xhr.onload = function () {
        window.location.replace('http://localhost:5001/login')

    };
    xhr.onerror = function () {
    };
    xhr.send();

}

function home() {
    window.location.replace('http://localhost:5001/main')
}

//Source: https://newbedev.com/javascript-number-format-javascript-rupiah-code-example
//convert numerical values into the currency 
function convertRup(numb) {
    const format = numb.toString().split('').reverse().join('');
    const convert = format.match(/\d{1,3}/g);
    const rupiah = convert.join('.').split('').reverse().join('')

    return rupiah
}

function goCart() {
    window.location.replace('http://localhost:5001/cart')
}

//Filter the table certain status 
function filterByStatus(){
    var table = document.getElementById('tables')
    var tr = table.getElementsByTagName("tr");
    var tablelength = tr.length-1

    for(var x =1;x<=tablelength;x++){
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

//Sort the table by amount, typically total sales or total revenue 
function sortByAmount(){
    var table = document.getElementById('tables')
    var tr = table.getElementsByTagName("tr");
    var tablelength = tr.length-1
    //standard bubble sorting 
    for(var x =1;x<=tablelength;x++){
        for(var y =1;y<=tablelength-1;y++){
            if(document.getElementById('amount').value=="Descending"){
                if(parseInt(tr[y].getElementsByTagName("td")[2].innerHTML)>parseInt(tr[y+1].getElementsByTagName("td")[2].innerHTML)){
                    tr[y].parentNode.insertBefore(tr[y+1],tr[y])
                }
            }
            else if(document.getElementById('amount').value=="Ascending"){
                if(parseInt(tr[y].getElementsByTagName("td")[2].innerHTML)<parseInt(tr[y+1].getElementsByTagName("td")[2].innerHTML)){
                    tr[y].parentNode.insertBefore(tr[y+1],tr[y])
                }
            }

        }
    }
}

//Sort records by date - recent to latest/latest - recent 
function sortByDate(){
    var table = document.getElementById('tables')
    var tr = table.getElementsByTagName("tr");
    var tablelength = tr.length-1

    for(var x =1;x<=tablelength;x++){
        for(var y =1;y<=tablelength-1;y++){
            if(document.getElementById('date').value=="Recent"){
                if(tr[y].getElementsByTagName("td")[3].innerHTML<tr[y+1].getElementsByTagName("td")[3].innerHTML){
                    tr[y].parentNode.insertBefore(tr[y+1],tr[y])
                }
            }
            else if(document.getElementById('date').value=="Latest"){
                if(tr[y].getElementsByTagName("td")[3].innerHTML>tr[y+1].getElementsByTagName("td")[3].innerHTML){
                    tr[y].parentNode.insertBefore(tr[y+1],tr[y])
                }
            }

        }
    }
}

//Source: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
//Calls the backend server api to retrieve and send data 
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
