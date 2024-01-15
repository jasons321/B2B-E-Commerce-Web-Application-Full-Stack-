
var ne; 
var upcoming; 
var popular; 


window.onload = function() {
    retrievePromotion();
  };

  //Calls the query to retrieve the promotion of products (popular and newly released)
function retrievePromotion(){
    createXhrRequest( "GET", 'http://localhost:5001/promotion', function( err, response ) {
        if( err ) { console.log( "Error!" ); }
        var promotion = JSON.parse(response);
        document.getElementById('new').innerHTML='<img class="image" src="'+promotion[0].image.imageaddress+'"> <br> <div  class="promotiontext">NEW</div> <div  onclick="viewproduct('+promotion[0].product.productID+')" class="viewmorebutton">View More </div> '
        document.getElementById('popular').innerHTML='<img class="image" src="'+promotion[1].image.imageaddress+'"> <br> <div class="promotiontext">POPULAR</div> <div onclick="viewproduct('+promotion[1].product.productID+')" class="viewmorebutton">View More </div>'

    });

    //Get the profile picture of the user to be displayed in the front page 
    createXhrRequest( "GET", 'http://localhost:5001/getuserprofilepic', function( err, response ) {
        if( err ) { console.log( "Error!" ); }
        var userInformation = JSON.parse(response);
        document.getElementById('header-left').innerHTML +='<img onclick="changePage()" class="profilepic" src="'+userInformation.imageAddress+ '"  class="image"/> '
    });

}

function changePage(){
    window.location.replace('http://localhost:5001/edituserinfo')
}

function catalogue(){
    window.location.replace('http://localhost:5001/catalogue')
}

function delivery(){
    window.location.replace('http://localhost:5001/delivery')
}

function orderHistory(){
    window.location.replace('http://localhost:5001/orderhist')
}

function productpage(){
    window.location.replace('http://localhost:5001/product')
}

function viewproduct(id){
    window.location.replace('http://localhost:5001/productinfo/'+id)
}