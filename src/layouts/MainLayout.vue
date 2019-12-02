<template>
  <div class="main-layout">
    <side-nav />
    <div class="view-container">
      <nav-bar />
      <router-view />
    </div>
  </div>
</template>

<script>
import NavBar from '../components/Layout/NavBar.vue'
import SideNav from '../components/Layout/SideNav.vue'

export default {
  name: 'main-layout',

  components: {
    NavBar,
    SideNav
  }
}
</script>

<style lang="scss" scoped>
.main-layout {
  display: flex;
}
.view-container {
  width: 100%;
  transition: 0.3s;
  padding-left: 250px;
  @media only screen and (max-width: 1023px) {
    display: block;
    padding-left: 0px;
  }
}
</style>