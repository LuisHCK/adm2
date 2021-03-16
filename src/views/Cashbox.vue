<template>
    <div class="page-container">
        <div class="columns is-mobile is-multiline">
            <div class="column is-one-quarter-desktop is-full-mobile">
                <accounts />
            </div>
            <div class="column">
                <logs :data="logs" />
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
import { getCashBoxLogs, getMoneyInCashBox } from '../controllers/cashbox'

export default {
    name: 'cashbox',

    components: {
        Accounts,
        Logs,
        TransactionForm
    },

    data() {
        return {
            logs: [],
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
        async getLogs() {
            this.logs = await getCashBoxLogs()
        },

        async getTotalCash() {
            this.totalCash = await getMoneyInCashBox()
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
        this.getLogs()
        this.getTotalCash()
    }
}
</script>

<style lang="scss" scoped></style>
