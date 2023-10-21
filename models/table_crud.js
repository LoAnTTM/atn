var {Client}  = require('pg'); 
var conn_string = require('./db_config');

async function table_crud(table_name, role, department_id) {
    // Connect to DB
    const client = new Client(conn_string);
    await client.connect(); 
    let query_string = ``;
    // Query to DB and get the table 
    if (role == 'admin') 
    {
        query_string = `SELECT * FROM ${table_name}`;
    } else if ( role == 'staff')
    {
        query_string = {
            text: `SELECT * FROM  "${table_name}" WHERE shop_id=$1`,
            values: [department_id],
        }   
    }
    const query_result = await client.query(query_string);
    // Generate all cells of table for this data
    // console.log(query_result);
    let table_string = table_display(query_result);
    client.end();
    return table_string;
}

function table_display(db_table){
    let html_string = `<table border> <tr>`;
    const fields_list = [];
    //Genrate the table header
    db_table.fields.forEach((field) => {
        html_string += `<th> ${field.name} </th>`;
        fields_list.push(field.name)
    })
    html_string += `<th>Action</th> </tr>`;

    //Genrate all table rows
    for (let i = 0; i < db_table.rowCount; i++) {
        row = db_table.rows[i];
        html_string += `<tr> <form method = post action ="/users/crud">`;
        fields_list.forEach((field) => {
            let cell = row[field];
            html_string += `<td><input type="text" name=${field} value=${cell}></td>`;
        })
        //Add 2 buttons to table
        html_string += `<td><input type="submit" name="btn" value="Update">`;
        html_string +=     `<input type="submit" name="btn" value="Delete"></td>`;
        html_string += `</form> </tr>`;
    }
    //Add Insert row
    html_string += `<tr> <form method = post action = "/users/crud">`;
    fields_list.forEach((field) => {
        html_string += `<td><input type="text" name=${field} value=""></td>`;
    })
    html_string += `<td><input type="submit" name="btn" value="Create"></td>`;
    html_string += `</form> </tr>`;
    
    html_string += `</table>`;
    return html_string
}

module.exports = table_crud;