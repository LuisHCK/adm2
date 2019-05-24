<template>
  <div class="main-layout">
    <div class="columns is-mobile is-gapless">
      <side-nav />
      <div class="column">
        <nav-bar />
        <div class="view-container">
          <router-view/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '../components/Layout/NavBar.vue'
import SideNav from '../components/Layout/SideNav.vue'

export default {
  name: "main-layout",

  components: {
    NavBar,
    SideNav
  }
};
</script>

<style lang="scss" scoped>
.view-container {
  margin-top: 52px;
}
</style>