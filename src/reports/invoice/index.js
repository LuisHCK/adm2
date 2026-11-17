import { formatDate } from '../../lib/datetime'
import { render } from 'ejs'
import store from '../../store'
import receiptTemplate from './template.ejs?raw'

/**
 * Print Sale invoice
 * @param {Object} sale Sale object
 * @returns {string} HTML string
 */
export const printInvoice = sale => {
    const storeData = store.getters.store
    const currency = store.getters.currency

    const htmlData = render(
        receiptTemplate,
        {
            sale,
            store: storeData,
            formatDate,
            currency,
            barCode: "",
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
