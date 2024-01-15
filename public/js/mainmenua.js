window.onload = function () {
    loadStatistics()
};


var allStatistics
var revenueChart
var salesChart

function loadStatistics() {
    createXhrRequest("GET", 'http://localhost:5001/getalldashboard', function (err, response) {
        if (err) { console.log("Error!"); }
        var data = JSON.parse(response);
        allStatistics = data
        //Load all the required statistics upon the page opening by calling the above api 
        document.getElementById('customers-list').innerHTML += '<li class="statnumbers">' + allStatistics.customers.toString() + '</li>'
        document.getElementById('products-list').innerHTML += '<li class="statnumbers">' + allStatistics.products.toString() + '</li>'
        document.getElementById('transactions-list').innerHTML += '<li class="statnumbers">' + allStatistics.transactions.toString() + '</li>'

        var userTable = document.getElementById('maintable-customers')
        var count = 1;

        var productNames = []
        var productSales = []

        for (var x = 0; x < 5; x++) {
            //Create an arra for the most popular products by total sales 
            productNames.push(allStatistics.orderedProducts[x].name)
            productSales.push(allStatistics.orderedProducts[x].totalsales)
            var row = userTable.insertRow(count);
            var userID = row.insertCell(0);
            var userName = row.insertCell(1);
            var userTotalSales = row.insertCell(2);
            userID.innerHTML = allStatistics.orderedCustomers[x].userID.toString();
            userName.innerHTML = allStatistics.orderedCustomers[x].name.toString();
            userTotalSales.innerHTML = allStatistics.orderedCustomers[x].totalsales.toString();
            count++
        }

        //Settigns to create the bar chart using the sales and products information above 
        var barchart = document.getElementById('chartproducts').getContext('2d');
        var myChart = new Chart(barchart, {
            type: 'bar',
            data: {
                labels: productNames,
                datasets: [{
                    label: 'Total Sales',
                    data: productSales,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                title: {
                    display: true,
                    text: 'Most Popular Products'
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                responsive: true,
                maintainAspectRatio: false

            }
        });
        //Get the HTML element of a specific chart 
        var revenue = document.getElementById('chartrevenue').getContext('2d');
        revenueChart = new Chart(revenue, {
            //Specify the type of chart 
            type: 'line',
            //Pass the arrays into the data object 
            data: {
                //Date array (x-axis)
                labels: allStatistics.date,
                //Revenue array (y-axis)
                datasets: [{
                    label: "Revenue",
                    backgroundColor: 'rgb(65, 240, 225)',
                    borderColor: 'rgb(255, 99, 132)',
                    //Pass the revenue array into the data section
                    data: allStatistics.revenue,
                }]
            },
            options: {
                title: {
                    display: true,
                    text: 'Revenue chart (30 days)'
                },
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Revenue'
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Date'
                        }
                    }]
                }
            }
        });
        var sales = document.getElementById('chartsales').getContext('2d');
        salesChart = new Chart(sales, {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: allStatistics.date,
                datasets: [{
                    label: "Sales",
                    backgroundColor: 'rgb(240, 198, 85)',
                    borderColor: 'rgb(255, 99, 132)',
                    data: allStatistics.sales,
                }]
            },

            // Configuration options go here
            options: {
                title: {
                    display: true,
                    text: 'Sales chart (30 days)'
                },
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Sales'
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Date'
                        }
                    }]
                }
            }
        });
    });

}

//Clicked is initalized as 1 as the page automatically displays the first option (30 days)
var clicked = 1
//A button calls this function when clicked 
function changeRevenue(x) {
    //Clicked = 0 indicates going back to the first option (30 days) --> use the original file 
    if (clicked == 0) {
        revenueChart.data.labels = allStatistics.date
        revenueChart.options.title.text = "Revenue chart (30 days)"
        revenueChart.data.datasets[0].data = allStatistics.revenue
        //.update() changes the dataset 
        revenueChart.update()
        //Add clicked so that the next button click moves to the second option
        clicked++
    }
    //clicked = 1 indicates that the user chooses the 15 days options and the array is selected between the index 14-29. 
    else if (clicked == 1) {
        //Uses a temporary data so that it doens't alter the original value 
        var temporaryArray = allStatistics.revenue
        var temporaryDateArray = allStatistics.date
        revenueChart.data.labels = temporaryDateArray.slice(14, 29)
        revenueChart.options.title.text = "Revenue chart (15 days)"
        //Get the 15 most recent data (days)
        revenueChart.data.datasets[0].data = temporaryArray.slice(14, 29)
        revenueChart.update()
        //add click so that if the user clicks the zoom button again, the next option is selected for the graph
        clicked++;  
    }
    else if (clicked == 2) {
        var temporaryArray = allStatistics.revenue
        var temporaryDateArray = allStatistics.date
        revenueChart.data.labels = temporaryDateArray.slice(22, 29)
        revenueChart.options.title.text = "Revenue chart (7 days)"
        revenueChart.data.datasets[0].data = temporaryArray.slice(22, 29)
        revenueChart.update()
        clicked = 0;
    }
}


//Similar approach applies to the previous graph except it is changing sales graph rather than revenue 
function changeSales(x) {
    if (clicked == 0) {
        salesChart.data.labels = allStatistics.date
        salesChart.options.title.text = "Sales chart (30 days)"
        salesChart.data.datasets[0].data = allStatistics.sales
        salesChart.update()
        clicked++
    }
    else if (clicked == 1) {
        var temporaryArray = allStatistics.sales
        var temporaryDateArray = allStatistics.date

        salesChart.options.title.text = "Sales chart (15 days)"
        salesChart.data.labels = temporaryDateArray.slice(14, 29)

        salesChart.data.datasets[0].data = temporaryArray.slice(14, 29)
        salesChart.update()
        clicked++;
    }
    else if (clicked == 2) {
        var temporaryArray = allStatistics.sales
        var temporaryDateArray = allStatistics.date
        salesChart.data.labels = temporaryDateArray.slice(22, 29)
        salesChart.options.title.text = "Sales chart (7 days)"
        salesChart.data.datasets[0].data = temporaryArray.slice(22, 29)
        salesChart.update()
        clicked = 0;
    }
}
