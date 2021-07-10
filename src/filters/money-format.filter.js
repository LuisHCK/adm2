import Vue from 'vue'
import store from '../store'

const currency = store.getters.currency

Vue.filter('money', value => formatNumber(value))

/**
 * Generates a localized number
 * @param {number} value
 * @returns string
 */
export const formatNumber = value => {
    const formatedNumber = value
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$&,')
        .replace('.00', '')
    return `${currency}${formatedNumber}`
}
