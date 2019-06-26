<template>
  <div class="home">
    <div class="columns">
      <div class="column">
        <!-- card 1 -->
        <div class="card">
          <div class="card-image">
            <figure class="image image-1">
              <span class="value has-text-white is-size-2 has-text-weight-bold">C$ 150,000</span>
            </figure>
          </div>
          <div class="card-content">
            <div class="content has-text-centered">
              <div class="is-size-4">Dinero en caja</div>
            </div>
          </div>
          <footer class="card-footer">
            <a class="card-footer-item">Ir a caja</a>
          </footer>
        </div>
      </div>

      <div class="column">
        <div class="card">
          <div class="card-image">
            <figure class="image image-2">
              <span class="value has-text-white is-size-2 has-text-weight-bold">{{ totalSales }}</span>
            </figure>
          </div>
          <div class="card-content">
            <div class="content has-text-centered">
              <div class="is-size-4">Ventas del día</div>
            </div>
          </div>
          <div class="card-footer">
            <a @click="$router.push('/sales')" class="card-footer-item">Ir a ventas</a>
          </div>
        </div>
      </div>

      <div class="column">
        <div class="card">
          <div class="card-image">
            <figure class="image image-3">
              <span class="value has-text-white is-size-2 has-text-weight-bold">12</span>
            </figure>
          </div>
          <div class="card-content">
            <div class="content has-text-centered">
              <div class="is-size-4">Servicios realizados</div>
            </div>
          </div>
          <div class="card-footer">
            <a class="card-footer-item">Ir a servicios</a>
          </div>
        </div>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <line-chart/>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <div class="panel">
          <div class="is-size-5">Últimas ventas</div>
          <sales-list/>
        </div>
      </div>
      <!-- Customers -->
      <div class="column">
        <div class="panel">
          <div class="is-size-5">Clientes</div>
          <customers-list/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LineChart from '@/components/charts/LineChart.vue'
import SalesList from '@/components/sales/SalesList.vue'
import CustomersList from '@/components/customers/CustomersList.vue'

export default {
  name: 'home',
  components: { LineChart, SalesList, CustomersList },
  data() {
    return {
      totalSales: 0
    }
  },

  methods: {
    getSales() {
      Database.sale.count().then(val => (this.totalSales = val))
    }
  },

  mounted() {
    this.getSales()
  }
}
</script>

<style lang="scss" scoped>
.image {
  background-size: cover;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;

  &.image-1 {
    background-image: url('/10.jpg');
  }
  &.image-2 {
    background-image: url('/11.jpg');
  }
  &.image-3 {
    background-image: url('/12.jpg');
  }
}
</style>
