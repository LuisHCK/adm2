<template>
  <div class="sales-list">
    <!-- Table header -->
    <table class="table is-fullwidth">
      <thead>
        <tr>
          <th>#</th>
          <th>Nombre</th>
          <th>Compras</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="customers.length">
          <tr v-for="(customer, i) in customers" :key="i">
            <td>
              <i class="user-icon mdi mdi-account-circle"></i>
            </td>
            <td v-text="customer.name"></td>
            <td>
              <strong v-text="customer.purchases"></strong>
            </td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <th colspan="3">No hay resultados</th>
          </tr>
        </template>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3">
            <router-link :to="{ path: 'customers' }">Todos los clientes</router-link>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script>
export default {
  name: 'customers-list',

  data() {
    return {
      ready: false,
      customers: []
    }
  },

  methods: {
    getCustomers() {
      Database.customer
        .orderBy('created_at')
        .reverse()
        .limit(5)
        .toArray()
        .then(items => {
          items.map(customer => {
            this.getPurchasesCount(customer.id).then(count => {
              customer.purchases = count
              this.customers.push(customer)
            })
          })
        })
    },

    getPurchasesCount(customerId) {
      return Database.sale.where({ customer_id: customerId }).count()
    }
  },

  mounted() {
    this.getCustomers()
  }
}
</script>

<style lang="scss" scoped>
.sales-list {
  .user-icon {
    color: rgb(75, 101, 124);
  }
}
</style>