import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Buefy from 'buefy'
import './db'
import 'buefy/dist/buefy.css'
import './assets/materialdesignicons.css'

Vue.use(Buefy)

Vue.config.productionTip = false

var app = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
