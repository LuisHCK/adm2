<template>
    <div class="page-container">
        <div class="panel">
            <b-table :data="customers">
                <template slot="empty">
                    <section class="section">
                        <div class="content has-text-grey has-text-centered">
                            <p>
                                <b-icon
                                    icon="account-group"
                                    size="is-large"
                                ></b-icon>
                            </p>
                            <p>No hay clientes registrados.</p>
                        </div>
                    </section>
                </template>

                <template>
                    <b-table-column v-slot="props" label="Nombre" field="name">
                        {{ props.row.name }}
                    </b-table-column>

                    <b-table-column v-slot="props" label="Email" field="email">
                        {{ props.row.email }}
                    </b-table-column>

                    <b-table-column
                        v-slot="props"
                        label="Teléfono"
                        field="phone"
                    >
                        {{ props.row.phone }}
                    </b-table-column>

                    <b-table-column
                        v-slot="props"
                        label="Direccion"
                        field="address"
                    >
                        {{ props.row.address }}
                    </b-table-column>

                    <b-table-column
                        v-slot="props"
                        field="total_payment"
                        :numeric="true"
                        label="Abono"
                    >
                        <b-tag
                            class="has-text-weight-bold"
                            type="is-primary"
                            rounded
                        >
                            {{ currency }}{{ props.row.total_payment }}
                        </b-tag>
                    </b-table-column>

                    <b-table-column
                        v-slot="props"
                        label="Saldo Actual"
                        field="balance"
                        :numeric="true"
                    >
                        <b-tag
                            rounded
                            :type="
                                props.row.total_credit > props.row.total_payment
                                    ? 'is-danger'
                                    : 'is-success'
                            "
                            class="has-text-weight-bold"
                        >
                            {{ currency
                            }}{{
                                props.row.total_credit - props.row.total_payment
                            }}
                        </b-tag>
                    </b-table-column>

                    <b-table-column
                        v-slot="props"
                        label="Opciones"
                        field="options"
                        width="100"
                        :numeric="true"
                    >
                        <b-button
                            type="is-primary"
                            size="is-small"
                            rounded
                            icon-right="eye-outline"
                            @click="$router.push('/customers/' + props.row.id)"
                        >
                        </b-button>
                    </b-table-column>
                </template>
            </b-table>
        </div>

        <!-- Customer form modal -->
        <b-modal
            :active.sync="showCustomerForm"
            has-modal-card
            trap-focus
            aria-role="dialog"
            aria-modal
        >
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Regisrtar un nuevo cliente</p>
                </header>
                <section class="modal-card-body">
                    <customer-form
                        v-if="showCustomerForm"
                        @input="submitCustomer()"
                    ></customer-form>
                </section>
            </div>
        </b-modal>
    </div>
</template>

<script>
import CustomerForm from '@/components/customers/CustomerForm.vue'
import { customersReport } from '@/reports/customers-report'
import { mapGetters } from 'vuex'

export default {
    components: {
        CustomerForm
    },

    computed: {
        ...mapGetters(['currency'])
    },

    data() {
        return {
            customers: [],
            showCustomerForm: false,
            columns: [
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
                    field: 'total_credit',
                    label: 'Crédito total',
                    numeric: true
                },
                {
                    field: 'total_payment',
                    label: 'Abono',
                    numeric: true
                },
                {
                    field: 'balance',
                    label: 'Saldo',
                    numeric: true
                },
                {
                    field: 'options',
                    label: 'Options',
                    sortable: false
                }
            ]
        }
    },

    methods: {
        getCustomers() {
            Database.customer
                .toArray()
                .then(customers => {
                    // Get customer current staus
                    customers.map(c => {
                        this.getCustomerCredit(c)
                        this.getCustomerPayments(c)
                    })

                    // Display data
                    this.customers = customers
                })
                .catch(err => console.error(err))
        },

        submitCustomer() {
            this.getCustomers()
            this.showCustomerForm = false
        },

        getCustomerCredit(customer) {
            // Set initial data
            if (!customer.total_credit) {
                customer.total_credit = 0
            }

            Database.sale
                .where({ customer_id: customer.id, sale_type: 'credit' })
                .toArray(data => {
                    // Sum total of records
                    let total = data.reduce((prev, cur) => {
                        return prev + cur.total
                    }, 0)
                    // Sum total
                    customer.total_credit += total
                })
        },

        getCustomerPayments(customer) {
            if (!customer.total_payment) {
                customer.total_payment = 0
            }

            Database.customer_payment
                .where({ customer_id: customer.id })
                .toArray(data => {
                    // Sum total of records
                    let total = data.reduce((prev, cur) => {
                        return prev + Number(cur.amount)
                    }, 0)
                    // Sum total
                    customer.total_payment += total
                })
        },

        printCustomersReport() {
            customersReport(this.customers)
        },

        setActionButtons() {
            const printReport = {
                type: 'is-primary',
                icon: 'printer',
                label: 'Imprimir Reporte',
                action: () => {
                    this.printCustomersReport()
                }
            }

            const addCustomer = {
                type: 'is-success',
                icon: 'plus',
                label: 'Nuevo Cliente',
                action: () => {
                    this.showCustomerForm = true
                }
            }

            this.$store.commit('SET_ACTION_BUTTONS', [printReport, addCustomer])
        }
    },

    mounted() {
        this.getCustomers()
        this.setActionButtons()
    }
}
</script>

<style></style>
