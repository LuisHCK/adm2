import store from '../store'

const getCurrency = () => store.getters.currency

/**
 * Generates a localized number
 * @param {number} value
 * @returns string
 */
export const formatNumber = value => {
    const currency = getCurrency()
    const safeNumber = Number(value)

    if (isNaN(safeNumber)) {
        return `${currency}${0.00}`
    }


    const formatedNumber = safeNumber
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$&,')
        .replace('.00', '')
    return `${currency}${formatedNumber}`
}
