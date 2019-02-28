var mysql = require("mysql");
require("dotenv").config();
var inquirer = require("inquirer");
const columnify = require('columnify');

var connection = mysql.createConnection({
    host:"localhost",
    port:3306,
    user:"root",
    password:"root",
    database:"bamazon"
})
let currentProduct = [];
// connection.query('SELECT product_name FROM products',function(err,res){
//     if(err) throw err;
//     currentProduct=res;
//     connection.end();
// });

let bManager =() =>{
    inquirer.prompt({
        name: "action",
        type: "rawlist",
        message:"what would you like to view?",
        choices:[
            "view Products for Sale",
            "view Low Inventory",
            "Add to Inventory",
            "Add New Product"
        ]
    }).then(function(answer){
        console.log('----Selected action',answer.action);
        switch(answer.action){
            
            case "view Products for Sale":
            viewSales()
            break

            case "view Low Inventory":
            viewLow()
            break

            case "Add to Inventory":
            addToInv()
            break

            case "Add New Product":
            addNewPro()
            break
        }
    });
}
let viewSales=() =>{
    connection.query(`SELECT item_id, product_name,price,stock_quantity FROM products`, function(err, res){
        if(err) throw err;
        console.log(`\n ---PRODUCT TABLE ---\n`)
        console.log(columnify(res, {columnSplitter: ' | '}) );
        bManager()
    })
}
let viewLow=()=>{
   // console.log('calling viewLow')
    connection.query(`SELECT item_id,product_name,stock_quantity FROM products WHERE stock_quantity<5`, function(err, res){
        if(err) throw err
        console.log(`\n ---LOW STOCK TABLE ---\n`)
        if(res.length===0){
            console.log("No Low Stock less 5")
            bManager()

        }else{
            console.log(columnify(res, {columnSplitter: ' | '}) );
            bManager()
        }
        
    })
}
let addToInv =() =>{
    //console.log('new inv added------------------------------------------------')
    connection.query(`SELECT product_name FROM products`,function(err, res){
        if(err) throw err
        for(var i = 0;i<res.length;i++){
            currentProduct.push(res[i].product_name)
        }
        //console.log('CURRENT PRODUCT', currentProduct)
        updateInv(currentProduct)
    })
}
let updateInv =(currentProduct)=>{
    //console.log('Choices', currentProduct)
   // console.log('new product')
    inquirer.prompt([{
        name:"item",
        type:"rawlist",
        message: "Which item would you like to add to the inventory?",
        choices:currentProduct
    },
    {
        name:"quantity",
        type:"input",
        message:"how many would you like to add?",
        validate: function(value){
            if(Number.isInteger(parseInt(value))&& value>0){
                return true
            }else{
                return `${value} is not a vaid quantity`
            }
        }
    }
    ]).then(function(answers){
       // console.log('SELECTED...',answers)
        connection.query("SELECT product_name, stock_quantity FROM products WHERE ?",{product_name:answers.item},function(err,res){
            if(err) {
                console.log('Error getting data from db', err)
            } else {
                //console.log('any results',res);
                let product = res[0];
                let quant = parseInt(product.stock_quantity) + parseInt(answers.quantity);
                
                connection.query('UPDATE products SET ? WHERE ?',[{stock_quantity:(quant)},{product_name:product.product_name}],function(err, res){
                    if(err) throw err;
                    console.log(`${product.product_name} stock is now updated to ${quant}`);
                    bManager();
                })
            }
        })
    })
}
let addNewPro =()=>{
    inquirer.prompt([
        {
            name:"name",
            type:"input",
            message: "Name:",
            validate: function(value){
                if(value){
                    return true
                }else{
                    return `${value} is not a vaid name`
                }
            }
        },
        {
            name:"department",
            type:"rawlist",
            message:"Department:",
            choices:[
                "grocery",
                "electronics",
                "men's wear",
                "women's wear",
                "education"
            ]
        },
        {
            name:"price",
            type:"input",
            message:"Price:",
            validate:function(value){
                if(Number.isNaN(parseInt(value))=== false&&value>0){
                    return true
                }else{
                    return `${value} is not a vaid price`
                }
            }
        },
        {
            name:"stock",
            type:"input",
            message:"stock Quantity: ",
            validate: function(value){
                if(Number.isNaN(parseInt(value)) === false&&value>0){
                    return true
                }else{
                    return `${value} is not a vaid stock number`
                }
            }
        }
    ]).then(function(answers){
        console.log(`\n NEW PRODUCT: \n Name: ${answers.name}\n Dept:${answers.department}\n Price:${answers.price}\n Stock:${answers.stock}\n`)
        connection.query(`INSERT INTO products(product_name,department_name,price,stock_quantity) VALUES ('${answers.name}','${answers.department}','${answers.price}','${answers.stock}')`,function(err,res){
            if(err) throw err
            bManager()
        })
    })
}
connection.connect(function(err){
    if(err) {
        console.log('CONNECTION ERROR...', err)
    } else {
        console.log('CONNECTED SUCCESSFULLY', connection.threadId)
        bManager();
    };
})