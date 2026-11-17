import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { pinia, compatStore } from './store'
import Buefy from 'buefy'
import { setBuefy } from './event-bus'
import i18n from './i18n'
import directives from './directives'
import './db'
import './assets/materialdesignicons.css'
import './assets/_fonts.scss'
import './buefy.scss'
import '@/styles.scss'
import { formatDate } from './lib/datetime'
import { formatNumber } from './filters/money-format.filter'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(Buefy)
app.use(directives)

setBuefy(app.config.globalProperties.$buefy)

app.config.globalProperties.$date = formatDate
app.config.globalProperties.$money = formatNumber
app.config.globalProperties.$store = compatStore

app.mount('#app')
