<template>
  <div class="home page-container">
    <div class="columns is-mobile is-multiline">
      <div class="column is-half-mobile">
        <!-- card 1 -->
        <div class="panel">
          <div class="card-image">
            <figure class="image image-1">
              <span
                class="value has-text-white is-size-2 has-text-weight-bold"
                v-text="`C$${totalMoney}`"
              ></span>
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

      <div class="column is-half-mobile">
        <div class="panel">
          <div class="card-image">
            <figure class="image image-2">
              <span
                class="value has-text-white is-size-2 has-text-weight-bold"
                >{{ totalSales }}</span
              >
            </figure>
          </div>
          <div class="card-content">
            <div class="content has-text-centered">
              <div class="is-size-4">Ventas del día</div>
            </div>
          </div>
          <div class="card-footer">
            <a @click="$router.push('/sales')" class="card-footer-item"
              >Ir a ventas</a
            >
          </div>
        </div>
      </div>

      <div class="column is-half-mobile">
        <div class="panel">
          <div class="card-image">
            <figure class="image image-3">
              <span class="value has-text-white is-size-2 has-text-weight-bold">
                {{ totalProviders }}
              </span>
            </figure>
          </div>
          <div class="card-content">
            <div class="content has-text-centered">
              <div class="is-size-4">Proveedores</div>
            </div>
          </div>
          <div class="card-footer">
            <a @click="$router.push('/providers')" class="card-footer-item"
              >Ver Proveedores</a
            >
          </div>
        </div>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <line-chart
          ref="lineChart"
          :labels="salesGraph.labels"
          :datasets="salesGraph.datasets"
          @onDateChange="onDateChange($event)"
        />
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <div class="panel">
          <div class="is-size-5">Últimas ventas</div>
          <sales-list :sales="salesList" />
        </div>
      </div>
      <!-- Customers -->
      <div class="column">
        <div class="panel">
          <div class="is-size-5">Clientes</div>
          <customers-list />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LineChart from '@/components/charts/LineChart.vue'
import SalesList from '@/components/sales/SalesList.vue'
import CustomersList from '@/components/customers/CustomersList.vue'
import { lastXdays, setHourTo, enumerateDaysBetweenDates } from '@/lib/datetime'

const TODAY = new Date()

export default {
  name: 'home',
  components: { LineChart, SalesList, CustomersList },
  data() {
    return {
      totalSales: 0,
      totalMoney: 0,
      totalProviders: 0,
      salesList: [],
      salesGraph: {},
      dateRange: [],
      dates: lastXdays(7)
    }
  },

  computed: {
    today() {
      return {
        start: new Date(TODAY.setHours(0, 0, 0, 0)).toISOString(),
        end: new Date(TODAY.setHours(23, 59, 59, 0)).toISOString()
      }
    }
  },

  methods: {
    getSales() {
      const sales = Database.sale

      // Set date filters
      const start_date = this.$moment()
        .startOf('day')
        .toISOString()
      const finish_date = this.$moment()
        .endOf('day')
        .toISOString()

      // Count total sales
      sales
        .where('created_at')
        .between(start_date, finish_date, true, true)
        .count()
        .then(val => (this.totalSales = val))

      // Count amount of money
      sales.where({ sale_type: 'cash' }).each(sale => {
        this.totalMoney += sale.total
      })

      // latest 5 sales
      sales
        .limit(5)
        .reverse()
        .toArray()
        .then(data => (this.salesList = data))
    },

    getSalesGraph() {
      let labels = []
      let datasets = [
        {
          label: 'Ventas',
          backgroundColor: '#039BE5',
          data: []
        }
      ]

      this.dates.reverse().map(date => {
        // Add label
        labels.push(this.$moment(date).format('ddd D MMM'))

        // add datasets
        Database.sale
          .where('created_at')
          .between(
            date.toISOString(),
            setHourTo(date, 'end').toISOString(),
            true,
            true
          )
          .count(count => {
            datasets[0].data.push(count)
          })
      })

      // set graph
      this.salesGraph = {
        labels,
        datasets
      }
    },

    getTotalProviders() {
      Database.provider.count().then(count => (this.totalProviders = count))
    },

    onDateChange(dateRange) {
      this.dates = enumerateDaysBetweenDates(dateRange[0], dateRange[1])
      this.getSalesGraph()
    }
  },

  mounted() {
    this.getSales()
    this.getSalesGraph()
    this.getTotalProviders()
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
