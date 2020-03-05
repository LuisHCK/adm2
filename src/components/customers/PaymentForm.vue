<template>
  <form @submit.prevent="submit">
    <!-- Name -->
    <b-field
      label="Monto*"
      :type="messages.amount ? 'is-danger' : ''"
      :message="messages.amount"
    >
      <b-input
        type="number"
        min="0.01"
        step="0.01"
        v-model="form.amount"
        placeholder="Monto pagado"
        required
      ></b-input>
    </b-field>

    <!-- Date -->
    <b-field label="Fecha del pago">
      <b-datepicker
        placeholder="Click para selecionar fecha"
        icon="calendar-today"
        :month-names="months"
        :day-names="weekDays"
        v-model="form.date"
      >
      </b-datepicker>
    </b-field>

    <!-- Description -->
    <b-field label="Descripción">
      <b-input
        v-model="form.description"
        type="textarea"
        placeholder="Descripción del pago"
        rows="10"
      ></b-input>
    </b-field>
    <hr />
    <div>
      <button type="submit" class="button is-success">Guardar</button>
    </div>
  </form>
</template>

<script>
import { months, weekDays } from '@/lib/constants'

export default {
  name: 'payment-form',

  props: {
    customer: {
      type: Object,
      default: () => {}
    },
    totalDebt: {
      type: Number,
      default: 0
    }
  },

  computed: {
    months() {
      return months
    },

    weekDays() {
      return weekDays
    }
  },

  /**
   * Data model
   */
  data() {
    return {
      form: {
        date: this.$moment().toDate()
      },
      messages: {}
    }
  },

  methods: {
    /**
     * Submit payment
     */
    submit(event) {
      if (this.form.amount) {
        // if debth is less than payment, send an alert
        if (Number(this.form.amount) > this.totalDebt) {
          return this.$buefy.dialog.confirm({
            title: 'Confirmar monto a pagar',
            message: `El monto a pagar es mayor que la deuda actual del cliente\n
            ¿Aun así desea confirmar el pago?`,
            cancelText: 'Cancelar',
            confirmText: 'Si, guardar pago',
            type: 'is-success',
            onConfirm: () => {
              this.savePayment(this.form)
            }
          })
        }
        this.savePayment(this.form)
      } else {
        this.notify(
          `Por favor indique la cantidad pagada por el cliente.`,
          `warning`
        )
      }
    },

    /**
     * Store payment in Database
     */
    savePayment(data) {
      const now = new Date()
      Database.customer_payment
        .add({
          customer_id: this.customer.id,
          amount: this.form.amount,
          description: this.form.description,
          customer: this.customer,
          date: this.$moment(this.form.data).format(),
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .then(res => {
          this.$emit('submit', res)

          this.notify(`¡Se registró el pago con éxito!`)
        })
        .catch(err => {
          console.error(err)
          this.notify(
            `No se pudo registrar el pago, por favor revise el formulario.`,
            'danger'
          )
        })
    },

    notify(text, type = 'success') {
      this.$buefy.toast.open({
        duration: 3000,
        message: text,
        position: 'is-bottom',
        type: `is-${type}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>