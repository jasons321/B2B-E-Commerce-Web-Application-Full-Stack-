window.onload = function () {
    loadCatalogue();
};

//Retrieves all the catalogue in the database 
function loadCatalogue() {
    createXhrRequest("GET", 'http://localhost:5001/catalogue/all', function (err, response) {
        if (err) { console.log("Error!"); }
        allCatalogue = JSON.parse(response);

        for (var item in allCatalogue.product) {
            document.getElementById('container').innerHTML += '<div class="card"> <img class="productimage" src = "' + allCatalogue.product[item].randomImage + '"> <div class="productname"><b>' + allCatalogue.product[item].name + '</b></div> <div class="categoryname">' + allCatalogue.product[item].category + '</div> <div class="viewbutton" onclick = "viewMore(' + allCatalogue.product[item].productID + ');"> View</div> </div>'
        }
    });
}

function viewMore(productID) {
    window.location.replace('http://localhost:5001/productinfo/' + productID)
}

//Filters the product list by the inputted keyword
//Source: https://www.youtube.com/watch?v=RVrHC__Tkx0&t=934s&ab_channel=ABNationProgrammers
function filterByNameOrCategory() {
    var value = document.getElementById('searchbar').value
    var cardContainer = document.getElementById('container')
    //Cycles through all the products in the list
    for (var y = 0; y < cardContainer.getElementsByClassName('card').length; y++) {
        if (document.getElementsByClassName('card')[y].querySelector(".categoryname").innerText.toLowerCase().includes(value) || document.getElementsByClassName('card')[y].querySelector(".productname").innerText.toLowerCase().includes(value)) {
            //if it matches, do nothing
            cardContainer.getElementsByClassName('card')[y].style.display = ""
        }
        else {
            //if it doesnt match, hide the product listing
            cardContainer.getElementsByClassName('card')[y].style.display = "none"

        }
    }

}