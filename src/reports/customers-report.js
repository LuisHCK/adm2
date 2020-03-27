import * as moment from 'moment'
import { render } from 'ejs'
import store from '../store'
import { printContentent } from '../lib/print'

const customersHtmlTemplate = `
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

function customersReport(customers) {
  const company = store.getters.company
  const title = 'Reporte de Clientes'

  const renderedTemplate = render(customersHtmlTemplate, {
    customers,
    logo,
    company,
    moment,
    title
  })

  printContentent(renderedTemplate, title)
}

// CUSTOMER DETAIL
const customerDetailHtmlTemplate = `
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

    <table style="width: 75%;">
      <tbody>
        <tr>
          <td>
            <div class="mt-1">
              <b>Cliente</b>
            </div>
            <%= data.customer.name %>
          </td>
          <td>
            <div class="mt-1">
              <b>Teléfono</b>
            </div>
            <%= data.customer.phone %>
          </td>
          <td>
            <div class="mt-1">
              <b>Email</b>
            </div>
            <%= data.customer.email %>
          </td>
        </tr>

        <tr>
          <td>
            <div class="mt-1">
              <b>Dirección</b>
            </div>
            <%= data.customer.address %>
          </td>
        </tr>
      </tbody>
    </table>

    <br />

    <h2>Transacciones del cliente</h2>
    <table class="bordered-table" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Descripción</th>
          <th>Fecha</th>
          <th>Monto</th>
        </tr>
      </thead>
      <tbody>
        <% data.transactions.forEach(transaction => { %>
        <tr>
          <td>
            <%= transaction.type == 'credit' ? 'Crédito' : 'Pago' %>
          </td>
          <td>
            <%= transaction.description %>
          </td>
          <td>
            <%= moment(transaction.created_at).format('DD/MM/YYYY, h:mma') %>
          </td>
          <td>
            C$<%= transaction.total %>
          </td>
        </tr>
        <% }) %>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" align="right">
            <b>
              DEUDA TOTAL
            </b>
          </td>
          <td>
            <b>
              C$<%= data.totalDebt %>
            </b>
          </td>
        </tr>
      </tfoot>
    </table>
  </body>
</html>`

function customerDetailReport(data) {
  const company = store.getters.company
  const title = `Reporte de Cliente - ${data.customer.name}`

  const renderedTemplate = render(customerDetailHtmlTemplate, {
    data,
    logo,
    company,
    moment,
    title
  })

  const styles = `h4 { margin-botton: 1px !important; }`

  printContentent(renderedTemplate, title, styles)
}

export { customersReport, customerDetailReport }
