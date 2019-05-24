<template>
  <nav class="navbar is-primary" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item" @click="$router.push('/')">ADM</a>

      <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>
    <div class="navbar-end">
      <div class="navbar-item">
        <strong class="is-white" v-text="user.name"/>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: "nav-bar",

  computed: {
    ...mapState(['user'])
  },
};
</script>

<style lang="scss" scoped>
.navbar {
  width: 100%;
  position: sticky;
}
</style>