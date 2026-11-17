import { printInvoice, invoiceFormatId } from '@/reports/invoice'

/**
 * Print content in a new window using the browser print dialog.
 * @param {String} htmlString Rendered HTML string
 * @param {String} title Optional page title (kept for call-site compatibility)
 * @param {String} styles Optional CSS styles (kept for call-site compatibility)
 * @param {Function} callback Optional callback
 */
export const printContentent = (
    htmlString,
    title = '',
    styles = '',
    callback = () => {},
) => {
    webPrint(htmlString, callback)
}

/**
 * Use the browser print dialog.
 * @param {String} renderedTemplate Rendered template
 * @param {Function} callback Callback function
 */
function webPrint(renderedTemplate, callback = null) {
    const printWindow = window.open('about:blank', '')

    if (!printWindow) {
        if (callback) callback()
        return
    }

    printWindow.document.open()
    printWindow.document.write(renderedTemplate)
    printWindow.document.close()

    const triggerPrint = () => {
        printWindow.focus()
        printWindow.print()
    }

    if (printWindow.document.readyState === 'complete') {
        setTimeout(triggerPrint, 0)
    } else {
        printWindow.addEventListener('load', triggerPrint, { once: true })
    }

    printWindow.addEventListener('afterprint', () => printWindow.close(), {
        once: true,
    })

    if (callback) callback()
}

/**
 * Browsers cannot enumerate printers. Kept for compatibility with the settings UI.
 * @returns {Array}
 */
export const getPrintersList = () => []

/**
 * Print a sale receipt using the browser print dialog.
 * The invoice template is the single source of truth for web printing.
 * @param {Object} sale Sale to print
 */
export const receiptPrint = sale => {
    const html = printInvoice(sale)
    return printContentent(html, `Recibo #${invoiceFormatId(sale.id)}`)
}
