import { createPinia, defineStore } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { getUserCount } from '../lib/auth'
import Maths from '../lib/maths'
import {
    SET_STORE,
    TOGGLE_SIDENAV,
    ADD_PRODUCT_TO_SHOPPING_CART,
} from '@/constants'

export const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export const useAppStore = defineStore('app', {
    state: () => ({
        user: undefined,
        users: [],
        store: {},
        shoppingCart: [],
        shoppingCartCustomer: {},
        chartData: {},
        sidenavVisible: false,
        actionButtons: [],
        pos: undefined,
    }),

    getters: {
        userCount() {
            return getUserCount()
        },

        isAuthenticated: state => state.user != undefined,

        shoppingCartTotal: state =>
            state.shoppingCart.reduce((value, item) => {
                const discounted = item.discounted || 0
                return value + (item.subTotal - discounted)
            }, 0),

        currency: state => state.store.currency || '$',

        currentUser: state => state.user,
    },

    actions: {
        setUser(user) {
            this.user = user
        },

        [SET_STORE](store) {
            this.store = store
        },

        [TOGGLE_SIDENAV]() {
            this.sidenavVisible = !this.sidenavVisible
        },

        [ADD_PRODUCT_TO_SHOPPING_CART](payload) {
            this.shoppingCart = [...this.shoppingCart, payload]
        },

        REMOVE_ITEM_SHOPPING_CART(index) {
            this.shoppingCart.splice(index, 1)
        },

        SET_PRODUCT_QTY_SHOPPING_CART(payload) {
            this.shoppingCart[payload.index].quantity = Number(payload.quantity)

            const quantity = this.shoppingCart[payload.index].quantity
            const price = this.shoppingCart[payload.index].inventoryProduct.price

            this.shoppingCart[payload.index].subTotal = quantity * price
            this.shoppingCart = [...this.shoppingCart]
        },

        SET_PRODUCT_DISCOUNT_SHOPPING_CART(payload) {
            const quantity = this.shoppingCart[payload.index].quantity
            const price = this.shoppingCart[payload.index].inventoryProduct.price
            const subTotal = quantity * price

            const discounted = Maths.getPercent(
                subTotal,
                payload.discount || 0,
            )

            this.shoppingCart[payload.index].discount = payload.discount
            this.shoppingCart[payload.index].discounted = discounted
            this.shoppingCart = [...this.shoppingCart]
        },

        INCREASE_PRODUCT_SHOPPING_CART(index) {
            this.shoppingCart[index].quantity++

            const quantity = this.shoppingCart[index].quantity
            const price = this.shoppingCart[index].inventoryProduct.price

            this.shoppingCart[index].subTotal = quantity * price
            this.shoppingCart = [...this.shoppingCart]
        },

        SET_SHOPPING_CART_CUSTOMER(payload) {
            this.shoppingCartCustomer = payload
        },

        CLEAR_SHOPPING_CART() {
            this.shoppingCart = []
        },

        SET_CHART_DATA(payload) {
            this.chartData = payload
        },

        SET_ACTION_BUTTONS(payload) {
            this.actionButtons = payload
        },

        SET_POS_SETTINGS(payload) {
            this.pos = payload
        },

        LOGOUT() {
            this.user = undefined
        },
    },

    persist: true,
})

const getAppStore = () => useAppStore(pinia)

/**
 * Temporary Vuex-style facade used by legacy call sites.
 * Created lazily so Pinia plugins (persistence) are installed first.
 * Remove after Phase 3 once components use the Pinia store directly.
 */
export const compatStore = {
    commit(type, payload) {
        const store = getAppStore()

        if (typeof store[type] === 'function') {
            return store[type](payload)
        }

        throw new Error(`[store] Unknown action: ${type}`)
    },

    dispatch(type, payload) {
        return this.commit(type, payload)
    },

    get getters() {
        return getAppStore()
    },

    get state() {
        return getAppStore().$state
    },
}

export default compatStore
