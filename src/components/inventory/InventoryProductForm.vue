<template>
  <form @submit.prevent="submit" id="inventoryProductForm">
    <!-- Name -->
    <div v-if="inventoryProduct" style="margin-bottom: 20px;">
      <strong v-text="getProductName(inventoryProduct.product)"/>
      <br>
      <small v-text="inventoryProduct.product.brand" />
    </div>

    <!-- Select -->
    <b-field
      v-else
      label="Producto*"
      :type="messages.product_id? 'is-danger':''"
      :message="messages.product_id"
    >
      <v-select
        v-model="form.product_id"
        :options="products"
        label="name"
        :reduce="product => product.id">
        <template slot="option" slot-scope="option">
          {{ option.name }} - {{ option.brand }} | {{ option.content }} {{ option.unit }}
        </template>

      <template slot="selected-option" slot-scope="option">
        {{ option.name }} - {{ option.brand }} | {{ option.content }} {{ option.unit }}
      </template>
      </v-select>
    </b-field>

    <div class="columns">
      <div class="column">
       <!-- Price -->
        <b-field label="Precio*">
          <b-numberinput v-model="form.price" min="1" :controls="false" />
        </b-field>
      </div>

      <div class="column">
        <!-- Stock -->
        <b-field label="Existencias*">
          <b-numberinput v-model="form.stock" min="0" :controls="false" />
        </b-field>
      </div>
    </div>

    <!-- Lote -->
    <b-field label="Lote">
      <b-input v-model="form.lot" />
    </b-field>
    <hr>
    <div>
      <button type="submit" class="button is-success">Guardar</button>
    </div>
  </form>
</template>

<script>
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import EventBus from '@/event-bus'

export default {
  name: 'inventory-product-form',

  components: {
    'v-select': vSelect
  },

  props: {
    inventoryId: {
      type: Number,
      default: undefined
    },
    inventoryProductId: {
      type: Number,
      default: undefined
    }
  },

  data() {
    return {
      form: {},
      messages: {},
      products: [],
      inventoryProduct: {
        product: {}
      }
    }
  },

  methods: {
    getProducts() {
      Database.product
        .toArray()
        .then(products => (this.products = products))
        .then(() => (this.loading = false))
    },

    submit() {
      if (this.form.product_id && this.form.price && this.form.stock) {
        // Append inventory id if not updating mode
        if (!this.inventoryProduct) {
          this.form.inventory_id = this.inventoryId
        }

        this.$emit('submit', this.form)
      } else {
        this.notifyError('Por favor revise el formulario')
        this.showMessages()
      }
    },

    getInventoryProduct() {
      Database.inventory_product.get(this.inventoryProductId).then(data => {
        // set form data
        this.form = data
        Database.product.get(data.product_id).then(product => {
          this.inventoryProduct = data
          this.inventoryProduct.product = product
        })
      })
    },

    showMessages() {
      if (!this.form.product_id) {
        this.messages.product_id = 'Este campo es requerido'
      }
      this.$forceUpdate()
    },

    notifyError(text) {
      this.$buefy.toast.open({
        duration: 3000,
        message: text,
        position: 'is-bottom',
        type: 'is-danger'
      })
    },

    getProductName(product) {
      if (product)
      return `${product.name} - ${product.content} ${product.unit}`
    }
  },

  mounted() {
    if (this.inventoryId) {
      this.getProducts()
    }

    if (this.inventoryProductId) {
      this.getInventoryProduct()
    }
  }
}
</script>

<style lang="scss" scoped>
</style>