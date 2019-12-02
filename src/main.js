import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Buefy from 'buefy'
import VeeValidate from 'vee-validate'
import './db'
import './assets/materialdesignicons.css'
import moment from 'moment'
import 'moment/locale/es'
import '@/buefy.scss'
import '@/styles.scss'

Vue.use(Buefy)

Vue.config.productionTip = false

Vue.use(VeeValidate)

Vue.use(require('vue-moment'), {
  moment
})

window.app = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
