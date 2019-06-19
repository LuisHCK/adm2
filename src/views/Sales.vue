<template>
  <div id="sales-page">
    <button class="button is-primary is-small is-pulled-right" @click="$router.push('/pos')">Nuevo</button>
    <h4 class="has-text-weight-bold">Ventas</h4>
    <hr>

    <!-- sales list -->
    <b-table
      :paginated="true"
      :pagination-simple="true"
      :per-page="perPage"
      :data="sales"
      :striped="true"
      :hoverable="true"
      :loading="loading"
    >
      <template slot-scope="props">
        <b-table-column field="id" label="ID" width="40" numeric>{{ props.row.id }}</b-table-column>

        <b-table-column field="customer" label="Cliente">
          <strong>{{ props.row.customer.name }}</strong>
        </b-table-column>

        <b-table-column field="items" label="Productos">{{ props.row.shoppingCart.length }}</b-table-column>

        <b-table-column field="sub_total" label="Sub Total">
          <b-tag type="is-info" v-text="'C$ ' + props.row.subTotal"/>
        </b-table-column>

        <b-table-column field="discount" label="Descuento">
          <b-tag v-text="'C$ ' + props.row.discounted"/>
        </b-table-column>

        <b-table-column field="total" label="TOTAL">
          <b-tag type="is-success" v-text="'C$ ' + props.row.total"/>
        </b-table-column>

        <b-table-column
          field="date_time"
          label="Fecha de venta"
        >{{ props.row.created_at | moment("MMM DD YYYY, h:mm a") }}</b-table-column>

        <b-table-column field="actions" label="Actions">
          <div class="buttons">
            <b-button type="is-primary" rounded icon-right="eye" size="is-small"/>
            <b-button type="is-info" rounded icon-right="printer" size="is-small"/>
            <b-button type="is-warning" rounded icon-right="pencil" size="is-small"/>
          </div>
        </b-table-column>
      </template>

      <template slot="empty">
        <section class="section">
          <div class="content has-text-grey has-text-centered">
            <p>
              <b-icon icon="package-variant" size="is-large"></b-icon>
            </p>
            <p>No hay ventas registradas.</p>
          </div>
        </section>
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  name: 'sales-page',

  data() {
    return {
      sales: [],
      perPage: 50,
      loading: false
    }
  },

  methods: {
    getSales() {
      this.loading = true
      Database.sale.toArray().then(sales => {
        this.sales = sales
        this.loading = false
      })
    }
  },

  mounted() {
    this.getSales()
  }
}
</script>

<style lang="scss" scoped>
</style>