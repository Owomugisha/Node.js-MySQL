var mysql = require("mysql");
require("dotenv").config();
var inquirer = require("inquirer");
const columnify = require('columnify');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
})

let bSupervisor =()=>{
    inquirer.prompt({
        name:"action",
        type:"rawlist",
        message:"what would you like to do?",
        choices:[
            "view product sales by department",
            "create new department"
        ]
    }).then(function(answer){
        switch(answer.action){
            case "view product sales by department":
            viewDeptSales()
            break

            case "create new department":
            createNewDept()
            break
        }
    });
}
let viewDeptSales=()=>{
    connection.query(`SELECT department_id,departments.department_name,over_head_cost,SUM(product_sales)AS product_sales,(over_head_cost - product_sales) AS total FROM departments LEFT JOIN products ON departments.department_name = products.department_name GROUP BY departments.department_name;`,function(err, res){
        if(err) throw err
        console.log(`\n -----Sales by Department ---\n`)
        console.log(columnify(res, {columnSplitter: ' | '}) );
        bSupervisor()
    })
}
let createNewDept=()=>
inquirer.prompt([
    {
        name:"name",
        type:"input",
        message:"department name:",
        validate: function(value){
            if(value){
                return true
            }else{
                return`${value} is not a vaid name`
            }
        }
    },
    {
        name:"cost",
        type:"input",
        message:"over head cost:",
        validate: function(value){
            if(Number.isNaN(parseInt(value))===false&& value>0){
                return true
            }else{
                return `${value} is not a vaid number`
            }
        }
    }
]).then(function(answers){
    console.log(`\nNew Department:\n Name"${answers.name}\n over head cost:${answers.cost}\n`)
    connection.query(`INSERT INTO departments(department_name,over_head_cost) VALUES ('${answers.name}','${answers.cost}')`,function(err,res){
        if(err) throw err
        bSupervisor()
    })
})
connection.connect(function(err){
    if(err) throw err
    bSupervisor()
})