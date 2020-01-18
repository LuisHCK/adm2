<template>
  <nav class="navbar is-primary" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <button class="navbar-toggle-menu" @click="toggleSidenav()">
        <b-icon icon="menu"></b-icon>
      </button>
      <a class="navbar-item" @click="$router.push('/')">
        <span v-if="company" v-text="company.name"/>
        <span v-else v-text="'ADM'"/>
      </a>
    </div>
  </nav>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'nav-bar',

  computed: {
    ...mapState(['user', 'company'])
  },

  methods: {
    toggleSidenav() {
      this.$store.commit('TOGGLE_SIDENAV')
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  width: 100%;
}
.navbar-brand {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.navbar-toggle-menu {
  display: none;
  width: 48px;
  color: white;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: 0.3s;
  &:active {
    background-color: rgba(94, 94, 94, 0.37);
  }

  @media only screen and (max-width: 1023px) {
    display: block;
  }
}
</style>