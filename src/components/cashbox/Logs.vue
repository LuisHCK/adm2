<template>
    <card>
        <template slot="title">
            <div class="is-flex is-justify-content-space-between w-100 actions">
                <p class="card-header-title">
                    Movimientos de caja
                </p>

                <div class="is-flex is-justify-content-flex-end p-4">
                    <log-filters
                        @onDateChange="getLogsByDate"
                        @onSearchChange="searchLogs"
                        @onCleanFilter="getLogs"
                    />
                </div>
            </div>
        </template>

        <b-table
            :data="logs"
            :loading="loading"
            :paginated="true"
            :pagination-simple="true"
            :per-page="50"
            :striped="true"
            :hoverable="true"
            sticky-header
            height="calc(100vh - 30rem)"
        >
            <template>
                <b-table-column label="#" v-slot="props">
                    {{ props.row.id }}
                </b-table-column>

                <b-table-column label="Cantidad" v-slot="props">
                    <b-tag type="is-info" class="has-text-weight-bold" rounded>
                        {{ props.row.amount | money }}
                    </b-tag>
                </b-table-column>

                <b-table-column label="Tipo" v-slot="props">
                    <b-tag
                        class="has-text-weight-bold"
                        v-text="getLogType(props.row.type).label"
                        :type="getLogType(props.row.type).className"
                        rounded
                    />
                </b-table-column>

                <b-table-column label="Concepto" v-slot="props">
                    {{ props.row.concept }}
                </b-table-column>

                <b-table-column label="Referencia" v-slot="props">
                    {{ props.row.reference }}
                </b-table-column>

                <b-table-column label="Creado por" v-slot="props">
                    {{ props.row.created_by.name }}
                </b-table-column>

                <b-table-column label="Fecha" v-slot="props">
                    {{ props.row.date | moment('MMM DD YYYY, h:mm a') }}
                </b-table-column>
            </template>

            <template slot="empty">
                <section class="section">
                    <div class="content has-text-grey has-text-centered">
                        <p>
                            <b-icon icon="package-variant" size="is-large" />
                        </p>
                        <p>No hay registros para mostrar</p>
                    </div>
                </section>
            </template>
        </b-table>
    </card>
</template>

<script>
import {
    getCashBoxLogs,
    getLogType,
    printChashboxReport,
    searchCashBoxLog
} from '../../controllers/cashbox'
import eventBus from '../../event-bus'
import { PRINT_CASH_BOX_REPORT } from '../../event-bus/events'
import Card from '../ui/Card.vue'
import LogFilters from './LogFilters.vue'

export default {
    components: { Card, LogFilters },

    name: 'logs',

    computed: {
        getLogType: () => getLogType
    },

    data() {
        return {
            loading: true,
            logs: [],
            currentFilter: undefined
        }
    },

    methods: {
        async getLogs() {
            this.logs = await getCashBoxLogs()
            this.loading = false
            // Clear current filter
            this.currentFilter = undefined
        },

        /**
         * @param {Date[]} dates
         */
        async getLogsByDate([start_date, finish_date]) {
            // Set the finish date to the end of the day
            finish_date.setHours(24, 59, 59)

            if (start_date && finish_date) {
                this.logs = await getCashBoxLogs({
                    start_date: start_date.toISOString(),
                    finish_date: finish_date.toISOString()
                })

                this.loading = false

                // Set current filter
                this.currentFilter = [
                    this.$moment(start_date).format('D/MM/YY, h:mm a'),
                    this.$moment(finish_date).format('D/MM/YY, h:mm a')
                ]
            }
        },

        /**
         * @param {string} search value
         */
        async searchLogs(searchValue) {
            if (searchValue) {
                this.logs = await searchCashBoxLog(searchValue)

                // Set current filter
                this.currentFilter = [searchValue]
            } else {
                this.getLogs()
            }
        },

        printReport() {
            const notes =
                this.currentFilter && this.currentFilter.length
                    ? `Filtrado por: ${this.currentFilter.join(' - ')}`
                    : ''

            printChashboxReport(
                // Deep clone the array
                this.logs.map(log => {
                    return { ...log }
                }),
                notes
            )
        }
    },

    mounted() {
        this.getLogs()

        eventBus.$on(PRINT_CASH_BOX_REPORT, () => this.printReport())
    }
}
</script>

<style lang="scss" scoped>
@import '~bulma/sass/utilities/_all';
@include mobile {
    .actions {
        flex-direction: column;
    }
}
</style>
