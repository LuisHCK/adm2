import Vue from 'vue'
import Vuex from 'vuex'
import { getUserCount } from './lib/auth'
import VuexPersistence from 'vuex-persist'

Vue.use(Vuex)

const vuexLocal = new VuexPersistence({
  storage: window.localStorage
})

export default new Vuex.Store({
  state: {
    user: undefined,
    users: [],
    company: undefined,
    shoppingCart: []
  },

  mutations: {
    /**
     * Set User
     * @param {Object} state state
     * @param {Object} user User
     */
    setUser(state, user) {
      state.user = user
    },

    setCompany(state, company) {
      state.company = company
    },

    /**
     * Add inventory product to shopping cart
     * @param {*} state
     * @param {*} inventoryProduct
     */
    ADD_PRODUCT_TO_SHOPPING_CART(state, payload) {
      state.shoppingCart = [...state.shoppingCart, payload]
    },

    /**
     * Remove Inventory Product form shopping cart
     * @param {*} state
     * @param {*} index
     */
    REMOVE_ITEM_SHOPPING_CART(state, index) {
      state.shoppingCart.splice(index, 1)
    },

    /**
     * Set the quantity of shopping cart
     * @param {Object} state Vuex state
     * @param {Object} payload Data
     */
    SET_PRODUCT_QTY_SHOPPING_CART(state, payload) {
      state.shoppingCart[payload.index].quantity = Number(payload.quantity)
      // Compute subtotal
      const qty = state.shoppingCart[payload.index].quantity
      const price = state.shoppingCart[payload.index].inventoryProduct.price
      state.shoppingCart[[payload.index]].subTotal = qty * price
    },

    /**
     * Increase by 1 the shopping cart product Quantity
     * @param {Object} state
     * @param {Number} index
     */
    INCREASE_PRODUCT_SHOPPING_CART(state, index) {
      state.shoppingCart[index].quantity++
      // Compute subtotal
      const qty = state.shoppingCart[index].quantity
      const price = state.shoppingCart[index].inventoryProduct.price
      state.shoppingCart[[index]].subTotal = qty * price
    },

    CLEAR_SHOPPING_CART(state) {
      state.shoppingCart = []
    }
  },

  actions: {},

  getters: {
    userCount() {
      return getUserCount()
    },

    isAuthenticated: state => {
      return state.user != undefined
    },

    company: state => {
      return state.company
    },

    /**
     * Sum all subtotals
     */
    shoppingCartTotal: state => {
      return state.shoppingCart.reduce((val, obj) => {
        return val + obj.subTotal
      }, 0)
    }
  },

  plugins: [vuexLocal.plugin]
})
