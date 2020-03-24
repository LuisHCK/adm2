<template>
  <div class="side-nav is-primary" :class="sidenavVisible? classes:'hidden'">
    <div class="items-container">
      <div class="company-logo">
        <div v-if="!company" class="company-cover has-text-centered">
          <span class="has-text-weight-bold has-text-white-bis is-size-4" v-text="'ADM2'" />
        </div>
        <div v-else class="company-cover has-text-centered">
          <span class="has-text-weight-bold has-text-white-bis is-size-4" v-text="company.name" />
        </div>
      </div>
      <div class="nav-items">
        <div
          v-for="(item, i) in items"
          @click="to(item.path); toggleSidenav()"
          :key="`item-${i}`"
          class="nav-item"
        >
          <b-icon :icon="item.icon" />
          <span class="text-item" v-text="item.label" />
        </div>
      </div>
    </div>
    <div class="bottom-items">
      <button @click="to('settings'); toggleSidenav()" class="btn settings">
        <b-icon icon="settings" size="is-normal"></b-icon>
      </button>
      <button class="btn logout">
        <b-icon icon="exit-to-app" size="is-normal"></b-icon>
      </button>
    </div>

    <!-- Overlay -->
    <div @click="toggleSidenav()" class="overlay" :class="sidenavVisible? classes:'hidden'"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import EventBus from '@/event-bus'

export default {
  name: 'side-nav',

  data() {
    return {
      logo: localStorage.getItem('company_logo'),
      items: [
        { label: 'Inicio', path: 'home', icon: 'view-dashboard' },
        { label: 'POS', path: 'pos', icon: 'point-of-sale' },
        { label: 'Productos', path: 'products', icon: 'package-variant' },
        { label: 'Clientes', path: 'customers', icon: 'account-group' },
        {
          label: 'Inventarios',
          path: 'inventories',
          icon: 'format-list-checks'
        },
        { label: 'Registro de Ventas', path: 'sales', icon: 'cart-arrow-down' },
        { label: 'Proveedores', path: 'providers', icon: 'account-group' },
        { label: 'Rutas', path: 'routes', icon: 'truck-fast-outline' },
      ]
    }
  },

  computed: {
    ...mapState(['company', 'sidenavVisible']),
    classes() {
      return 'is-2-desktop ' + 'is-2-mobile' + ' is-2-tablet'
    }
  },

  methods: {
    to(path) {
      this.$router.push({ name: path })
      .catch(err => {})
    },

    updateLogo() {
      this.logo = localStorage.getItem('company_logo')
    },

    toggleSidenav() {
      this.$store.commit('TOGGLE_SIDENAV')
    }
  },

  mounted() {
    // Listen event bus
    EventBus.$on('UPDATE_LOGO', () => {
      this.updateLogo()
    })
  }
}
</script>

<style lang="scss" scoped>
@import 'src/assets/_variables.scss';
.side-nav {
  z-index: 1000;
  padding: 0px;
  width: 250px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #d6d6d6;
  position: fixed;
  transition: 0.3s;
  .company-logo {
    padding-bottom: 8px;
    img {
      width: auto;
      height: 120px;
    }
  }
  .company-cover {
    height: 120px;
    background: linear-gradient(135deg, #1976d2 0%, #91c5e0 100%);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .items-container {
    flex-grow: 1;
    background-color: white;
  }
  .bottom-items {
    display: flex;
    z-index: 1000;
    .btn {
      border: none;
      width: 100%;
      height: 48px;
      color: white;
      cursor: pointer;
      transition: 0.3s;
    }
    .settings {
      background-color: #00acc1;
      &:hover {
        background-color: #1e88e5;
      }
    }
    .logout {
      background-color: #f4511e;
      &:hover {
        background-color: #e64a19;
      }
    }
  }
  // break points
  @media only screen and (max-width: 1023px) {
    position: fixed;
    z-index: 1000;
    left: 0px;
    &.hidden {
      left: -250px;
    }

    .overlay {
      opacity: 1;
      width: 150vw;
      height: 100vh;
      &.hidden {
        opacity: 0;
        height: 0px;
      }
    }

    .items-container {
      z-index: 1000;
    }
  }
}
.nav-items {
  .nav-item {
    padding: 11px 10px;
    cursor: pointer;
    transition: 0.3s;
    border-bottom: 1px solid #f5f5f5;
    .text-item {
      padding: 0px 15px;
    }
    &:hover {
      background-color: #f5f5f5;
    }
  }
}
.overlay {
  opacity: 0;
  transition: 0.3s;
  position: absolute;
  background-color: #00000073;
  z-index: 99;
}
</style>