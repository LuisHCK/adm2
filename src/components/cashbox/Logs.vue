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
            height="75vh"
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
                        v-text="typeTypeOptions(props.row.type).label"
                        :type="typeTypeOptions(props.row.type).className"
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
import { getCashBoxLogs, searchCashBoxLog } from '../../controllers/cashbox'
import Card from '../ui/Card.vue'
import LogFilters from './LogFilters.vue'
export default {
    components: { Card, LogFilters },

    name: 'logs',

    data() {
        return {
            loading: true,
            logs: []
        }
    },

    methods: {
        /**
         * @param {('add'|'subtract'|'close','balance')} type
         */
        typeTypeOptions(type) {
            switch (type) {
                case 'add':
                    return {
                        label: 'Ingreso',
                        className: 'is-success'
                    }

                case 'subtract':
                    return {
                        label: 'Egreso',
                        className: 'is-warning'
                    }

                case 'close':
                    return {
                        label: 'Cierre',
                        className: 'is-danger'
                    }

                case 'balance':
                    return {
                        label: 'Saldo',
                        className: 'is-info'
                    }

                default:
                    return {
                        label: 'Tipo inválido',
                        className: 'is-dark'
                    }
            }
        },

        async getLogs() {
            this.logs = await getCashBoxLogs()
            this.loading = false
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
            }
        },

        /**
         * @param {string} search value
         */
        async searchLogs(searchValue) {
            if (searchValue) {
                this.logs = await searchCashBoxLog(searchValue)
            } else {
                this.getLogs()
            }
        }
    },

    mounted() {
        this.getLogs()
    }
}
</script>

<style lang="scss" scoped>
@import "~bulma/sass/utilities/_all";
@include mobile {
    .actions {
        flex-direction: column;
    }
}
</style>
