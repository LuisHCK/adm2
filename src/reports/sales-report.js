import * as moment from 'moment'
import { render } from 'ejs'
import store from '../store'

const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>
      <%= title %>
    </title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; };

      table {
        width: 100%
      }
      
      table.bordered-table {
        border-collapse: collapse !important;
        width: 100%
      }

      table.bordered-table td, table.bordered-table th {
        padding: 6px;
        border: 1px solid black;
      }
    
      mt-1 {
        margin-top: 1em;
      }
    </style>
  </head>
  <body>
    <table style="width: 100%;">
      <tbody>
        <tr>
          <td style="vertical-align: top;">
            <h2>Reporte de ventas</h2>
            <h3><%= store.name %></h3>
            <div><%= store.address %></div>
            <div><%= store.phone %></div>
            <div><%= store.legal_id %></div>
          </td>
          <td style="text-align: right; vertical-align: top;">
            <img src="<%= store.logo %>" style=" height: 100px; width: auto;" />
          </td>
        </tr>
      </tbody>
    </table>

    <br />

    <table class="sales-table bordered-table">
      <thead>
        <tr style="font-size: 11pt; text-align: left;">
          <th>ID</th>
          <th>Cliente</th>
          <th>Productos</th>
          <th>Sub Total</th>
          <th>Pago</th>
          <th>TOTAL</th>
          <th>Fecha de venta</th>
        </tr>
      </thead>
      <tbody>
        <% sales.forEach(function(sale){ %>
        <tr>
          <td>
            <%=sale.id %>
          </td>
          <td>
            <%=sale.customer.name %>
          </td>
          <td>
            <%=sale.shoppingCart.length %>
          </td>
          <td>
            <%= currency %><%=sale.subTotal %>
          </td>
          <td>
            <%=sale.sale_type == 'cash' ? 'Efectivo' : 'Crédito' %>
          </td>
          <td>
            <%= currency %><%=sale.total %>
          </td>
          <td>
            <%=moment(sale.created_at).format('DD/MM/YYYY, h:mm a') %>
          </td>
        </tr>
        <% }); %>
      </tbody>
    </table>
  </body>
</html>`
const logo = localStorage.getItem('company_logo')
/**
 * Generate a html-string template for sales
 * @param {Array} sales Array of sales
 * @param {String} title Report title
 */
function salesReport(sales, title, dateRange) {
    const storeData = store.getters.store
    const currency = store.getters.currency
    return render(htmlTemplate, {
        sales,
        dateRange,
        title,
        logo,
        store: storeData,
        moment,
        currency
    })
}

export { salesReport }
