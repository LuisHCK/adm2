import Vue from "vue"
import Vuex from "vuex"
import { getUserCount } from "./lib/auth"
import VuexPersistence from "vuex-persist"

Vue.use(Vuex)

const vuexLocal = new VuexPersistence({
  storage: window.localStorage
})

export default new Vuex.Store({
  state: {
    user: undefined,
    users: [],
    company: undefined
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

    company: state => {return state.company}
  },

  plugins: [vuexLocal.plugin]
})
