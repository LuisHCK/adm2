import * as moment from 'moment'
import { render } from 'ejs'
import store from '../store'

const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invoice <%= sale.id %></title>
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
    <div
      id="saleInvoice"
      style="font-family: sans-serif !important; padding: 1.5em;"
    >
      <table style="width: 100%;">
        <tbody>
          <tr>
            <td style="vertical-align: top;">
              <h2>Factura Comercial</h2>
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

      <!-- Template -->
      <table style="width: 100%; margin-top: 1em;">
        <thead>
          <tr>
            <th width="70%"></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="vertical-align: top;">
              <div>
                <b>Cliente</b>
              </div>
              <div>
                <%= sale.customer.name %>
              </div>

              <div style="padding-top: 0.5em;">
                <b>Tipo de pago:</b>
              </div>
              <div>
                <%= sale.sale_type == 'cash' ? 'Efectivo' : 'Crédito' %>
              </div>
            </td>
            <td style="vertical-align: top; text-align: right;">
              <table style="width: 100%;">
                <tbody>
                  <tr>
                    <td style="text-align: left; white-space: nowrap;">
                      <b>Factura #:</b>
                    </td>
                    <td style="text-align: left; white-space: nowrap;">
                      <%= sale.id %>
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align: left; white-space: nowrap;">
                      <b>Fecha:</b>
                    </td>
                    <td style="text-align: left; white-space: nowrap;">
                      <%= moment(sale.created_at).format('DD/MM/YYYY, h:mm a') %>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Products -->
      <table style="width: 100%; border-collapse: collapse; margin-top: 2.5em;">
        <thead>
          <tr style="text-align: left;">
            <th
              align="right"
              style="padding: 6px; border-top: 1px solid black; border-bottom: 1px solid black; font-size: 10pt;"
            >
              Cantidad
            </th>
            <th
              width="50%"
              style="padding: 6px; border-top: 1px solid black; border-bottom: 1px solid black; font-size: 10pt;"
            >
              Descripción
            </th>
            <th
              align="right"
              style="padding: 6px; border-top: 1px solid black; border-bottom: 1px solid black; font-size: 10pt;"
            >
              Precio Unitario
            </th>
            <th
              align="right"
              style="padding: 6px; border-top: 1px solid black; border-bottom: 1px solid black; font-size: 10pt;"
            >
              Descuento
            </th>
            <th
              align="right"
              style="padding: 6px; border-top: 1px solid black; border-bottom: 1px solid black; font-size: 10pt;"
            >
              Subtotal
            </th>
          </tr>
        </thead>

        <tbody>
          <% sale.shoppingCart.filter(s => !s.refunded).forEach(item => { %>
          <tr>
            <td style="padding: 6px; text-align: right;">
              <%= item.quantity %>
            </td>
            <td style="padding: 6px;">
              <%= item.inventoryProduct.product.name %>
              -
              <%= item.inventoryProduct.product.brand %>
              -
              <%= item.inventoryProduct.product.content %>
              <%= item.inventoryProduct.product.unit %>
            </td>
            <td style="padding: 6px; text-align: right;">
            <%= currency %><%= item.inventoryProduct.price %>
            </td>
            <td style="padding: 6px; text-align: right;">
              <% if(item.discount && item.discounted){ %>
                <%= currency %><%= item.discounted %>
              <% } else{ %>  
                  --
              <% } %>
            </td>
            <td style="padding: 6px; text-align: right;">
              <% if(item.discount && item.discounted){ %>
                <%= currency %><%= item.subTotal - (item.discounted || 0) %>
              <% } else{ %>  
                <%= currency %><%= item.subTotal %>
              <% } %>
            </td>
          </tr>
          <% }) %>
        </tbody>

        <tfoot>
          <% if (sale.discount) { %>
          <tr style="border-top: 1px solid black;" v-if="sale.discount">
            <td colspan="4" align="right" style="padding: 6px;">
              <b>Descuento</b>
            </td>
            <td align="right" style="padding: 6px;">
              <b> <%= currency %><%= sale.discounted %> </b>
            </td>
          </tr>
          <% } %>
          <tr style="border-top: 1px solid black;">
            <td colspan="4" align="right" style="padding: 6px;">
              <b>TOTAL</b>
            </td>
            <td align="right" style="padding: 6px;">
              <b> <%= currency %><%= sale.total %> </b>
            </td>
          </tr>
        </tfoot>
      </table>

      <!-- Notes -->
      <% if (sale.notes) { %>
      <table style="width: 100%; border-collapse: collapse; margin-top: 2.5em;">
        <tbody>
          <tr>
            <td>
              <b>Notas:</b>
              <%= sale.notes %>
            </td>
          </tr>
        </tbody>
      </table>
      <% } %>
    </div>
  </body>
</html>`

const logo = localStorage.getItem('company_logo')

/**
 * Print Sale invoice
 * @param {Object} sale Sale object
 */
function printInvoice(sale) {
    const storeData = store.getters.store
    const currency = store.getters.currency

    return render(htmlTemplate, {
        sale,
        store: storeData,
        logo,
        moment,
        currency
    })
}

export { printInvoice }
