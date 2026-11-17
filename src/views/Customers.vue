<template>
    <div class="page-container">
        <div class="panel">
            <b-table :data="customers">
                <template #empty>
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
                                props.row.balance > 0
                                    ? 'is-danger'
                                    : 'is-success'
                            "
                            class="has-text-weight-bold"
                        >
                            {{ currency }}{{ props.row.balance }}
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
                                aria-label="Ver cliente"
                                @click="$router.push('/customers/' + props.row.id)"
                            >
                            </b-button>
                    </b-table-column>
                </template>
            </b-table>
        </div>

        <!-- Customer form modal -->
        <b-modal
            v-model="showCustomerForm"
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
import database from "@/db"
import CustomerForm from '@/components/customers/CustomerForm.vue'
import { customersReport } from '@/reports/customers-report'
import { mapGetters } from '@/store/vuex-compat'

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
        async getCustomers() {
            try {
                const customers = await database.customer.toArray()

                await Promise.all(
                    customers.map(async customer => {
                        customer.total_credit =
                            await this.getCustomerCredit(customer)
                        customer.total_payment =
                            await this.getCustomerPayments(customer)
                        customer.balance = Math.max(
                            0,
                            customer.total_credit - customer.total_payment,
                        )
                    }),
                )

                this.customers = customers
            } catch (err) {
                console.error(err)
            }
        },

        submitCustomer() {
            this.getCustomers()
            this.showCustomerForm = false
        },

        async getCustomerCredit(customer) {
            const sales = await database.sale
                .where({ customer_id: customer.id, sale_type: 'credit' })
                .toArray()

            return sales.reduce(
                (total, sale) => total + Number(sale.total || 0),
                0,
            )
        },

        async getCustomerPayments(customer) {
            const payments = await database.customer_payment
                .where({ customer_id: customer.id })
                .toArray()

            return payments.reduce(
                (total, payment) => total + Number(payment.amount || 0),
                0,
            )
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

            this.$store.commit('SET_ACTION_BUTTONS', [addCustomer, printReport])
        }
    },

    mounted() {
        this.getCustomers()
        this.setActionButtons()
    }
}
</script>

<style></style>
