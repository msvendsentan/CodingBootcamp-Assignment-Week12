var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazonDB"
});

var itemArr = [];

var options = {
    "See all items": function() {
        connection.query("SELECT * FROM products", function(err, res) {
            if (err) throw err;
            res.forEach(function(element) {
                console.log(element.product_name);
            });
            homeMenu();
        });
    },
    "Get more information on an item": function() {
        connection.query("SELECT * FROM products", function(err, res) {
            if (err) throw err;
            res.forEach(function(element) {
                itemArr.push(element.product_name);
            });
            itemInfo();
        });       
    },
    "Purchase an item": function() {
        connection.query("SELECT * FROM products", function(err, res) {
            if (err) throw err;
            res.forEach(function(element) {
                itemArr.push(element.product_name);
            });
            itemPurchase();
        });
    },
    "Terminate session": function() {
        console.log("Thanks for using bamazon!")
        connection.end();
    }
}

function homeMenu() {
    inquirer
        .prompt([
            {
                type: "list",
                message: "What would you like to do?",
                choices: [
                    "See all items",
                    "Get more information on an item",
                    "Purchase an item",
                    "Terminate session"
                ],
                name: "customeroptions"
            }
        ]).then(function(answers) {
            options[answers.customeroptions]();
        });
}

function itemInfo() {
    inquirer
        .prompt([
            {
                type: "list",
                message: "Which item would you like more information about?",
                choices: itemArr,
                name: "iteminfoselect"
            }
        ]).then(function(answers) {
            connection.query(
                "SELECT * FROM products WHERE ?",
                {
                    product_name: answers.iteminfoselect
                },
                function(err, res) {
                    // Stringify & parse removes annoying "RowDataPacket" text
                    console.log(JSON.parse(JSON.stringify(res)));
                    homeMenu();
                }
            );
        });
}

function itemPurchase() {
    inquirer
        .prompt([
            {
                type: "list",
                message: "Which item would you like to purchase?",
                choices: itemArr,
                name: "itempurchaseselect"
            },
            {
                type: "input",
                message: "How many would you like to purchase?",
                name: "quantity"
            }
        ]).then(function(answers) {
            connection.query(
                "SELECT * FROM products WHERE ?",
                {
                    product_name: answers.itempurchaseselect
                },
                function(err, res) {
                    console.log(res[0].product_name);
                    if (answers.quantity > res[0].stock_quantity) {
                        console.log("We're sorry, we don't have that amount in stock!");
                        homeMenu();
                    } else {
                        console.log("Purchasing " + answers.quantity + " of " + res[0].product_name + " will cost $" + (res[0].price * answers.quantity) + " dollars.");
                        updateStock(res[0].item_id, res[0].stock_quantity, answers.quantity);
                    }
                }
            );
        });
}

function updateStock(id, oldamount, purchaseamount) {
    connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: oldamount - purchaseamount
            },
            {
                item_id: id
            }
        ],
        function(err, res) {
            console.log("Transaction successfully completed!");
            homeMenu();
        }
    );
}












function readProductNames() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        res.forEach(function(element) {
            console.log(element.product_name);
        });
    });
}

function readProduct() {
    connection.query("SELECT * FROM products", function(err, res) {

        if (err) throw err;

        
        console.log(JSON.parse(JSON.stringify(res)));
    });
}

connection.connect(function(err) {
    if (err) throw err;
    homeMenu();
});
