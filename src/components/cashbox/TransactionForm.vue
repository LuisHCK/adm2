<template>
    <b-modal
        :active="isOpen"
        @close="onClose"
        has-modal-card
        trap-focus
        :destroy-on-hide="false"
        aria-role="dialog"
        aria-modal
    >
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">Cierre de caja</p>
                <button type="button" class="delete" @click="onClose" />
            </header>
            <section class="modal-card-body">
                <div class="columns is-mobile is-multiline">
                    <div class="column is-half is-full-mobile">
                        <b-field label="Cantidad a retirar de caja">
                            <p class="control">
                                <span
                                    class="button is-static is-rounded"
                                    v-text="currency"
                                />
                            </p>
                            <b-numberinput
                                v-model="form.withdrawalAmount"
                                :controls="false"
                                @focus="inputSelect"
                                expanded
                                rounded
                            />
                        </b-field>
                    </div>

                    <div class="column is-half is-full-mobile">
                        <b-field label="Saldo en caja" rounded>
                            <p class="control">
                                <span
                                    class="button is-static is-rounded"
                                    v-text="currency"
                                />
                            </p>
                            <b-input
                                :value="balance"
                                :editable="false"
                                :readonly="true"
                                custom-class="balance-input"
                                expanded
                                rounded
                            />
                        </b-field>
                    </div>
                    <div class="column is-full">
                        <b-field label="Notas">
                            <b-input
                                v-model="form.notes"
                                type="textarea"
                                rounded
                            />
                        </b-field>
                    </div>
                </div>
            </section>
            <footer class="modal-card-foot">
                <button class="button is-primary" @click="onSubmitForm">
                    Guardar
                </button>
                <button class="button" type="button" @click="onClose">
                    Cancelar
                </button>
            </footer>
        </div>
    </b-modal>
</template>

<script>
import { months, daysAbr } from '@/lib/locale'
import { mapGetters, mapState } from 'vuex'
import {
    cashBoxDateFormat,
    cashBoxRefGen,
    registerCashboxLog
} from '../../controllers/cashbox'

export default {
    name: 'transaction-form',

    props: {
        isOpen: {
            type: Boolean,
            default: false
        },

        totalCash: {
            type: Number,
            default: 0
        }
    },

    computed: {
        ...mapGetters(['currency']),

        ...mapState(['user']),

        balance() {
            return Number(this.totalCash - this.form.withdrawalAmount).toFixed(2)
        },

        calendar() {
            return { months, days: daysAbr }
        }
    },

    data() {
        return {
            form: {
                withdrawalAmount: 0,
                balance: 0,
                notes: '',
                created_at: new Date()
            }
        }
    },

    methods: {
        onClose() {
            this.$emit('close')
            this.cleanForm()
        },

        cleanForm() {
            this.form = {
                withdrawalAmount: 0,
                balance: 0,
                notes: '',
                created_at: new Date()
            }
        },

        inputSelect(event) {
            event.target ? event.target.select() : null
        },

        async onSubmitForm() {
            const date = this.$moment()
            const isoString = date.toISOString()

            if (!this.form.withdrawalAmount) {
                return this.notifyError()
            }

            // Register the close
            await registerCashboxLog({
                amount: -Math.abs(this.form.withdrawalAmount),
                concept: `Cierre de caja`,
                type: 'close',
                reference: cashBoxRefGen(
                    'close',
                    cashBoxDateFormat(date.toDate())
                ),
                notes: this.form.notes,
                user_id: this.user.id,
                date: isoString,
                created_at: isoString,
                updated_at: isoString
            })

            // Register balance after close
            if (this.balance > 0) {
                await registerCashboxLog({
                    amount: Number(this.balance),
                    concept: 'Saldo en caja',
                    type: 'balance',
                    reference: cashBoxRefGen(
                        'balance',
                        cashBoxDateFormat(date.toDate())
                    ),
                    user_id: this.user.id,
                    date: isoString,
                    created_at: isoString,
                    updated_at: isoString
                })
            }

            this.$emit('onSave')

            this.notifySuccess()

            this.onClose()
        },

        notifySuccess() {
            this.$buefy.toast.open({
                message: `El cierre de caja se realizó con éxito`,
                position: 'is-bottom',
                type: 'is-success'
            })
        },

        notifyError() {
            this.$buefy.toast.open({
                message: 'Ocurrió un error al guardar, revise el formulario',
                position: 'is-bottom',
                type: 'is-error',
            })
        }
    },

    mounted() {}
}
</script>

<style lang="scss">
    .balance-input {
        text-align: center;
    }
</style>
