<template>
  <div>
    <button class="button is-primary is-small is-pulled-right" @click="showForm=!showForm">Nuevo</button>
    <h1 class="has-text-weight-bold" v-text="inventory.name"/>
    <hr>
    <b-table
      :data="inventoryProducts"
      :striped="true"
      :hoverable="true"
      :loading="loading"
      :focusable="true"
    >
      <template slot-scope="props">
        <b-table-column field="id" label="ID" width="40" numeric>{{ props.row.id }}</b-table-column>

        <b-table-column field="product_id" label="Nombre">
          <strong v-text="getProduct(props.row.product_id).name"/>
        </b-table-column>

        <b-table-column field="product" label="Unidad">
          <span v-text="getProduct(props.row.product_id).unit"/>
        </b-table-column>

        <b-table-column field="price" label="Precio">
          <b-tag type="is-primary">C${{ props.row.price }}</b-tag>
        </b-table-column>

        <b-table-column field="stock" label="Cantidad">{{ props.row.stock }}</b-table-column>

        <b-table-column field="lot" label="Lote">
          <b-tag v-text="props.row.lot" type="is-info"/>
        </b-table-column>
      </template>

      <template slot="empty">
        <section class="section">
          <div class="content has-text-grey has-text-centered">
            <p>
              <b-icon icon="emoticon-sad" size="is-large"></b-icon>
            </p>
            <p>No hay productos para mostrar.</p>
          </div>
        </section>
      </template>
    </b-table>

    <!-- Product modal form -->
    <b-modal :active.sync="showForm" has-modal-card>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Agregar un nuevo producto</p>
        </header>
        <section class="modal-card-body">
          <inventory-product-form
            :inventory-id="inventory.id"
            :show="showForm"
            @submit="saveInventoryProduct"
          />
        </section>
      </div>
    </b-modal>
  </div>
</template>

<script>
import InventoryProductForm from '@/components/inventory/InventoryProductForm.vue'
import EventBus from '@/event-bus'

export default {
  components: {
    InventoryProductForm
  },

  data() {
    return {
      inventory: {},
      inventoryProducts: [],
      products: [],
      showForm: false,
      loading: false
    }
  },

  methods: {
    getInventoryProducts() {
      Database.inventory_product
        .where({ inventory_id: this.inventory.id })
        .toArray(data => {
          this.inventoryProducts = data
          this.getProducts()
        })
    },

    getProducts() {
      this.inventoryProducts.map(element => {
        Database.product.get(element.product_id).then(product => {
          EventBus.$emit('RESET_INVENTORY_PRODUCT_FORM')
          this.products.push(product)
        })
      })
    },

    getProduct(id) {
      const product = this.products.find(product => {
        return product.id == id
      })
      // Return empty objetct if not product
      if (!product) return {}

      return product
    },

    saveInventoryProduct(data) {
      Database.inventory_product
        .add(data)
        .then(() => {
          this.showToast('Se agregó el producto al inventario')
          this.getInventoryProducts()
          this.showForm = false
        })
        .catch(err => console.log(err))
    },

    getInventory() {
      const inventoryId = this.$route.params.id

      Database.inventory.get(inventoryId, data => {
        this.inventory = data
        this.getInventoryProducts()
      })
    },

    /**
     * Show a toast
     */
    showToast(message, error = false) {
      this.$toast.open({
        message: message,
        type: error ? 'is-danger' : 'is-success',
        position: 'is-bottom'
      })
    }
  },

  mounted() {
    this.getInventory()
  }
}
</script>

<style lang="scss" scoped>
</style>