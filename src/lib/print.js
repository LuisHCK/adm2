const electron = require('electron')
const BrowserWindow = electron.remote.BrowserWindow
import { onElectron } from './electron-utils'

/**
 * Print content in a new window
 * @param {String} htmlString Rendered HTML string
 * @param {String} styles Optional CSS styles
 * @param {String} title Optional Page title
 * @param {Function} callback Optional callback
 */
export function printContentent(
  htmlString,
  styles = '',
  title = '',
  callback = () => {}
) {
  const renderedTemplate = renderTemplate(title, styles, htmlString)

  if (onElectron) {
    printElectron(renderedTemplate, title, callback)
  } else {
    webPrint(renderedTemplate, callback)
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

      <styles>
        ${styles}
      </styles>
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
function printElectron(
  renderedTemplate,
  title = 'Reporte ADM2',
  callback = null
) {
  let win = new BrowserWindow({ width: 650, height: 900 })
  const file =
    'data:text/html;charset=UTF-8,' + encodeURIComponent(renderedTemplate)
  win.loadURL(file, { title: title })

  // if pdf is loaded start printing.
  win.webContents.on('did-finish-load', () => {
    win.webContents.print({}, (success) => {
      // close window after print order.
      win.close()
    })
  })
}
