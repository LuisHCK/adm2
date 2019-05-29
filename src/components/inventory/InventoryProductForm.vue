<template>
  <form @submit.prevent="submit">
    <!-- Name -->
    <b-field
      label="Producto*"
      :type="messages.product_id? 'is-danger':''"
      :message="messages.product_id"
    >
      <v-select
        v-model="form.product_id"
        :options="products"
        label="name"
        :reduce="product => product.id"
      ></v-select>
    </b-field>
    
    <!-- Location -->
    <b-field label="Precio*">
      <b-numberinput v-model="form.price" min="1"></b-numberinput>
    </b-field>
    
    <!-- Description -->
    <b-field label="Existencias*">
      <b-numberinput v-model="form.quantity" min="0"></b-numberinput>
    </b-field>

    <!-- Lote -->
    <b-field label="Lote">
      <b-input v-model="form.lot"></b-input>
    </b-field>
    <hr>
    <div>
      <button type="submit" class="button is-success">Guardar</button>
    </div>
  </form>
</template>

<script>
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

export default {
  name: "inventory-product-form",

  components: {
    "v-select": vSelect
  },

  props: {
    inventoryId: {
      type: Number,
      default: undefined
    },
  },

  data() {
    return {
      form: {},
      messages: {},
      products: []
    };
  },

  methods: {
    getProducts() {
      Database.product
        .toArray()
        .then(products => (this.products = products))
        .then(() => (this.loading = false));
    },

    submit() {
      if (this.form.product_id && this.form.price && this.form.quantity) {
        this.form.inventory_id = this.inventoryId
        this.$emit("submit", this.form);
      } else {
        this.notifyError("Por favor revise el formulario");
        this.showMessages();
      }
    },

    showMessages() {
      if (!this.form.product_id) {
        this.messages.product_id = "Este campo es requerido";
      }
      this.$forceUpdate();
    },

    notifyError(text) {
      this.$toast.open({
        duration: 3000,
        message: text,
        position: "is-bottom",
        type: "is-danger"
      });
    }
  },

  mounted() {
    this.getProducts();
  }
};
</script>

<style lang="scss" scoped>
</style>