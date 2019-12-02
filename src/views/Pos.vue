<template>
  <div class="pos-page page-container">
    <div class="panel">
      <div class="columns">
        <div class="column is-6">
          <product-search @input="addToShoppingCart"/>
        </div>
        <div class="column">
          <button @click="cancelSale" class="button is-danger">Cancelar venta</button>
        </div>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <div class="panel">
          <table class="table is-fullwidth">
            <thead>
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th>Existencias</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Sub total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in shoppingCart" :key="'ip-' + index">
                <td>{{ index + 1 }}</td>
                <td>
                  <div v-text="getProductName(item.inventoryProduct.product)"/>
                  <small>{{ item.inventoryProduct.inventory.name }}</small>
                </td>
                <td>
                  <span v-text="item.inventoryProduct.stock"/>
                </td>
                <td>
                  <input
                    :id="`qtyInput-${item.inventoryProduct.id}`"
                    :ref="`qty-input-${index}`"
                    class="quantity-input input"
                    type="number"
                    min="1"
                    :value="item.quantity || 1"
                    :max="item.inventoryProduct.stock"
                    @input="setInventoryProductBuyQty(index, $event, item.inventoryProduct.stock)"
                    @change="setInventoryProductBuyQty(index, $event, item.inventoryProduct.stock)"
                    @focus="focusSelect"
                  >
                </td>
                <td>
                  <span v-text="`C$${item.inventoryProduct.price}`"/>
                </td>
                <td>
                  <span v-text="`C$${item.subTotal}`"/>
                </td>
                <td>
                  <b-button type="is-danger" size="is-normal" rounded @click="removeItem(index)">
                    <i class="mdi mdi-delete"></i>
                  </b-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="column is-4-desktop is-4-tablet">
        <div class="panel">
          <div class="columns is-multiline">
            <!-- Sub total -->
            <div class="column is-half">
              <span>Subtotal</span>
            </div>
            <div class="column is-half has-text-right">
              <span v-text="`C$${shoppingCartTotal}`"/>
            </div>
            <!-- Discounts -->
            <div class="column is-half">
              <span>Descuento</span>
            </div>
            <div class="column is-half has-text-right">
              <span>
                <span v-text="`-C$${discounted} `"/>
                <small v-text="`(${discount}%)`"/>
              </span>
            </div>
            <!-- Total -->
            <div class="column is-half">
              <span>TOTAL</span>
            </div>
            <div class="column is-half has-text-right">
              <strong class="is-size-4 has-text-danger" v-text="`C$${finalTotal}`"/>
            </div>
          </div>

          <hr>

          <!-- payment section -->
          <div class="columns is-multiline">
            <div class="column is-half">
              <span>Paga con</span>
            </div>
            <div class="column is-half has-text-right">
              <b-input
                ref="payWithInput"
                @focus="focusSelect"
                type="number"
                v-model="payWith"
                :min="1"
              ></b-input>
            </div>
            <!-- Exchange -->
            <div class="column is-half">
              <span>Vuelto</span>
            </div>
            <div class="column is-half has-text-right">
              <strong class="hast-text-success" v-text="`C$${exchange}`"/>
            </div>
          </div>

          <hr>

          <!-- Customer section -->
          <div class="columns is-multiline">
            <div class="column is-3">
              <span>Cliente</span>
            </div>
            <div class="column" style="display: flex;">
              <v-select
                label="name"
                style="width: 100%;"
                :options="customers"
                @input="setCustomer"
                :value="shoppingCartCustomer"
              >
                <div slot="no-options">No hay clientes registrados</div>
              </v-select>
              <b-button @click="showCustomerForm=true" type="is-primary" style="margin-left: 8px;">
                <i class="mdi mdi-plus"></i>
              </b-button>
            </div>
          </div>

          <!-- Complete button -->
          <div>
            <button
              @click="completeSale()"
              class="button is-success is-fullwidth"
              :disabled="!shoppingCart.length"
            >COMPLETAR VENTA</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer modal form -->
    <b-modal :active.sync="showCustomerForm" has-modal-card>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Agregar un nuevo Cliente</p>
        </header>
        <section class="modal-card-body">
          <customer-form v-if="showCustomerForm" @input="getCustomers();showCustomerForm=false"/>
        </section>
      </div>
    </b-modal>
  </div>
</template>

<script>
import 'vue-select/dist/vue-select.css'
import ProductSearch from '@/components/pos/ProductSearch.vue'
import CustomerForm from '@/components/customers/CustomerForm.vue'
import vSelect from 'vue-select'
import { mapState, mapGetters } from 'vuex'
import Maths from '@/lib/maths'

export default {
  components: {
    ProductSearch,
    vSelect,
    CustomerForm
  },

  computed: {
    ...mapState(['shoppingCart', 'shoppingCartCustomer']),
    ...mapGetters(['shoppingCartTotal']),

    totalSale() {
      return 0
    },

    discounted() {
      return Maths.percentOfNum(this.discount, this.shoppingCartTotal)
    },

    finalTotal() {
      return this.shoppingCartTotal - this.discounted
    },

    exchange() {
      if (this.payWith) {
        return this.payWith - this.finalTotal
      } else {
        return 0
      }
    }
  },

  data() {
    return {
      quantities: [],
      discount: 0,
      payWith: undefined,
      customers: [],
      showCustomerForm: false,

    }
  },

  methods: {
    addToShoppingCart(inventoryProduct) {
      // Check if inventory product is in shopping cart
      let itemIndex
      const item = this.shoppingCart.find((item, index) => {
        if (item.inventoryProduct.id == inventoryProduct.id) {
          itemIndex = index
          return true
        }
      })

      // If items exists just increase the quantity
      if (item) {
        this.$store.commit('INCREASE_PRODUCT_SHOPPING_CART', itemIndex)
      }
      // Add the product to shopping cart
      else {
        this.$store.commit('ADD_PRODUCT_TO_SHOPPING_CART', {
          inventoryProduct,
          quantity: 1,
          subTotal: inventoryProduct.price * 1
        })
      }
      setTimeout(() => {
        // Allways focus Quantity input
        document.getElementById(`qtyInput-${inventoryProduct.id}`).focus()
        document.getElementById(`qtyInput-${inventoryProduct.id}`).select()
      }, 100)
    },

    /**
     * Remove an item form Shopping cart
     */
    removeItem(itemIndex) {
      this.$store.commit('REMOVE_ITEM_SHOPPING_CART', itemIndex)
      this.$buefy.toast.open({
        message: 'Se quitó el producto',
        type: 'is-success',
        position: 'is-bottom'
      })
    },

    /**
     * Call muttation to add Product Buy Quantity
     */
    setInventoryProductBuyQty(index, event, stock) {
      let quantity = Number(event.target.value)

      // Check maximum
      // When input quantity reach stock limit, alert to user and fix input
      if (quantity > stock) {
        quantity = stock
        event.target.value = stock
        this.$buefy.toast.open({
          message: 'Supera el máximo de existencias',
          type: 'is-warning',
          position: 'is-bottom'
        })
      }

      this.$store.commit('SET_PRODUCT_QTY_SHOPPING_CART', {
        index,
        quantity: quantity
      })
    },

    cancelSale() {
      this.$store.commit('CLEAR_SHOPPING_CART')
    },

    /**
     * Set customer for of this shopping cart
     */
    setCustomer(event) {
      this.$store.commit('SET_SHOPPING_CART_CUSTOMER', event)
    },

    /**
     * Finalice shopping cart and store the info in db
     */
    completeSale() {
      Database.sale
        .add({
          shoppingCart: this.shoppingCart,
          discount: this.discount,
          customer: this.shoppingCartCustomer,
          subTotal: this.shoppingCartTotal,
          discounted: this.discounted,
          total: this.finalTotal,
          customer_id: this.shoppingCartCustomer.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .then(sale => {
          // Reduce inventory stock
          this.reduceInventoryQuantity()
          // Clear the sale form
          this.cancelSale()
          // Open detail retult
          this.$router.push(`/sales?saleId=${sale}`)
        })
      this.showToast('Se completó la venta')
    },

    reduceInventoryQuantity() {
      this.shoppingCart.map(item => {
        const totalStock = item.inventoryProduct.stock - item.quantity
        Database.inventory_product.update(item.inventoryProduct.id, {stock: totalStock})
      })
    },

    showErrorToast(message) {
      this.$buefy.toast.open({
        message: message,
        type: 'is-danger',
        position: 'is-bottom'
      })
    },

    showToast(message, type = 'is-success') {
      this.$buefy.toast.open({
        message: message,
        type: type,
        position: 'is-bottom'
      })
    },

    focusSelect(event) {
      event.target.select()
    },

    getCustomers() {
      Database.customer.toArray().then(data => (this.customers = data))
    },

    getProductName(product) {
      return `${product.name} - ${product.content} ${product.unit}`
    },

    initShortCuts() {
      window.addEventListener('keydown', e => {
        // CTRL + 1 = Focus on search
        if (e.which == 49 && e.ctrlKey) {
          console.log('CTRL + 1')
          document.getElementById('searchInput').focus()
        }

        // CTRL + 2 = Finish the sale
        if (e.which == 50 && e.ctrlKey) {
          console.log('CTRL + 2')
          this.completeSale()
        }
      })
    }
  },

  mounted() {
    this.getCustomers()
    this.initShortCuts()
  }
}
</script>

<style lang="scss" scoped>
.quantity-input {
  width: 60px;
}
</style>