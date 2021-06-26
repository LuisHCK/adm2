import * as moment from 'moment'
import { render } from 'ejs'
import store from '../../store'
import JsBarcode from 'jsbarcode'
import { createCanvas } from 'canvas'
import receiptTemplate from './template.ejs'

/**
 * Print Sale invoice
 * @param {Object} sale Sale object
 * @returns {string} HTML string
 */
export const printInvoice = sale => {
    const storeData = store.getters.store
    const currency = store.getters.currency
    let barCode = createCanvas(480, 55, 'svg')

    JsBarcode(barCode, invoiceFormatId(sale.id), {
        displayValue: false,
        height: 45
    })

    const htmlData = render(
        receiptTemplate,
        {
            sale,
            store: storeData,
            moment,
            currency,
            barCode: barCode.toDataURL('image/jpg', 'best'),
            invoiceFormatId
        },
        { beautify: false, rmWhitespace: true }
    )

    return htmlData
}

/**
 * Generates a formated ID
 * @param {number} id Invoice id
 * @returns {string} formated invoide id
 */
export const invoiceFormatId = id => {
    /* A fixed pattern of leading zeros */
    const pattern = '000000'

    if (id.toString().length <= pattern.length) {
        return (pattern + id).slice(-Math.abs(pattern.length))
    }

    return id.toString()
}
