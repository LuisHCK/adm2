<template>
  <div class="page-container">
    <h4 class="has-text-weight-bold">Clientes</h4>
    <hr />
    <b-table :data="customers" :columns="columns">
      <template slot="empty">
        <section class="section">
          <div class="content has-text-grey has-text-centered">
            <p>
              <b-icon icon="account-group" size="is-large"></b-icon>
            </p>
            <p>No hay clientes registrados.</p>
          </div>
        </section>
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      customers: []
    }
  },

  methods: {
    getCustomers() {
      Database.customer
        .toArray()
        .then(customers => {
          this.customers = customers
        })
        .catch(err => console.error(err))
    }
  },

  computed: {
    columns() {
      return [
        {
          field: 'name',
          label: 'Nombre'
        },
        {
          field: 'email',
          label: 'Email'
        },
        {
          field: 'phone',
          label: 'Teléfono'
        },
        {
          field: 'credit',
          label: 'Crédito'
        },
        {
          field: 'payment',
          label: 'Abono'
        },
        {
          field: 'balance',
          label: 'Saldo'
        }
      ]
    }
  },

  mounted() {
    this.getCustomers()
  }
}
</script>

<style>
</style>