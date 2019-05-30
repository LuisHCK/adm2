<template>
  <div class="inventory-card" @click="goToInventory">
    <section class="main">
      <div>
        <strong class="is-size-4" v-text="inventory.name"/>
      </div>
      <div>
        <strong>Ubicación: </strong>
        <span v-text="inventory.location"/>
      </div>
      <div>
        <strong>Descripción: </strong>
        <span v-text="inventory.description"/>
      </div>
    </section>
    <section class="counter">
      <h1 class="is-size-2" v-text="inventory.productsCount || 0" />
      <small>Productos</small>
    </section>
  </div>
</template>

<script>
export default {
  name: "inventory-card",

  props: {
    inventory: {
      type: Object,
      default: {}
    }
  },

  methods: {
    goToInventory() {
      this.$router.push({
        name: "inventory",
        params: { id: this.inventory.id }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.inventory-card {
  border: 1px solid rgb(224, 224, 224);
  padding: 12px;
  border-radius: 8px;
  display: flex;
  cursor: pointer;
  transition: 0.3s;
  margin: 1px;

  .main {
    width: 100%;
  }
  .counter {
    width: 35%;
    text-align: center;
  }
  &:hover {
    background-color: rgb(252, 252, 252);
  }
}
</style>