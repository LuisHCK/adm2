<template>
  <component :is="layout"></component>
</template>

<script>
import AuthLayout from "./layouts/AuthLayout.vue";
import MainLayout from "./layouts/MainLayout.vue";

export default {
  components: {
    AuthLayout,
    MainLayout
  },

  computed: {
    layout() {
      return this.$route.meta.layout;
    }
  }
};
</script>
100%

<style lang="scss">
body {
  background-color: #fafafa;
  min-height: 100vh;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
.is-white {
  color: white;
}

.panel {
  background-color: white;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid rgb(231, 231, 231);
}
</style>
