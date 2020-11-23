<template>
  <div class="side-nav is-primary" :class="sidenavVisible ? classes : 'hidden'">
    <div class="items-container">
      <div class="company-logo">
        <div class="company-cover has-text-centered">
          <img
            :src="logo || require('@/assets/logo.png')"
            alt=""
            class="logo"
          />
          <span
            class="has-text-weight-bold is-size-4 is-margin-top-1"
            v-text="company ? company.name : ''"
          />
        </div>
      </div>
      <div class="nav-items">
        <div
          v-for="(item, i) in items"
          @click="setRoute(item)"
          :key="`item-${i}`"
          class="nav-item"
          :class="{ active: item.path == currentPath }"
        >
          <div class="item-details">
            <b-icon :icon="item.icon" />
            <span class="text-item" v-text="item.label" />
          </div>
          <b-icon v-if="item.path == currentPath" icon="chevron-left" />
        </div>
        <div class="nav-item" @click="logOut()">
          <div class="item-details has-text-danger">
            <b-icon icon="exit-to-app" />
            <span class="text-item" v-text="'Cerrar sesión'" />
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="bottom-items">
      <button
        @click="
          to('settings')
          toggleSidenav()
        "
        class="btn settings"
      >
        <b-icon icon="settings" size="is-normal"></b-icon>
      </button>
      <button class="btn logout">
        <b-icon icon="exit-to-app" size="is-normal"></b-icon>
      </button>
    </div> -->

    <!-- Overlay -->
    <div
      @click="toggleSidenav()"
      class="overlay"
      :class="sidenavVisible ? classes : 'hidden'"
    ></div>
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
      currentPath: 'home'
    }
  },

  computed: {
    ...mapState(['company', 'sidenavVisible']),
    classes() {
      return 'is-2-desktop ' + 'is-2-mobile' + ' is-2-tablet'
    },

    items() {
      return [
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
        { label: 'Ajustes', path: 'settings', icon: 'cog' }
        // { label: 'Rutas', path: 'routes', icon: 'truck-fast-outline' },
      ]
    }
  },

  methods: {
    to(path) {
      this.$router.push({ name: path }).catch(err => {})
    },

    updateLogo() {
      this.logo = localStorage.getItem('company_logo')
    },

    toggleSidenav() {
      this.$store.commit('TOGGLE_SIDENAV')
    },

    setRoute(item) {
      this.to(item.path)
      this.toggleSidenav()
      this.currentPath = item.path
    },
    logOut() {
      this.$buefy.dialog.confirm({
        title: 'Cerrar sesión',
        message: 'Su sesión actual será cerrada.',
        cancelText: 'Cancelar',
        confirmText: 'Confirmar',
        type: 'is-info',
        onConfirm: () => {
          this.$store.dispatch('LOGOUT')
          this.$router.push('/login')
        }
      })
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
  width: 280px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #f1f1f1;
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
    height: 220px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    img.logo {
      height: 120px;
      width: auto;
    }
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
      left: -280px;
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
    height: calc(100vh - 228px);
    overflow-y: auto;

  .nav-item {
    padding: 18px 30px;
    cursor: pointer;
    transition: 0.3s;
    display: flex;
    align-items: center;
    justify-content: space-between;
    // border-bottom: 1px solid #f1f1f1;
    .text-item {
      padding: 0px 15px;
    }
    .item-details {
      display: flex;
      align-items: center;
    }

    i.mdi {
      color: whitesmoke !important;
    }

    &.active {
      background-color: #cfe4fc;
    }

    &:hover {
      background-color: #daeafc;
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
