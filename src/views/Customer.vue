<template>
  <div class="page-container">
    <div class="columns">
      <div class="column is-full-mobile is-one-third-tablet customer-details">
        <div class="panel">
          <h2 class="has-text-weight-bold is-size-3">
            {{ customer.name }}
            {{ customer.last_name }}
          </h2>

          <hr />

          <!-- phone -->
          <div class="has-text-weight-semibold">Telefono</div>
          <div>{{ customer.phone }}</div>

          <hr />

          <!-- email -->
          <div class="has-text-weight-semibold">Email</div>
          <div>{{ customer.email }}</div>

          <hr />

          <!-- Address -->
          <div class="has-text-weight-semibold">Direccion</div>
          <div>{{ customer.address || '---' }}</div>

          <hr />

          <!-- Total due -->
          <div class="has-text-weight-semibold">Deduda total</div>
          <div>
            <b-tag
              :type="totalDebt > 0 ? 'is-danger' : 'is-success'"
              class="strong is-size-5"
              rounded
            >
              ${{ totalDebt }}
            </b-tag>
          </div>
        </div>
      </div>
      <div class="column is-full-mobile">
        <div class="panel">
          <div class="columns is-multiline is-mobile">
            <div class="column is-full">
              <h4 class="has-text-weight-bold is-size-5">
                Transacciones del cliente
              </h4>
            </div>
            <div class="column is-full-mobile is-one-third-tablet">
              <!-- Date picker -->
              <b-field label="Filtrar por fecha">
                <b-datepicker
                  placeholder="Filtrar por fecha"
                  position="is-bottom-left"
                  icon="calendar-today"
                  v-model="dateRange"
                  :month-names="months"
                  :day-names="daysAbr"
                  range
                  rounded
                >
                </b-datepicker>
              </b-field>
            </div>

            <!-- Payment type -->
            <div class="column is-full-mobile is-one-third-tablet">
              <b-field label="Tipo de venta">
                <b-select
                  v-model="selectedSaleType"
                  placeholder="Seleccione un tipo de venta"
                  rounded
                  expanded
                >
                  <option :value="undefined">Todos</option>
                  <option value="credit">Crédito</option>
                  <option value="cash">Contado</option>
                </b-select>
              </b-field>
            </div>

            <div
              class="column is-full-mobile is-one-third-tablet is-flex align-items-end"
            >
              <b-button
                type="is-primary"
                icon-left="account-search"
                rounded
                @click="filterByDate()"
              >
                Filtrar
              </b-button>
            </div>
          </div>

          <b-table
            :data="sortedTransactions"
            :striped="true"
            :hoverable="true"
            :loading="loading"
          >
            <template slot-scope="props">
              <b-table-column field="type" label="Tipo">
                <b-tag
                  rounded
                  :type="
                    props.row.type == 'credit' ? 'is-danger' : 'is-success'
                  "
                  class="strong"
                  >{{ props.row.type == 'credit' ? 'Crédito' : 'Pago' }}</b-tag
                >
              </b-table-column>

              <b-table-column field="description" label="Descripción">
                {{ props.row.description }}
              </b-table-column>

              <b-table-column field="created_at" label="Fecha">{{
                props.row.created_at | moment('MMM DD YYYY, h:mma')
              }}</b-table-column>

              <b-table-column field="total" label="Total">
                <b-tag
                  rounded
                  :type="
                    props.row.type == 'credit' ? 'is-danger' : 'is-success'
                  "
                  class="strong"
                  >C${{ props.row.total }}</b-tag
                >
              </b-table-column>
            </template>
          </b-table>
        </div>
      </div>
    </div>

    <!-- Add to inventory -->
    <b-modal :active.sync="showFormModal" has-modal-card>
      <div class="modal-card">
        <div class="modal-card-head">
          <span class="modal-card-title">Registrar pago</span>
        </div>
        <div class="modal-card-body">
          <payment-form
            :customer="customer"
            :totalDebt="totalDebt"
            @submit="savePayment($event)"
          ></payment-form>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import PaymentForm from '@/components/customers/PaymentForm.vue'
import { customerDetailReport } from '@/reports/customers-report'
import { months, daysAbr } from '@/lib/locale'

export default {
  name: 'customer',

  components: {
    PaymentForm
  },

  data() {
    return {
      customer: {},
      showFormModal: false,
      sales: [],
      transactions: [],
      loading: false,
      dateRange: undefined,
      selectedSaleType: undefined
    }
  },

  computed: {
    totalDebt() {
      if (this.transactions && this.transactions.length) {
        return this.transactions
          .filter(t => t.type == 'credit')
          .reduce((a, b) => a + b.total, 0)
      }
      return 0
    },

    /**
     * Return Transactions sorted by date
     */
    sortedTransactions() {
      if (this.transactions && this.transactions.length) {
        return this.transactions.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at)
        })
      }

      return []
    },

    months() {
      return months
    },

    daysAbr() {
      return daysAbr
    }
  },

  methods: {
    /** Get customter object by ID param */
    getCustomer() {
      const id = Number(this.$route.params.id)

      Database.customer.get({ id }, data => {
        this.customer = data
      })
    },

    /**
     * Get all purchases by Customer
     */
    getSales() {
      const customer_id = Number(this.$route.params.id)

      // Define filters
      const filters = { customer_id }
      // Filter by sale type if selected
      if (this.selectedSaleType) {
        filters.sale_type = this.selectedSaleType
      }

      // Filter by selected Customer Id
      let query = Database.sale.where(filters)

      // Get date range
      if (this.dateRange) {
        // Parse filters
        const startDate = this.$moment(this.dateRange[0])
        const finishDate = this.$moment(this.dateRange[1])

        // Update query
        query = query.and(item => {
          let paymentDate = this.$moment(item.created_at)
          // check if between
          return paymentDate.isBetween(startDate, finishDate)
        })
      }

      query.toArray(data => {
        const sales = data.map(d => {
          return {
            type: d.sale_type,
            id: d.id,
            description:
              d.sale_type == 'credit'
                ? 'Compra al crédito'
                : 'Compra de contado',
            total: d.total,
            created_at: d.created_at,
            updated_at: d.updated_at
          }
        })
        this.transactions.push(...sales)
      })
    },

    /**
     * Retrieve all Payments
     */
    getPayments() {
      const id = Number(this.$route.params.id)
      let query = Database.customer_payment.where({ customer_id: id })

      // Get date range
      if (this.dateRange) {
        // Parse filters
        const startDate = this.$moment(this.dateRange[0])
        const finishDate = this.$moment(this.dateRange[1])

        // Update query
        query = query.and(item => {
          let paymentDate = this.$moment(item.created_at)
          // check if between
          return paymentDate.isBetween(startDate, finishDate)
        })
      }

      query.toArray(data => {
        const payments = data.map(p => {
          return {
            type: 'payment',
            id: p.id,
            description: p.description,
            total: -Math.abs(p.amount), // Convert payment to negative, its reduce debt
            created_at: p.date || p.created_at,
            updated_at: p.updated_at
          }
        })
        this.transactions.push(...payments)
      })
    },

    savePayment(payment) {
      this.getData()
      this.showFormModal = false
    },

    getData() {
      // Clean previous data
      this.transactions = []

      this.getSales()
      this.getPayments()
    },

    filterByDate() {
      this.getData()
    },

    printCustomerReport() {
      customerDetailReport({
        customer: this.customer,
        transactions: this.transactions,
        totalDebt: this.totalDebt,
        dateRange: this.dateRange
      })
    },

    setActionButtons() {
      const printReport = {
        type: 'is-primary',
        icon: 'printer',
        label: 'Imprimir Reporte',
        action: () => {
          this.printCustomerReport()
        }
      }

      const registerPayment = {
        type: 'is-success',
        icon: 'plus',
        label: 'Registrar Pago',
        action: () => {
          this.showFormModal = true
        }
      }
      this.$store.commit('SET_ACTION_BUTTONS', [printReport, registerPayment])
    }
  },

  mounted() {
    this.setActionButtons()
    this.getCustomer()
    this.getData()
  }
}
</script>

<style lang="scss">
.customer-details {
  background-color: white;
}
</style>
