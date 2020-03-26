const electron = require('electron')
const BrowserWindow = electron.remote.BrowserWindow
import { onElectron } from './electron-utils'

const globalStyles = `
  body { font-family: Arial, Helvetica, sans-serif; },
  table.bordered-table {
    border-collapse: collapse !important;
  }
  table.bordered-table td, table.bordered-table th {
    padding: 6px;
    border: 1px solid black;
  }
`

/**
 * Print content in a new window
 * @param {String} htmlString Rendered HTML string
 * @param {String} styles Optional CSS styles
 * @param {String} title Optional Page title
 * @param {Function} callback Optional callback
 */
export function printContentent(
  htmlString,
  title = '',
  styles = '',
  callback = () => {}
) {
  if (onElectron) {
    printElectron(htmlString, title, styles)
  } else {
    webPrint(htmlString, callback)
  }
}

/**
 * Render final template
 * @param {String} title Title String
 * @param {String} styles Styles String
 * @param {String} htmlString Main content
 */
function renderTemplate(title, styles, htmlString) {
  const renderedTemplate = `<!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="font-family: sans-serif;">
    ${htmlString}
    </body>
  </html>`

  return renderedTemplate
}

/**
 * Use Web print mode
 * @param {String} renderedTemplate Rendered template
 * @param {Function} callback Callback funtion
 */
function webPrint(renderedTemplate, callback = null) {
  var printWindow = window.open('', title)
  printWindow.document.body.innerHTML = renderedTemplate
  printWindow.focus()
  printWindow.print()
  printWindow.close()

  // Execute callback if given
  if (callback) {
    return callback()
  }
}

/**
 * Print Using electron functions
 * @param {String} renderedTemplate Rendered template
 * @param {Function} callback Callback function
 */
function printElectron(renderedTemplate, title = 'Reporte ADM2', styles='') {
  let win = new BrowserWindow({ width: 750, height: 900 })
  const file =
    'data:text/html;charset=UTF-8,' + encodeURIComponent(renderedTemplate)
  win.loadURL(file, { title: title })

  // Merge styles
  const winStyles = mergeStyles(styles)

  // if pdf is loaded start printing.
  win.webContents.on('did-finish-load', () => {
    win.webContents.insertCSS(winStyles)
    win.webContents.print({}, success => {
      // close window after print order.
      // win.close()
    })
  })
}

function mergeStyles(customStyles) {
  if (customStyles) {
    return `${globalStyles}${customStyles}`
  } else {
    return globalStyles
  }
}