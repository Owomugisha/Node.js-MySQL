var mysql = require("mysql")
require("dotenv").config()
var inquirer = require("inquirer");
const columnify = require('columnify');
//var cTable = require('console.table')

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
})


let choices = []
let currentProducts = []
// connection.query('SELECT * FROM products', function(err, results){
//     console.log('RUNNING BEFORE DATA')
//     if(err){
//         console.log('LOG ERROR IF ANY: ',err);
//     }else {
//         console.log('TEST RESULTS FROM DATABASE:', results);
//     };
// });
let itemInfo = ()=>{
    // get data from the db
    connection.query('select item_id, product_name, price FROM products',function(err,res){
        // check if there is any errors:
        if(err) throw err;
        //Otherwise, log the data from the database:
        console.log(`\n ~~~ PRODUCT TABLE ~~~\n `)
        console.log(columnify(res, {columnSplitter: ' | '}) );
        // Then, call the function to show questions:
        userBuy();
    })
}
let userBuy = () =>{
    inquirer.prompt([
        {
            name: "item_id",
            type: "input",
            message: "which item_ID of the product would you like to buy?",
            //choices: currentProducts
        },
        {
            name: "quantity",
            type:"input",
            message:"How many units of the product they would like to buy",
            validate: function(value){
                if(Number.isInteger(parseInt(value))&& value>0){
                    return true
                } else{
                    return `${value} is not a vaid qusntity`
                }
            }
        }
    ]).then(function(answers){
        // Get prdoucts from the databse based on the id selected
        connection.query("SELECT * FROM products WHERE?",{item_id:answers.item_id},function(err, res){
            // Check if getting products had any errors
            if(err) throw err;
            // Else, check if the user's quantity is less that the db quantity
            if(answers.quantity <=res[0].stock_quantity){
               
                // Now, update the data and reflect the new purchase:
                connection.query('UPDATE products SET ?, ? WHERE ?',
                [
                    {
                        stock_quantity:(res[0].stock_quantity - answers.quantity)
                    },
                    {
                        product_sales:res[0].product_sales+(answers.quantity*res[0].price)
                    },
                    {
                        item_id:answers.item_id
                    }
                ], 
                function(err){
                    if(err) throw err;
// If there is enough product, log the details in for the user:
console.log(`\n ${res[0].product_name} has been added to the cart:\n Quantity:  ${answers.quantity}\n Per Product: $${res[0].price}\n  Total:  $${parseInt(res[0].price) * parseInt(answers.quantity)}`);
                    connection.end();
                })
            }else{
                console.log('\n Insufficient quantity!')
                itemInfo()
            }
        })
    })
}
//running 
connection.connect(function(err){
    if(err) {
        console.log('CONNECTION ERROR...', err)
    } else {
        console.log('CONNECTED SUCCESSFULLY', connection.threadId)
        itemInfo();
    };
})