<template>
  <div id="products-page">
    <button class="button is-primary is-small is-pulled-right" @click="showForm=!showForm">Nuevo</button>
    <h4 class="has-text-weight-bold">Productos</h4>

    <hr>



    <b-table
      :paginated=true
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

        <b-table-column field="unit" label="Unidad">
          <b-tag type="is-primary">{{ props.row.unit }}</b-tag>
        </b-table-column>

        <b-table-column field="codebar" label="Código">{{ props.row.codebar }}</b-table-column>

        <b-table-column field="categories" label="Categorías">
          <b-taglist>
            <b-tag v-for="(cat, i) in props.row.categories" :key="`catg-${i}`" v-text="cat" type="is-info"/>
          </b-taglist>
        </b-table-column>
        <b-table-column label="">
          <button class="button is-info is-small is-rounded is-outlined">
            <i class="mdi mdi-pencil"></i>
          </button>
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
          <product-form :show="showForm" @submit="saveProduct"/>
        </section>
      </div>
    </b-modal>
  </div>
</template>

<script>
import ProductForm from "@/components/product/Form.vue";

export default {
  name: "products",

  components: {
    ProductForm
  },

  data() {
    return {
      products: [],
      loading: true,
      showForm: false,
      perPage: 50
    };
  },

  methods: {
    // Get all products
    getProducts() {
      Database.product
        .toArray()
        .then(products => (this.products = products))
        .then(() => (this.loading = false));
    },

    /**
     * Handle product submit form
     */
    saveProduct(data) {
      Database.product
        .add(data)
        .then(product => {
          // Save the product
          this.getProducts();
          this.showForm = false;
        })
        .catch(err => console.log(err));
    }
  },

  mounted() {
    this.getProducts();
  }
};
</script>

<style lang="scss" scoped>
.modal-card {
  width: 450px;
}
.tag {
  margin-right: 2px;
}
</style>