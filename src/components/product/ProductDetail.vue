<template>
  <div class="product-container" v-if="id && product">
    <h4 class="is-size-3 has-text-weight-bold">{{ product.name }}</h4>

    <table class="table" style="width: 100%;">
      <tbody>
        <tr>
          <td>
            <b>Nombre:</b>
          </td>
          <td>{{ product.name }}</td>
        </tr>
        <tr>
          <td>
            <b>Descripción:</b>
          </td>
          <td>
            {{ product.description }}
          </td>
        </tr>
        <tr>
          <td>
            <b>Presentación:</b>
          </td>
          <td>
            {{ product.content }} {{ product.unit }}
          </td>
        </tr>
        <tr>
          <td>
            <b>Marca:</b>
          </td>
          <td>{{ product.brand }}</td>
        </tr>
        <tr>
          <td>
            <b>Codigo:</b>
          </td>
          <td>
            {{ product.codebar }}
          </td>
        </tr>
        <tr>
          <td>
            <b>Estatus:</b>
          </td>
          <td>
            {{ product.status }}
          </td>
        </tr>
        <tr>
          <td>
            <b>Categorías</b>
          </td>
          <td>
            <b-taglist>
              <b-tag
                v-for="(category, index) in product.categories"
                :key="'cat-' + index"
                type="is-info"
                v-text="category" />
            </b-taglist>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'product-detail',

  props: {
    id: {
      type: Number
    }
  },

  data() {
    return {
      product: undefined
    }
  },

  methods: {
    getProduct() {
      Database.product.get(
        this.id, data => this.product = data)
    }
  },

  mounted() {
    this.getProduct()
  }
}
</script>

<style lang="scss" scoped>
</style>