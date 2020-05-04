<template>
  <div class="container">
    <b-table
      :paginated="true"
      :pagination-simple="true"
      :per-page="perPage"
      :data="products"
      :striped="true"
      :hoverable="true"
      :loading="loading"
      :sticky-header="true"
      height="75vh"
    >
      <template slot-scope="props">
        <b-table-column field="id" label="ID" width="40" numeric>{{
          props.row.id
        }}</b-table-column>

        <b-table-column field="name" label="Nombre">
          <strong>{{ props.row.name }}</strong>
        </b-table-column>

        <b-table-column field="brand" label="Marca">{{
          props.row.brand
        }}</b-table-column>

        <b-table-column field="unit" label="Presentación">
          <b-tag type="is-primary">
            {{ props.row.content }}
            {{ props.row.unit }}
          </b-tag>
        </b-table-column>

        <b-table-column field="codebar" label="Código">{{
          props.row.codebar
        }}</b-table-column>

        <b-table-column field="quantity" label="Cantidad">
          <b-field>
            <b-numberinput
              type="is-info"
              :min="0"
              controls-position="compact"
            ></b-numberinput>
          </b-field>
        </b-table-column>
        <b-table-column field="price" label="Precio">
          <b-field>
            <b-numberinput
              type="is-info"
              :min="0"
              controls-position="compact"
            ></b-numberinput>
          </b-field>
        </b-table-column>
        <b-table-column
          field="notify_low_quantity"
          label="Notificar antes de agotarse"
        >
          <b-switch></b-switch>
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
  </div>
</template>

<script>
export default {
  name: 'ImportProducts',

  data() {
    return {
      loading: false,
      perPage: 100,
      products: []
    }
  },

  methods: {
    getProducts() {
      Database.product
        .toArray()
        .then(products => {
          this.products = products
        })
        .then(() => (this.loading = false))
    }
  },

  mounted() {
    this.getProducts()
  }
}
</script>

<style></style>
