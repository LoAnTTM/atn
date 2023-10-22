var {Client} = require('pg');
var conn_string = require('./db_config');

async function table_director(shop_type) {
    // Connect to DB
    const client = new Client(conn_string);
    await client.connect(); 
    // Query to DB and get the products table 
const queryToys = `select "productsToy".*, "departments".name from "productsToy" left join "departments" on "departments".id ="productsToy".shop_id`;
    const queryBooks = `select "productsBook".*, "departments".name from "productsBook" left join "departments" on "departments".id ="productsBook".shop_id`;
    const queryClothes = `select "productsClothes".*, "departments".name from "productsClothes" left join "departments" on "departments".id ="productsClothes".shop_id`;
    const allShop = queryToys + ' union all ' + queryBooks + ' union all ' + queryClothes;
    console.log(shop_type);
    switch (shop_type) {
        case "2":
            query_string = queryToys;
            break;
        case "3":
            query_string = queryBooks;
            break;
        case "4":
            query_string = queryClothes;
            break;
        default:
            query_string = allShop;
            break;
    }
    console.log(query_string);
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
        if (field.name != "shop_id") {
            html_string += `<th> ${field.name} </th>`;
            fields_list.push(field.name)
        }
    })
    html_string += '</tr>';

    let id = 0;
    //Genrate all table rows
    for (let i = 0; i < db_table.rowCount; i++) {
        row = db_table.rows[i];
        html_string += '<tr>';
        fields_list.forEach((field) => {
            let cell = row[field];
            if (field == "id") {
                cell = ++id;
            }
            if (field != "shop_id") {
                html_string += `<td>${cell}</td>`;
            }
        })
        html_string += '</tr>';
    }
    html_string += `</table>`;
    return html_string
}

module.exports = table_director;