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
    <styles>
    </styles>
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
            <img src="<%= logo %>" style=" height: 100px; width: auto;" />
          </td>
        </tr>
      </tbody>
    </table>

    <br />

    <table class="sales-table">
      <thead>
        <tr style="font-size: 11pt; text-align: left;">
          <th>ID</th>
          <th>Cliente</th>
          <th>Productos</th>
          <th>Sub Total</th>
          <th>Descuento</th>
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
            C$<%=sale.subTotal %>
          </td>
          <td>
            C$<%=sale.discounted %>
          </td>
          <td>
            <%=sale.sale_type == 'cash' ? 'Efectivo' : 'Crédito' %>
          </td>
          <td>
            <%=sale.total %>
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
  const store = store.getters.store
  return render(htmlTemplate, { sales, dateRange, title, logo, store, moment })
}

export { salesReport }
