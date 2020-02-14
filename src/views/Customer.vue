<template>
  <div class="page-container">
    <h4 class="has-text-weight-bold">Detalles de cliente</h4>

    <br />

    <div class="columns is-mobile">
      <div class="column is-full-mobile is-one-third-tablet customer-details">
        <h2 class="has-text-weight-bold is-size-2">
          {{ customer.name }}
          {{ customer.last_name }}
        </h2>

        <hr />

        <!-- phone -->
        <div class="has-text-weight-semibold">Telefono</div>
        <div>{{ customer.phone }}</div>

        <hr />

        <!-- email -->
        <div class="has-text-weight-semibold">Email</div>
        <div>{{ customer.email }}</div>

        <hr />

        <!-- Address -->
        <div class="has-text-weight-semibold">Direccion</div>
        <div>{{ customer.address || '---' }}</div>
      </div>
      <div class="column">
        <b-table></b-table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'customer',

  data() {
    return {
      customer: {},
      sales: []
    }
  },

  methods: {
    /** Get customter object by ID param */
    getCustomer() {
      const id = Number(this.$route.params.id)

      Database.customer.get({ id }, data => {
        this.customer = data
      })


    /**
     * Get all purchases by Customer
     */
    getSales() {
      const id = Number(this.$route.params.id)
      Database.sale.where({ customer_id: id, sale_type: 'credit' }).toArray(data => {
        this.sales = data.map(d => {
          return {
            type: 'sale',
            id: d.id,
            total: d.total,
            created_at: d.created_at,
            updated_at: d.updated_at
          }
        })
      })
    }
  },

  mounted() {
    this.getCustomer()
    this.getSales()
  }
}
</script>

<style lang="scss">
.customer-details {
  background-color: white;
}
</style>