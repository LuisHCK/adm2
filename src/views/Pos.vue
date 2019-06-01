<template>
  <div class="pos-page">
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
          <table class="table is-full-width">
            <thead>
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th>Existencias</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Sub total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in shoppingCart" :key="'ip-' + index">
                <td>{{ index + 1 }}</td>
                <td>
                  <div>{{ item.inventoryProduct.product.name }}</div>
                  <small>{{ item.inventoryProduct.inventory.name }}</small>
                </td>
                <td>
                  <span
                    v-text="`${item.inventoryProduct.stock} ${item.inventoryProduct.product.unit}`"
                  />
                </td>
                <td>
                  <input
                    id="qtyInput"
                    :ref="`qty-input-${index}`"
                    class="quantity-input input"
                    type="number"
                    min="1"
                    :value="item.quantity || 1"
                    :max="item.inventoryProduct.stock"
                    @input="setInventoryProductBuyQty(index, $event)"
                    @change="setInventoryProductBuyQty(index, $event)"
                    @focus="focusSelect"
                  >
                </td>
                <td>
                  <span v-text="`C$${item.inventoryProduct.price}`"/>
                </td>
                <td>
                  <span v-text="`C$${item.subTotal}`"/>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProductSearch from '@/components/pos/ProductSearch.vue'
import { mapState, mapGetters } from 'vuex'
import Maths from '@/lib/maths'

export default {
  components: {
    ProductSearch
  },

  computed: {
    ...mapState(['shoppingCart']),
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
      discount: 5,
      payWith: undefined
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
      // Allways focus Quantity input
      document.getElementById('qtyInput').focus()
      setTimeout(() => {
        document.getElementById('qtyInput').select()
      }, 100)
    },

    /**
     * Call muttation to add Product Buy Quantity
     */
    setInventoryProductBuyQty(index, event) {
      this.$store.commit('SET_PRODUCT_QTY_SHOPPING_CART', {
        index,
        quantity: event.target.value
      })
    },

    cancelSale() {
      this.$store.commit('CLEAR_SHOPPING_CART')
    },

    showErrorToast(message) {
      this.$toast.open({
        message: message,
        type: 'is-danger',
        position: 'is-bottom'
      })
    },

    focusSelect(event) {
      event.target.select()
    }
  },

  mounted() {}
}
</script>

<style lang="scss" scoped>
.quantity-input {
  width: 60px;
}
</style>