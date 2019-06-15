<template>
  <div>
    <button class="button is-primary is-small is-pulled-right" @click="showForm=!showForm">Nuevo</button>
    <h1 class="has-text-weight-bold" v-text="inventory.name"/>
    <hr>
    <b-table :data="inventoryProducts" :striped="true" :hoverable="true" :loading="loading">
      <template slot-scope="props">
        <b-table-column field="id" label="ID" width="40" numeric>{{ props.row.id }}</b-table-column>

        <b-table-column field="product_id" label="Nombre">
          <strong v-text="getProduct(props.row.product_id).name"/>
          <br>
          <small v-text="getProduct(props.row.product_id).brand"/>
        </b-table-column>

        <b-table-column field="product" label="Presentación">
          <span v-text="getProduct(props.row.product_id).content"/>
          <span v-text="getProduct(props.row.product_id).unit"/>
        </b-table-column>

        <b-table-column field="price" label="Precio">
          <b-tag type="is-primary">C${{ props.row.price }}</b-tag>
        </b-table-column>

        <b-table-column field="stock" label="Cantidad">{{ props.row.stock }}</b-table-column>

        <b-table-column field="lot" label="Lote">
          <b-tag v-text="props.row.lot" type="is-info"/>
        </b-table-column>

        <b-table-column field="actions" label="Acciones">
          <button
            @click="openUpdateForm(props.row.id)"
            class="button is-info is-small is-rounded is-outlined"
          >
            <i class="mdi mdi-pencil"></i>
          </button>
          <button
            @click="deleteInventoryProduct(props.row)"
            class="button is-danger is-small is-rounded is-outlined">
            <i class="mdi mdi-delete"></i>
          </button>
        </b-table-column>
      </template>

      <template slot="empty">
        <section class="section">
          <div class="content has-text-grey has-text-centered">
            <p>
              <b-icon icon="package-variant" size="is-large"></b-icon>
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

    <!-- Product inventory edit form -->
    <b-modal :active.sync="showUpdateForm" has-modal-card>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Actualizar inventario</p>
        </header>
        <section class="modal-card-body">
          <inventory-product-form
            :inventory-product-id="selectedInventoryProduct"
            :show="showUpdateForm"
            @submit="updateInventoryProduct"
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
      showUpdateForm: false,
      selectedInventoryProduct: undefined,
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
    },

    updateInventoryProduct(data) {
      Database.inventory_product.update(data.id, data).then(() => {
        this.showToast('Se actualizó el inventario!')
        this.showUpdateForm = false
        this.getInventoryProducts()
      })
    },

    getProductName(product_id) {
      const product = this.getProduct(product_id)
      return `${product.name} - ${product.content} ${product.unit}`
    },

    deleteInventoryProduct(inventoryProduct) {
      this.$dialog.confirm({
        title: `Quitar ${this.getProductName(inventoryProduct.product_id)}`,
        message:
          '¿Estás seguro de querer <b>quitar</b> este producto del inventario?' +
          'Esta acción no puede deshacerse.',
        confirmText: 'Si, quitar',
        cancelText: 'Cancelar',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: () => {
          this.$toast.open('Se quitó el producto del inventario')
          Database.inventory_product.delete(inventoryProduct.id)
          this.getInventoryProducts()
        }
      })
    },

    openUpdateForm(inventoryProductId) {
      this.selectedInventoryProduct = inventoryProductId
      this.showUpdateForm = true
    }
  },

  mounted() {
    this.getInventory()
  }
}
</script>

<style lang="scss" scoped>
</style>