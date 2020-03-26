import * as moment from 'moment'
import { render } from 'ejs'
import store from '../store'
import { printContentent } from '../lib/print'

const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= title %></title>
  </head>
  <body>
    <table style="width: 100%;">
      <tbody>
        <tr>
          <td style="vertical-align: top;">
            <h2><%= title %></h2>
            <h3><%= company.name %></h3>
            <div><%= company.address %></div>
            <div><%= company.phone %></div>
            <div><%= company.legal_id %></div>
          </td>
          <td style="text-align: right; vertical-align: top;">
            <img src="<%= logo %>" style=" height: 100px; width: auto;" />
            <div style="margin-top: 1em;">
              <%= moment().format('DD/MM/YYYY, h:mm a') %>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <br />

    <table class="bordered-table" style="border-collapse: collapse">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Teléfono</th>
          <th>Dirección</th>
          <th>Crédito Total</th>
          <th>Abono Total</th>
          <th>Saldo Actual</th>
        </tr>
      </thead>
      <tbody>
        <% customers.forEach(customer => { %>
        <tr>
          <td>
            <%= customer.name %>
          </td>
          <td>
            <%= customer.email %>
          </td>
          <td>
            <%= customer.phone %>
          </td>
          <td>
            <%= customer.address %>
          </td>
          <td>
            C$<%= customer.total_credit %>
          </td>
          <td>
            C$<%= customer.total_payment %>
          </td>
          <td>
            C$<%= customer.total_credit - customer.total_payment %>
          </td>
        </tr>
        <% }) %>
      </tbody>
    </table>
  </body>
</html>`
const logo = localStorage.getItem('company_logo')

function customerReport(customers) {
  const company = store.getters.company
  const title = 'Reporte de Clientes'
  
  const renderedTemplate = render(htmlTemplate, {
    customers,
    logo,
    company,
    moment,
    title
  })
  
  printContentent(renderedTemplate, title)
}

export { customerReport }
