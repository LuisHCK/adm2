import { onElectron } from './electron-utils'

let electron
let BrowserWindow

if (onElectron) {
    electron = require('electron')
    BrowserWindow = electron.remote.BrowserWindow
}

const globalStyles = `
  body { font-family: Arial, Helvetica, sans-serif; };
  table.bordered-table {
    border-collapse: collapse !important;
  }
  table.bordered-table td, table.bordered-table th {
    padding: 6px;
    border: 1px solid black;
  }

  mt-1 {
    margin-top: 1em;
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
 * Use Web print mode
 * @param {String} renderedTemplate Rendered template
 * @param {Function} callback Callback funtion
 */
function webPrint(renderedTemplate, callback = null) {
    const printWindow = window.open('about:blank', '')
    printWindow.document.body.innerHTML = renderedTemplate

    printWindow.addEventListener('load', () => {
        printWindow.print()
    })

    printWindow.addEventListener('afterprint', () => {
        printWindow.close()
    })

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
const printElectron = (
    renderedTemplate,
    title = 'Reporte ADM2',
    styles = ''
) => {
    const win = new BrowserWindow({ width: 650, height: 900 })
    const file =
        'data:text/html;charset=UTF-8,' + encodeURIComponent(renderedTemplate)
    win.loadURL(file, { title: title })

    // if pdf is loaded start printing.
    win.webContents.on('did-finish-load', () => {
        // Merge styles
        const winStyles = mergeStyles(styles)
        win.webContents.insertCSS(winStyles)
        win.webContents.print({ silent: true, footer: 'Hello world' }, () => {
            // close window after print order.
            win.close()
            win.destroy()
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
