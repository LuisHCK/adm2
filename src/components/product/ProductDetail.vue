<template>
  <div class="product-container" v-if="product">
    <h4 class="has-text-weight-bold">{{ product.name }}</h4>

    
  </div>
</template>

<script>
export default {
  name: 'product-detail',

  data() {
    return {
      product: undefined
    }
  },

  methods: {
    showProject() {}
  }
}
</script>

<style lang="scss" scoped>
</style>