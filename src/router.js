import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import store from './store'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      meta: {
        layout: 'main-layout'
      },
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      meta: {
        layout: 'main-layout'
      },
      component: () =>
        import(/* webpackChunkName: "about" */ './views/About.vue')
    },
    {
      path: '/login',
      name: 'login',
      meta: {
        isPublic: true,
        layout: 'auth-layout'
      },
      component: () => import('./views/Login.vue')
    },
    {
      path: '/registration',
      name: 'registration',
      meta: {
        isPublic: true,
        layout: 'auth-layout'
      },
      component: () => import('./views/Registration.vue')
    },
    {
      path: '/products',
      name: 'products',
      meta: { layout: 'main-layout' },
      component: () => import('./views/Products.vue')
    },
    {
      path: '/inventories',
      name: 'inventories',
      meta: { layout: 'main-layout' },
      component: () => import('./views/Inventories.vue')
    },
    {
      path: '/inventories/:id',
      name: 'inventory',
      meta: { layout: 'main-layout' },
      component: () => import('./views/Inventory.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      meta: { layout: 'main-layout' },
      component: () => import('./views/Settings.vue')
    },
    {
      path: '/pos',
      name: 'pos',
      meta: { layout: 'main-layout' },
      component: () => import('./views/Pos.vue')
    },
    {
      path: '/sales',
      name: 'sales',
      meta: { layout: 'main-layout' },
      component: () => import('./views/Sales.vue')
    },
    {
      path: '/employees',
      name: 'employees',
      meta: { layout: 'main-layout' },
      component: () => import('./views/Employees.vue')
    },
    {
      path: '/providers',
      name: 'providers',
      meta: { layout: 'main-layout' },
      component: () => import('./views/Providers.vue')
    },
    {
      path: '/routes',
      name: 'routes',
      meta:{ layout: 'main-layout' },
      component: () => import('./views/Routes.vue')
    },
    {
      path: '/customers',
      name: 'customers',
      meta: { layout: 'main-layout' },
      component: () => import('./views/Customers.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.meta.isPublic || store.getters.isAuthenticated) {
    next()
  } else {
    store.getters.userCount.then(count => {
      if (count) {
        next({ name: 'login' })
      } else {
        next({ name: 'registration' })
      }
    })
  }
})

export default router
