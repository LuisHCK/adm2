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
                                v-text="`${currency}${totalMoney}`"
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
                        <a
                            @click="$router.push('/sales')"
                            class="card-footer-item"
                            >Ir a ventas</a
                        >
                    </div>
                </div>
            </div>

            <div class="column is-half-mobile">
                <div class="panel">
                    <div class="card-image">
                        <figure class="image image-3">
                            <span
                                class="value has-text-white is-size-2 has-text-weight-bold"
                            >
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
                        <a
                            @click="$router.push('/providers')"
                            class="card-footer-item"
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

        <div class="columns is-mobile is-multiline">
            <div class="column is-half-desktop">
                <div class="card">
                    <header class="card-header">
                        <p class="card-header-title">
                            Últimas ventas
                        </p>
                    </header>
                    <div class="card-content">
                        <div class="content">
                            <sales-list :sales="salesList" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Customers -->
            <div class="column is-half-desktop">
                <div class="card">
                    <header class="card-header">
                        <p class="card-header-title">
                            Clientes
                        </p>
                    </header>
                    <div class="card-content">
                        <div class="content">
                            <customers-list />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Inventory status -->
            <div class="column is-half-desktop">
                <InventoryStatus />
            </div>
        </div>
    </div>
</template>

<script>
import LineChart from '@/components/charts/LineChart.vue'
import SalesList from '@/components/sales/SalesList.vue'
import CustomersList from '@/components/customers/CustomersList.vue'
import InventoryStatus from '@/components/dashboard/InventoryStatus.vue'
import { lastXdays, setHourTo, enumerateDaysBetweenDates } from '@/lib/datetime'
import { mapGetters } from 'vuex'

const TODAY = new Date()

export default {
    name: 'home',
    components: { LineChart, SalesList, CustomersList, InventoryStatus },
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
        },
        ...mapGetters(['currency'])
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
                    label: 'Ventas al contado',
                    borderColor: '#90CAF9',
                    fill: false,
                    pointRadius: 5,
                    pointBackgroundColor: '#64B5F6',
                    data: []
                },
                {
                    label: 'Ventas al crédito',
                    borderColor: '#ef9a9a',
                    fill: false,
                    pointRadius: 5,
                    pointBackgroundColor: '#e57373',
                    data: []
                }
            ]

            this.dates.reverse().map(async date => {
                // Add label
                labels.push(this.$moment(date).format('ddd D MMM'))

                // add datasets
                const sales = await Database.sale
                    .where('created_at')
                    .between(
                        date.toISOString(),
                        setHourTo(date, 'end').toISOString(),
                        true,
                        true
                    )
                    .toArray()
                // .count(count => {
                //     console.log(count)
                //     datasets[0].data.push(count)
                // })

                const cashSales = sales.filter(sale =>
                    sale ? sale.sale_type === 'cash' : false
                ).length

                const creditSales = sales.filter(sale =>
                    sale ? sale.sale_type === 'credit' : false
                ).length

                datasets[0].data.push(cashSales)
                datasets[1].data.push(creditSales)
            })

            // set graph
            this.salesGraph = {
                labels,
                datasets
            }

            // Update chart
            setTimeout(() => {
                this.$refs.lineChart.fillData()
            }, 500)
        },

        getTotalProviders() {
            Database.provider
                .count()
                .then(count => (this.totalProviders = count))
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
