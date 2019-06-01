import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Buefy from 'buefy'
import VeeValidate from 'vee-validate'
import './db'
import 'buefy/dist/buefy.css'
import './assets/materialdesignicons.css'

Vue.use(Buefy)

Vue.config.productionTip = false

Vue.use(VeeValidate)

window.app = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
