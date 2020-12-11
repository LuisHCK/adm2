<template>
    <div class="page-container">
        <div class="columns is-mobile is-multiline">
            <div class="column is-one-third-desktop is-full-mobile">
                <accounts :accounts="accounts" :total="totalAccounts" />
            </div>
            <div class="column">
                <transactions />
            </div>
        </div>

        <transaction-form :is-open="showForm" @close="showForm = false" />
    </div>
</template>

<script>
import * as moment from 'moment'
import Accounts from '../components/cashbox/Accounts.vue'
import Transactions from '../components/cashbox/Transactions.vue'
import TransactionForm from '../components/cashbox/TransactionForm.vue'

export default {
    name: 'cashbox',

    components: {
        Accounts,
        Transactions,
        TransactionForm
    },

    data() {
        return {
            sales: [],
            withdrawals: [],
            accounts: [],
            showForm: false
        }
    },

    computed: {
        totalAccounts() {
            return this.accounts.reduce((prev, next) => prev + next.value, 0)
        },

        withdrawalBreak() {
            return this.withdrawals[0]
                ? this.withdrawals[0].date
                : '1970-01-01T00:00:00.000Z'
        }
    },

    methods: {
        getTotalClass(value) {
            return value <= 0 ? 'has-text-danger' : 'has-text-success'
        },

        async getWithdrawals() {
            this.withdrawals = await Database.withdrawal
                .orderBy('date')
                .toArray()

            this.getSales()
        },

        async getSales() {
            this.sales = await Database.sale
                .where('created_at')
                .aboveOrEqual(this.withdrawalBreak)
                .toArray()

            this.getCashAccount()
            this.getCreditAccount()
            this.getCustomerPayments()
        },

        getCashAccount() {
            const total = this.sales
                .filter(s => s.sale_type === 'cash')
                .reduce((prev, next) => prev + next.total, 0)

            this.accounts.push({
                name: 'Ventas de Contado',
                value: total
            })
        },

        async getCreditAccount() {
            const total = this.sales
                .filter(s => s.sale_type === 'credit')
                .reduce((prev, next) => prev + next.total, 0)

            const payments = await Database.customer_payment
                .where('created_at')
                .aboveOrEqual(this.withdrawalBreak)
                .toArray()

            const totalPayments =
                payments.reduce(
                    (prev, next) => prev + Number(next.amount),
                    0
                ) || 0

            this.accounts.push({
                name: 'Ventas al Crédito',
                value: total - totalPayments
            })
        },

        async getCustomerPayments() {
            const payments = await Database.customer_payment
                .where('created_at')
                .aboveOrEqual(this.withdrawalBreak)
                .toArray()

            const total = payments.reduce(
                (prev, next) => prev + Number(next.amount),
                0
            )

            this.accounts.push({
                name: 'Abonos de clientes',
                value: total
            })
        },

        setActionButtons() {
            const printReport = {
                type: 'is-primary',
                icon: 'printer',
                label: 'Imprimir Reporte',
                action: () => {}
            }

            const AddTransaction = {
                type: 'is-success',
                icon: 'plus',
                label: 'Nueva Transacción',
                action: () => {
                    this.showForm = true
                }
            }
            this.$store.commit('SET_ACTION_BUTTONS', [
                AddTransaction,
                printReport
            ])
        }
    },

    beforeMount() {
        this.setActionButtons()
    },

    mounted() {
        this.getWithdrawals()
    }
}
</script>

<style lang="scss" scoped></style>
