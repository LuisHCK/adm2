<template>
  <form @submit.prevent="submit">
    <!-- Name -->
    <b-field label="Nombre*" :type="messages.name? 'is-danger':''" :message="messages.name">
      <b-input v-model="form.name" placeholder="Nombre del producto"></b-input>
    </b-field>
    <!-- Brand -->
    <b-field label="Marca*" :type="messages.brand? 'is-danger':''" :message="messages.brand">
      <b-input v-model="form.brand" placeholder="Marca del producto"></b-input>
    </b-field>
    <!-- Unit -->
    <b-field label="Unidad*" :type="messages.unit? 'is-danger':''" :message="messages.unit">
      <b-input v-model="form.unit" placeholder="Unidad de medida"></b-input>
    </b-field>
    <!-- Codebar -->
    <b-field label="Codigo">
      <b-input v-model="form.codebar" placeholder="Codigo o codigo de barras"></b-input>
    </b-field>
    <!-- Categories -->
    <b-field label="Categorías">
      <b-taginput v-model="form.categories" ellipsis icon="label" placeholder="Agregar categorías"></b-taginput>
    </b-field>
    <!-- Status -->
    <b-field label="Estatus">
      <b-select v-model="form.status" placeholder="Estus del producto">
        <option v-for="(option, i) in statuses" :value="option" :key="'opt'+i">{{ option }}</option>
      </b-select>
    </b-field>
    <!-- Description -->
    <b-field label="Descripción">
      <b-input v-model="form.description" type="textarea"></b-input>
    </b-field>
    <hr>
    <div>
      <button type="submit" class="button is-success">Guardar</button>
    </div>
  </form>
</template>

<script>
export default {
  name: "product-form",

  data() {
    return {
      form: {
        name: undefined,
        brand: undefined,
        unity: undefined
      },
      messages: {},
      statuses: ["activo", "en revisión", "deshabilitado"]
    };
  },

  methods: {
    submit() {
      if (this.form.name && this.form.brand && this.form.unit) {
        this.$emit("submit", this.form);
      } else {
        this.notifyError("Por favor revise el formulario");
        this.showMessages();
      }
    },

    showMessages() {
      if (!this.form.name) {
        this.messages.name = "Este campo es requerido";
      }
      if (!this.form.brand) {
        this.messages.brand = "Este campo es requerido";
      }
      if (!this.form.unit) {
        this.messages.unit = "Este campo es requerido";
      }
      this.$forceUpdate()
    },

    notifyError(text) {
      this.$toast.open({
        duration: 3000,
        message: text,
        position: "is-bottom",
        type: "is-danger"
      });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>