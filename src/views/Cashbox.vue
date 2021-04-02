<template>
    <div class="page-container">
        <div class="columns is-mobile is-multiline">
            <div
                class="column is-one-quarter-desktop is-half-tablet is-full-mobile"
            >
                <accounts />
            </div>
            <div class="column is-full">
                <logs />
            </div>
        </div>
        <transaction-form
            :isOpen="transactionFormIsOpen"
            @close="toggleTransactionForm"
            :totalCash="totalCash"
        />
    </div>
</template>

<script>
import Accounts from '../components/cashbox/Accounts.vue'
import Logs from '../components/cashbox/Logs.vue'
import TransactionForm from '../components/cashbox/TransactionForm.vue'
import { getMoneyInCashBox } from '../controllers/cashbox'
import EventBus from '../event-bus'
import { PRINT_CASH_BOX_REPORT } from '../event-bus/events'

export default {
    name: 'cashbox',

    components: {
        Accounts,
        Logs,
        TransactionForm
    },

    data() {
        return {
            showForm: false,
            totalCash: 0,
            transactionFormIsOpen: false
        }
    },

    computed: {
        totalAccounts() {
            return this.accounts.reduce((prev, next) => prev + next.value, 0)
        }
    },

    methods: {
        async getTotalCash() {
            this.totalCash = await getMoneyInCashBox()
        },

        setActionButtons() {
            const printReport = {
                type: 'is-primary',
                icon: 'printer',
                label: 'Imprimir Reporte',
                action: () => EventBus.$emit(PRINT_CASH_BOX_REPORT)
            }

            const AddTransaction = {
                type: 'is-success',
                icon: 'cash-register',
                label: 'Cierre de caja',
                action: this.toggleTransactionForm
            }
            this.$store.commit('SET_ACTION_BUTTONS', [
                AddTransaction,
                printReport
            ])
        },

        toggleTransactionForm() {
            this.transactionFormIsOpen = !this.transactionFormIsOpen
        }
    },

    beforeMount() {
        this.setActionButtons()
    },

    mounted() {
        this.getTotalCash()
    }
}
</script>

<style lang="scss" scoped></style>
