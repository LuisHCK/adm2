import Vue from 'vue'
import store from '../store'

const currency = store.getters.currency

Vue.filter('money', value => {
    const formatedNumber = value
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$&,')
        .replace('.00', '')
    return `${currency}${formatedNumber}`
})
