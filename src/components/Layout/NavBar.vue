<template>
  <nav class="navbar is-primary" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item" @click="$router.push('/')">ADM</a>

      <button class="navbar-toggle-menu" @click="toggleSidenav()">
        <b-icon icon="menu"></b-icon>
      </button>
    </div>
  </nav>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'nav-bar',

  computed: {
    ...mapState(['user'])
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
  position: sticky;
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