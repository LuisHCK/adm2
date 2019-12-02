<template>
  <div class="page-container" id="products-page">
    <div class="is-pulled-right buttons">
      <button
        class="button is-info is-rounded"
        :disabled="checkedProducts.length < 1"
        @click="showInventoryModal = !showInventoryModal"
      >
        <span>Agregar a inventario</span>
        <b-icon icon="package-variant" />
      </button>
      <button class="button is-success is-rounded" @click="showForm=!showForm">
        <span>Nuevo</span>
        <b-icon icon="plus"></b-icon>
      </button>
    </div>

    <h4 class="has-text-weight-bold">Productos</h4>

    <hr />

    <form @submit.prevent="searchProduct" class="search-form">
      <input ref="searchInput" class="input" placeholder="Nombre, marca, codigo" type="text" />
    </form>

    <b-table
      :paginated="true"
      :pagination-simple="true"
      :per-page="perPage"
      :data="products"
      :striped="true"
      :hoverable="true"
      :loading="loading"
      :checked-rows.sync="checkedProducts"
      checkable
    >
      <template slot-scope="props">
        <b-table-column field="id" label="ID" width="40" numeric>{{ props.row.id }}</b-table-column>

        <b-table-column field="name" label="Nombre">
          <strong>{{ props.row.name }}</strong>
        </b-table-column>

        <b-table-column field="brand" label="Marca">{{ props.row.brand }}</b-table-column>

        <b-table-column field="unit" label="Presentación">
          <b-tag type="is-primary">
            {{ props.row.content }}
            {{ props.row.unit }}
          </b-tag>
        </b-table-column>

        <b-table-column field="codebar" label="Código">{{ props.row.codebar }}</b-table-column>

        <b-table-column field="categories" label="Categorías">
          <b-taglist>
            <b-tag
              v-for="(cat, i) in props.row.categories"
              :key="`catg-${i}`"
              v-text="cat"
              type="is-info"
            />
          </b-taglist>
        </b-table-column>
        <b-table-column field="product" label="Acciones">
          <div class="field is-grouped">
            <div class="control">
              <button
                @click="openUpdateForm(props.row)"
                class="button is-success is-small is-rounded"
              >
                <i class="mdi mdi-pencil"></i>
              </button>
            </div>
            <div class="control">
              <button @click="showProduct(props.row)" class="button is-info is-small is-rounded">
                <i class="mdi mdi-eye"></i>
              </button>
            </div>
            <div class="control">
              <button
                @click="openUpdateForm(props.row)"
                class="button is-danger is-small is-rounded"
              >
                <i class="mdi mdi-delete"></i>
              </button>
            </div>
          </div>
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
          <product-form :show="showForm" @submit="saveProduct" />
        </section>
      </div>
    </b-modal>

    <!-- Product edit form -->
    <b-modal :active.sync="showUpdateForm" has-modal-card>
      <div v-if="selectedProduct" class="modal-card">
        <header class="modal-card-head">
          <span class="modal-card-title" v-text="selectedProduct.name" />
        </header>
        <section class="modal-card-body">
          <product-form :product-id="selectedProduct.id" @submit="updateProduct" />
        </section>
      </div>
    </b-modal>

    <!-- Product detail modal -->
    <b-modal :active.sync="showDetailModal" has-modal-card>
      <div class="modal-card" v-if="showDetailModal">
        <section class="modal-card-body">
          <product-detail :id="selectedProductId" />
        </section>
      </div>
    </b-modal>

    <!-- Add to inventory -->
    <b-modal :active.sync="showInventoryModal" has-modal-card>
      <div class="modal-card">
        <div class="modal-card-head">
          <span class="modal-card-title">Agregar productos a inventario</span>
        </div>
        <div class="modal-card-body">
          <b-field label="Inventario">
            <b-select placeholder="Seleccione un inventario" v-model="selectedInventory">
              <option
                v-for="(inventory, index) in inventories"
                :key="'opt-' + index"
                :value="inventory.id"
              >{{ inventory.name }} - {{ inventory.location }}</option>
            </b-select>
          </b-field>
          <p>
            <b>Agregando:</b>
            {{ checkedProducts.length }} productos en total.
          </p>
          <br />
          <b-field>
            <!-- Label left empty for spacing -->
            <p class="control">
              <button
                :disabled="!selectedInventory || checkedProducts.length < 1"
                class="button is-primary"
                @click="addProducts()"
              >Agregar productos</button>
            </p>
          </b-field>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import ProductForm from '@/components/product/Form.vue'
import ProductDetail from '@/components/product/ProductDetail.vue'
import EventBus from '@/event-bus'

export default {
  name: 'products',

  components: {
    ProductForm,
    ProductDetail
  },

  data() {
    return {
      products: [],
      loading: true,
      showForm: false,
      perPage: 50,
      selectedProduct: undefined,
      selectedProductId: undefined,
      showUpdateForm: false,
      showDetailModal: false,
      checkedProducts: [],
      // Inventory form
      inventories: [],
      showInventoryModal: false,
      selectedInventory: undefined
    }
  },

  methods: {
    // Get all products
    getProducts() {
      Database.product
        .toArray()
        .then(products => (this.products = products))
        .then(() => (this.loading = false))
    },

    /**
     * Handle product submit form
     */
    saveProduct(data) {
      // Append timestaps
      const now = new Date()
      data.created_at = now.toISOString()
      data.updated_at = now.toISOString()

      Database.product
        .add(data)
        .then(product => {
          // Save the product
          this.getProducts()
          this.showForm = false
        })
        .catch(err => console.log(err))
    },

    updateProduct(data) {
      Database.product.update(data.id, data).then(() => {
        this.showUpdateForm = false
        this.getProducts()
        this.$buefy.toast.open({
          message: 'Se actualizó el producto',
          type: 'is-success',
          position: 'is-bottom'
        })
      })
    },

    openUpdateForm(product) {
      this.selectedProduct = product
      this.showUpdateForm = true
      EventBus.$emit('SELECT_PROJECT_UPDATE')
    },

    searchProduct() {
      const value = this.$refs.searchInput.value
      if (value.length) {
        Database.product
          .where('name')
          .startsWithIgnoreCase(value)
          .or('brand')
          .startsWithIgnoreCase(value)
          .or('codebar')
          .startsWithIgnoreCase(value)
          .toArray(products => (this.products = products))
      } else {
        this.getProducts()
      }
    },

    showProduct(product) {
      this.selectedProductId = product.id
      this.showDetailModal = true
    },

    getInventories() {
      Database.inventory.toArray(data => (this.inventories = data))
    },
    
    addProducts() {

    }
  },

  mounted() {
    this.getProducts()
    this.getInventories()
  }
}
</script>

<style lang="scss" scoped>
.modal-card {
  width: 450px;
}
.tag {
  margin-right: 2px;
}
.search-form {
  width: 200px;
  margin-bottom: 8px;
}
</style>