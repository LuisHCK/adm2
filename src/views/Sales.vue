<template>
    <div id="sales-page" class="page-container">
        <div class="panel">
            <div class="is-flex justify-end padding-vertical-1">
                <b-field grouped>
                    <b-field>
                        <b-select
                            placeholder="Tipo de pago"
                            icon="currency-usd"
                            v-model="paymentTypeFilter"
                        >
                            <option :value="undefined">Todos</option>
                            <option value="cash">Contado</option>
                            <option value="credit">Crédito</option>
                        </b-select>
                    </b-field>

                    <b-field>
                        <b-datepicker
                            placeholder="Filtrar por fecha"
                            range
                            position="is-bottom-left"
                            v-model="dateRange"
                            icon="calendar-today"
                        >
                        </b-datepicker>
                    </b-field>

                    <p class="control">
                        <b-button
                            type="is-primary"
                            outlined
                            icon-left="magnify"
                            @click="getSales()"
                        ></b-button>
                    </p>

                    <p class="control">
                        <b-button
                            v-if="dateRange || paymentTypeFilter"
                            type="is-danger"
                            outlined
                            icon-left="close"
                            @click="clearFilters()"
                        ></b-button>
                    </p>
                </b-field>
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
                        numeric
                        >{{ props.row.id }}</b-table-column
                    >

                    <b-table-column
                        v-slot="props"
                        field="customer"
                        label="Cliente"
                    >
                        <strong>{{ props.row.customer.name }}</strong>
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
                            v-text="'C$ ' + props.row.subTotal"
                            class="has-text-weight-bold"
                            type="is-info"
                            rounded
                        />
                    </b-table-column>

                    <b-table-column
                        v-slot="props"
                        field="discount"
                        label="Descuento"
                    >
                        <b-tag
                            v-text="'C$ ' + props.row.discounted"
                            class="has-text-weight-bold"
                            rounded
                        />
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
                            v-text="'C$ ' + props.row.total"
                            class="has-text-weight-bold"
                            rounded
                        />
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

                    <th colspan="3">C${{ salesTotal }}</th>
                </template>

                <template slot="empty">
                    <section class="section">
                        <div class="content has-text-grey has-text-centered">
                            <p>
                                <b-icon
                                    icon="package-variant"
                                    size="is-large"
                                ></b-icon>
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
                    ></span>
                    <button
                        type="button"
                        class="delete"
                        @click="showSaleDetails = false"
                    />
                </header>
                <section class="modal-card-body">
                    <sale-details :sale="selectedSale"></sale-details>
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
import { printContentent } from '@/lib/print'
import { salesReport } from '@/reports/sales-report'
import { printInvoice } from '@/reports/invoice'
import RefundModal from '../components/sales/RefundModal.vue'

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
            refundModalIsOpen: false
        }
    },

    computed: {
        salesTotal() {
            return this.sales.reduce((a, b) => a + b.total, 0)
        }
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

                // Update query
                query = query.filter(item => {
                    let paymentDate = this.$moment(item.created_at)
                    // check if between
                    return paymentDate.isBetween(startDate, finishDate)
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
            const report = printInvoice(sale)
            printContentent(report, `Factura #${sale.id}`, '')
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
        }
    },

    mounted() {
        this.getSales()
        this.setActionButtons()
    }
}
</script>

<style lang="scss" scoped></style>
