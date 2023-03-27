import { onElectron } from './electron-utils'
import { getSettings } from '@/controllers/settings'
import * as moment from 'moment'
import '@/types'
import { invoiceFormatId } from '@/reports/invoice'

let electron
let BrowserWindow
let PosPrinter

if (onElectron) {
    electron = require('electron')
    BrowserWindow = electron.remote.BrowserWindow

    const { PosPrinter: pPrinter } = require('electron').remote.require(
        'electron-pos-printer',
    )

    PosPrinter = pPrinter
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
export const printContentent = async (
    htmlString,
    title = '',
    styles = '',
    callback = () => {},
) => {
    if (onElectron) {
        const posSettings = (await getSettings('pos')) || { value: {} }
        const printerName = posSettings.value.default_printer || ''

        return receiptPrint()
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
    styles = '',
    printerName = '',
) => {
    const win = new BrowserWindow({
        width: 650,
        height: 900,
        show: !printerName,
    })
    const file =
        'data:text/html;charset=UTF-8,' + encodeURIComponent(renderedTemplate)
    win.loadURL(file, { title: title })

    // if pdf is loaded start printing.
    win.webContents.on('did-finish-load', () => {
        // Merge styles
        const winStyles = mergeStyles(styles)
        win.webContents.insertCSS(winStyles)
        win.webContents.print(
            { silent: !!printerName, deviceName: printerName, color: false },
            () => {
                // close window after print order.
                win.close()
                win.destroy()
            },
        )
    })
}

function mergeStyles(customStyles) {
    if (customStyles) {
        return `${globalStyles}${customStyles}`
    } else {
        return globalStyles
    }
}

/**
 * Get a list of attached printers
 * @returns {PrinterInfo[]} Attached Printers
 */
export const getPrintersList = () => {
    if (BrowserWindow) {
        const printWindow = new BrowserWindow({
            'auto-hide-menu-bar': true,
            show: false,
        })

        printWindow.loadURL('about:blank')
        return printWindow.webContents.getPrinters()
    } else {
        return []
    }
}

export const receiptPrint = async sale => {
    const posSettings = await getSettings('pos')
    const storeSettings = await getSettings('store')
    const saleDate = moment(sale.created_at).format('DD.MM.YYYY.h:mma')
    const currency = storeSettings?.value?.currency || '$'
    const change = sale.pay_with
        ? (Number(sale.pay_with) - Number(sale.total)).toFixed(2)
        : undefined

    const discounted = sale.shoppingCart.reduce(
        (prev, next) => Number(prev) + Number(next.discounted),
        0,
    )

    const options = {
        width: '180px',
        margin: '0 0 0 0',
        copies: 1,
        printerName: posSettings?.value?.default_printer,
        timeOutPerLine: 400,
        preview: !!posSettings?.value?.show_receipt_popup,
        windowHeight: 480,
        silent: true,
    }

    const familyMonospace = { 'font-family': 'monospace' }

    const divider = {
        type: 'text',
        value: '',
        css: {
            height: '1px',
            'border-top': '1px dashed black',
            width: '100%',
            'text-align': 'left',
            margin: '6px 0px',
        },
    }

    const greetingMessage = {
        type: 'text',
        value: posSettings?.value?.invoice_message,
        css: {
            'text-align': 'center',
            'font-size': 14,
            ...familyMonospace,
        },
    }

    const data = [
        {
            type: 'text',
            value: storeSettings?.value?.name,
            style: `text-align:center;`,
            css: {
                'font-weight': '700',
                'font-size': '14px',
                'font-family': 'monospace',
                'margin-bottom': '8px',
                ...familyMonospace,
            },
        },
        {
            type: 'text',
            value: storeSettings?.value?.phone,
            style: 'text-align:center',
            css: { ...familyMonospace },
        },
        {
            type: 'text',
            value: storeSettings?.value?.legal_id,
            style: 'text-align:center',
            css: { ...familyMonospace },
        },
        {
            type: 'text',
            value: storeSettings?.value?.address,
            style: 'text-align:center',
            css: { 'font-size': '11px', ...familyMonospace },
        },
        { ...divider },
        {
            type: 'text',
            value: 'Recibo de compra',
            style: `text-align:center;`,
            css: {
                'font-weight': '700',
                'font-size': '14px',
                'font-family': 'monospace',
                ...familyMonospace,
            },
        },
        {
            type: 'text',
            value: `#${invoiceFormatId(sale.id)}`,
            style: 'text-align:center',
            css: { 'margin-bottom': '8px', ...familyMonospace },
        },
        {
            type: 'text',
            value: saleDate,
            style: 'text-align:center',
            css: { ...familyMonospace },
        },
        { ...divider },
        // Products list
        {
            type: 'table',
            tableHeader: [
                {
                    type: 'text',
                    value: 'PRD',
                    style: 'text-align: left; padding-bottom: 0',
                },
                {
                    type: 'text',
                    value: 'CNT',
                    style: 'text-align: right; padding-bottom: 0',
                },
                {
                    type: 'text',
                    value: 'TOT',
                    style: 'text-align: right; padding-bottom: 0',
                },
            ],
            tableBody: sale.shoppingCart.map(item => {
                const itemLabel = `${item.inventoryProduct.product.name}
                ${item.inventoryProduct.product.content}${item.inventoryProduct.product.unit}`
                const subTotal =
                    item.discount && item.discounted
                        ? Number(item.subTotal) - Number(item.discounted || 0)
                        : Number(item.subTotal)

                return [
                    {
                        type: 'text',
                        value: itemLabel,
                        style: 'text-align: left',
                    },
                    {
                        type: 'text',
                        value: item.quantity,
                        style: 'text-align: right',
                    },
                    {
                        type: 'text',
                        value: `${currency}${subTotal.toFixed(2)}`,
                        style: 'text-align: right',
                    },
                ]
            }),
            tableHeaderStyle: 'font-size: 11px',
            tableBodyStyle: 'border: none; font-size: 11px',
        },
        {
            type: 'table',
            tableBody: [
                [
                    {
                        type: 'text',
                        value: 'Descuento',
                        style: 'text-align: left',
                    },
                    {
                        type: 'text',
                        value: discounted
                            ? `${currency}${Number(discounted)}`
                            : '--',
                        style: 'text-align: right',
                    },
                ],
                [
                    {
                        type: 'text',
                        value: 'TOTAL',
                        style: 'font-weight: bold; text-align: left',
                    },
                    {
                        type: 'text',
                        value: `${currency}${Number(sale.total).toFixed(2)}`,
                        style: 'font-weight: bold; text-align: right',
                    },
                ],
                [
                    {
                        type: 'text',
                        value: 'Paga con',
                        style: 'text-align: left',
                    },
                    {
                        type: 'text',
                        value: sale.pay_with
                            ? `${currency}${sale.pay_with}`
                            : '--',
                        style: 'text-align: right',
                    },
                ],
                [
                    {
                        type: 'text',
                        value: 'Cambio',
                        style: 'text-align: left',
                    },
                    {
                        type: 'text',
                        value: change ? `${currency}${change}` : '--',
                        style: 'text-align: right',
                    },
                ],
            ],
            tableBodyStyle: 'border-top: 1px dashed',
        },
        posSettings?.value?.invoice_message ? { ...divider } : null,
        posSettings?.value?.invoice_message ? greetingMessage : null,
        { ...divider },
        {
            type: 'barCode',
            value: invoiceFormatId(sale.id),
            height: 32,
            width: 2,
            displayValue: true,
            fontsize: 10,
            position: 'center',
        },
    ]

    PosPrinter.print(data, options)
        .then(() => {})
        .catch(error => {
            console.error(error)
        })
}
