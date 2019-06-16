<template>
  <div id="products-page">
    <button class="button is-primary is-small is-pulled-right" @click="showForm=!showForm">Nuevo</button>
    <h4 class="has-text-weight-bold">Productos</h4>

    <hr>

    <form @submit.prevent="searchProduct" class="search-form">
      <input ref="searchInput" class="input" placeholder="Nombre, marca, codigo" type="text">
    </form>

    <b-table
      :paginated="true"
      :pagination-simple="true"
      :per-page="perPage"
      :data="products"
      :striped="true"
      :hoverable="true"
      :loading="loading"
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
          <button
            @click="openUpdateForm(props.row)"
            class="button is-success is-small is-rounded"
          >
            <i class="mdi mdi-pencil"></i>
          </button>
          <button
            @click="openUpdateForm(props.row)"
            class="button is-danger is-small is-rounded"
          >
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
          <product-form :show="showForm" @submit="saveProduct"/>
        </section>
      </div>
    </b-modal>

    <!-- Product edit form -->
    <b-modal :active.sync="showUpdateForm" has-modal-card>
      <div v-if="selectedProduct" class="modal-card">
        <header class="modal-card-head">
          <span class="modal-card-title" v-text="selectedProduct.name"/>
        </header>
        <section class="modal-card-body">
          <product-form :product-id="selectedProduct.id" @submit="updateProduct"/>
        </section>
      </div>
    </b-modal>
  </div>
</template>

<script>
import ProductForm from '@/components/product/Form.vue'
import EventBus from '@/event-bus'

export default {
  name: 'products',

  components: {
    ProductForm
  },

  data() {
    return {
      products: [],
      loading: true,
      showForm: false,
      perPage: 50,
      selectedProduct: undefined,
      showUpdateForm: false
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
        this.getProducts()
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
    }
  },

  mounted() {
    this.getProducts()
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