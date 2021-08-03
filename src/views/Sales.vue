<template>
    <div class="page-container sales-page">
        <div class="panel">
            <div class="is-flex justify-end padding-vertical-1 filter-controls">
                <b-field>
                    <b-select
                        placeholder="Tipo de pago"
                        icon="currency-usd"
                        @input="handlePaymentTypeChange"
                        rounded
                    >
                        <option :value="undefined">Todos</option>
                        <option value="cash">Contado</option>
                        <option value="credit">Crédito</option>
                    </b-select>
                </b-field>

                <b-field>
                    <b-datepicker
                        placeholder="Filtrar por fecha"
                        position="is-bottom-left"
                        icon="calendar-today"
                        :value="dateRange"
                        :mobile-native="false"
                        :month-names="months"
                        :day-names="daysAbr"
                        @input="handleDateChange"
                        ref="dateRangePicker"
                        range
                        rounded
                    />
                </b-field>

                <b-field>
                    <b-input
                        placeholder="Numero de venta, cliente"
                        icon="pound"
                        @input="handleSearchInput"
                        :value="searchValue"
                        rounded
                    />
                </b-field>

                <p
                    class="clear-button"
                    v-show="dateRange || paymentTypeFilter || searchValue"
                >
                    <b-button
                        type="is-danger"
                        icon-left="close"
                        @click="clearFilters()"
                        :expanded="isMobile"
                        rounded
                    >
                        <span v-if="isMobile">
                            Limpiar filtros
                        </span>
                    </b-button>
                </p>
            </div>

            <!-- sales list -->
            <b-table
                id="salesTable"
                :paginated="true"
                :pagination-simple="true"
                :per-page="perPage"
                :data="sales"
                :striped="true"
                :hoverable="true"
                :loading="loading"
            >
                <template>
                    <b-table-column
                        v-slot="props"
                        field="id"
                        label="ID"
                        width="40"
                    >
                        {{ invoiceFormatId(props.row.id) }}
                    </b-table-column>

                    <b-table-column
                        v-slot="props"
                        field="customer"
                        label="Cliente"
                    >
                        <strong>{{ props.row.customer.name || '--' }}</strong>
                    </b-table-column>

                    <b-table-column
                        v-slot="props"
                        field="items"
                        label="Productos"
                    >
                        {{ props.row.shoppingCart.length }}
                    </b-table-column>

                    <b-table-column
                        v-slot="props"
                        field="sub_total"
                        label="Sub Total"
                    >
                        <b-tag
                            class="has-text-weight-bold"
                            type="is-info"
                            rounded
                        >
                            {{ props.row.subTotal | money }}
                        </b-tag>
                    </b-table-column>

                    <b-table-column
                        v-slot="props"
                        field="sale_type"
                        label="Pago"
                    >
                        <b-tag
                            v-text="getSaleType(props.row.sale_type).text"
                            :type="getSaleType(props.row.sale_type).color"
                            class="has-text-weight-bold"
                            rounded
                        />
                    </b-table-column>

                    <b-table-column v-slot="props" field="total" label="TOTAL">
                        <b-tag
                            type="is-success"
                            class="has-text-weight-bold"
                            rounded
                        >{{props.row.total | money}}</b-tag>
                    </b-table-column>

                    <b-table-column
                        v-slot="props"
                        field="date_time"
                        label="Fecha de venta"
                    >
                        {{
                            props.row.created_at | moment('MMM DD YYYY, h:mm a')
                        }}
                    </b-table-column>

                    <b-table-column v-slot="props" label="Devolución">
                        <b-tag
                            v-if="!props.row.refund_type"
                            class="has-text-weight-bold"
                            type="is-light"
                            rounded
                        >
                            Ninguna
                        </b-tag>

                        <b-tag
                            v-else-if="props.row.refund_type === 'total'"
                            class="has-text-weight-bold"
                            type="is-danger"
                            rounded
                        >
                            Completa
                        </b-tag>

                        <b-tag
                            v-else-if="props.row.refund_type === 'partial'"
                            class="has-text-weight-bold"
                            type="is-warning"
                            rounded
                        >
                            Parcial
                        </b-tag>
                    </b-table-column>

                    <b-table-column
                        v-slot="props"
                        field="actions"
                        label="Actions"
                    >
                        <b-field>
                            <p class="control">
                                <b-tooltip
                                    label="Ver detalles"
                                    type="is-dark"
                                    :delay="100"
                                >
                                    <b-button
                                        @click="selectSale(props.row)"
                                        type="is-primary"
                                        icon-right="eye"
                                        size="is-small"
                                        rounded
                                    />
                                </b-tooltip>
                            </p>
                            <p class="control">
                                <b-tooltip
                                    label="Imprimir factura"
                                    type="is-dark"
                                    :delay="100"
                                >
                                    <b-button
                                        @click="openPrintInvoice(props.row)"
                                        type="is-info"
                                        icon-right="printer"
                                        size="is-small"
                                        rounded
                                    />
                                </b-tooltip>
                            </p>
                            <p class="control">
                                <b-tooltip
                                    label="Realizar reembolso o devolución"
                                    type="is-dark"
                                    position="is-left"
                                    :delay="100"
                                >
                                    <b-button
                                        type="is-danger"
                                        icon-right="cash-refund"
                                        size="is-small"
                                        @click="confirmRefund(props.row)"
                                        rounded
                                    />
                                </b-tooltip>
                            </p>
                        </b-field>
                    </b-table-column>
                </template>

                <template slot="footer">
                    <th colspan="6" class="has-text-right">
                        <b>TOTAL</b>
                    </th>

                    <th colspan="3">
                        {{ salesTotal | money }}
                    </th>
                </template>

                <template slot="empty">
                    <section class="section">
                        <div class="content has-text-grey has-text-centered">
                            <p>
                                <b-icon
                                    icon="package-variant"
                                    size="is-large"
                                />
                            </p>
                            <p>No hay ventas registradas.</p>
                        </div>
                    </section>
                </template>
            </b-table>
        </div>

        <b-modal :active.sync="showSaleDetails" has-modal-card>
            <div class="modal-card" style="width: auto">
                <header class="modal-card-head">
                    <span
                        class="modal-card-title"
                        v-if="selectedSale && showSaleDetails"
                        v-text="`Venta #${selectedSale.id}`"
                    />
                    <button
                        type="button"
                        class="delete"
                        @click="showSaleDetails = false"
                    />
                </header>
                <section class="modal-card-body">
                    <sale-details :sale="selectedSale"/>
                </section>
            </div>
        </b-modal>

        <!-- Refund confirm modal -->
        <refund-modal
            v-model="refundModalIsOpen"
            :sale="selectedSale"
            @close="selectedSale = undefined"
            @success="getSales"
        />
    </div>
</template>

<script>
import SaleDetails from '@/components/sales/SaleDetails.vue'
import Invoice from '@/components/sales/Invoice.vue'
import { printContentent, receiptPrint } from '@/lib/print'
import { salesReport } from '@/reports/sales-report'
import { printInvoice, invoiceFormatId } from '../reports/invoice'
import RefundModal from '../components/sales/RefundModal.vue'
import { months, daysAbr } from '@/lib/locale'
import { mapGetters } from 'vuex'

export default {
    name: 'sales-page',

    components: {
        SaleDetails,
        Invoice,
        RefundModal
    },

    data() {
        return {
            sales: [],
            perPage: 50,
            loading: false,
            showInvoiceModal: false,
            showSaleDetails: false,
            selectedSale: undefined,
            dateRange: undefined,
            paymentTypeFilter: undefined,
            refundModalIsOpen: false,
            searchValue: undefined,
            searchDebounce: undefined,
            isMobile: false
        }
    },

    computed: {
        salesTotal() {
            return this.sales.reduce((a, b) => a + b.total, 0)
        },
        ...mapGetters(['currency']),

        months: () => months,
        daysAbr: () => daysAbr
    },

    methods: {
        getSales() {
            this.loading = true
            let query = Database.sale

            // FILTER BY PAYMENT TYPE
            if (this.paymentTypeFilter) {
                query = Database.sale.where({
                    sale_type: this.paymentTypeFilter
                })
            }

            // FILTER BY DATE RANGE
            if (this.dateRange) {
                // Parse filters
                const startDate = this.$moment(this.dateRange[0])
                const finishDate = this.$moment(this.dateRange[1])

                // Set time threshold
                startDate.set({ hour: 0, minute: 0, second: 0, milisecond: 0 })
                finishDate.set({
                    hour: 23,
                    minute: 59,
                    second: 59,
                    milisecond: 999
                })

                // Update query
                query = query.filter(item => {
                    let paymentDate = this.$moment(item.created_at)
                    // check if between
                    return paymentDate.isBetween(startDate, finishDate)
                })
            }

            // Filter by sale id or customer name
            if (this.searchValue) {
                query = query.filter(item => {
                    const searchValueString = String(
                        this.searchValue
                    ).toLowerCase()
                    const searchValueNumber = parseInt(this.searchValue)

                    const idMatch = !isNaN(searchValueNumber)
                        ? item.id === parseInt(this.searchValue)
                        : false

                    const customerMatch = item.customer
                        ? String(item.customer.name)
                              .toLowerCase()
                              .includes(searchValueString)
                        : false

                    return idMatch || customerMatch
                })
            }

            query
                .reverse()
                .toArray()
                .then(sales => {
                    this.sales = sales
                    this.loading = false
                    // Load sale if params is set
                    this.showDetailsByParam()
                })
        },

        selectSale(sale) {
            this.selectedSale = sale
            this.showSaleDetails = true
        },

        openPrintInvoice(sale) {
            // const report = printInvoice(sale)
            // printContentent(report, `Factura #${sale.id}`, '')
            receiptPrint(sale)
        },

        /** Optinally load a sale */
        showDetailsByParam() {
            const saleId = this.$route.query.saleId
            if (saleId) {
                // Find the sale by id
                this.selectedSale = this.sales.find(sale => {
                    return sale.id == saleId
                })
                // open the modal
                this.showSaleDetails = true
            }
        },

        handleDateChange(value) {
            this.dateRange = value
            this.getSales()
            this.$refs.dateRangePicker.toggle()
        },

        handlePaymentTypeChange(value) {
            this.paymentTypeFilter = value
            this.getSales()
        },

        getSaleType(item) {
            let type = {
                color: '',
                text: ''
            }

            switch (item) {
                case 'cash':
                    type.color = 'is-success'
                    type.text = 'Contado'
                    break
                case 'credit':
                    type.color = 'is-warning'
                    type.text = 'Crédito'
                    break
            }

            return type
        },

        clearFilters() {
            this.paymentTypeFilter = undefined
            this.dateRange = undefined
            this.searchValue = undefined

            this.getSales()
        },

        printReport() {
            const tableCss = `
              table {
                width: 100%;
              }
              .sales-table {
                border-collapse: collapse;
                text-align: left;
              }
              table.sales-table th, table.sales-table td {
                border: 1px solid black;
                padding: 3px 6px;
              }`

            let report = salesReport(
                this.sales,
                'Reporte de Ventas',
                this.dateRange
            )
            printContentent(report, 'Reporte de Ventas', tableCss)
        },

        setActionButtons() {
            const printReport = {
                type: 'is-primary',
                icon: 'printer',
                label: 'Imprimir Reporte',
                action: () => {
                    this.printReport()
                }
            }

            const goToPOS = {
                type: 'is-success',
                icon: 'plus',
                label: 'Nueva Venta',
                action: () => {
                    this.$router.push('/pos')
                }
            }
            this.$store.commit('SET_ACTION_BUTTONS', [printReport, goToPOS])
        },

        confirmRefund(sale) {
            this.selectedSale = sale
            this.refundModalIsOpen = true
        },

        handleSearchInput(value) {
            clearTimeout(this.searchDebounce)
            this.searchValue = value

            this.searchDebounce = setTimeout(() => {
                this.getSales()
            }, 300)
        },

        checkIsMobile() {
            this.isMobile = window.innerWidth < 768
        },

        // Wireup
        invoiceFormatId
    },

    mounted() {
        this.getSales()
        this.setActionButtons()
        this.checkIsMobile()

        window.addEventListener('resize', this.checkIsMobile)
    },

    beforeUnmount() {
        window.removeEventListener('resize', this.checkIsMobile)
    }
}
</script>

<style lang="scss" scoped>
@import '~bulma/sass/utilities/_all';

@include mobile {
    .sales-page {
        margin-bottom: 6rem;
    }
}

.filter-controls {
    .field:not(:last-child) {
        margin-right: 8px;
    }

    @include mobile {
        flex-direction: column;

        .field {
            margin-right: 0;
        }

        .clear-button {
            position: fixed;
            bottom: 0;
            left: 0;
            padding: 16px;
            z-index: 39;
            background-color: white;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 1px -1px 12px 1px rgba(0, 0, 0, 0.322);
        }
    }
}
</style>
