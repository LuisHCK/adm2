<template>
  <div class="column side-nav-container" :class="visible? classes:'hidden'">
    <div class="side-nav is-primary">
      <h1>ADM</h1>
      <hr>
      <div class="nav-items">
        <div @click="to('/')" class="nav-item">Productos</div>
        <div @click="to('/')" class="nav-item">Inventario</div>
        <div @click="to('/')" class="nav-item">Ventas</div>
        <div @click="to('/')" class="nav-item">Empleados</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "side-nav",

  props: {
    visible: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    classes() {
      return "is-2-desktop " + "is-3-tablet";
    }
  },

  methods: {
    to(path) {
      this.$router.push(path)
    }
  },
};
</script>

<style lang="scss" scoped>
.hidden {
  display: none;
}

.side-nav-container {
  position: relative;
}
.side-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100vh;
}
.nav-items {
  .nav-item {
    padding: 8px 10px;
    cursor: pointer;
    transition: 0.3s;
    &:hover {
      color: white;
      background-color: #8d8d8daf;
    }
  }
}
</style>