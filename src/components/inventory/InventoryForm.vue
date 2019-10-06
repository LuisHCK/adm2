<template>
  <form @submit.prevent="submit">
    <!-- Name -->
    <b-field label="Nombre*" :type="messages.name? 'is-danger':''" :message="messages.name">
      <b-input v-model="form.name" placeholder="Nombre del producto"></b-input>
    </b-field>
    <!-- Location -->
    <b-field label="Ubicación">
      <b-input v-model="form.location" placeholder="Ej. 'Almacen', 'Bodega'"></b-input>
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
        location: undefined,
        description: undefined
      },
      messages: {}
    };
  },

  methods: {
    submit() {
      if (this.form.name) {
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
      this.$forceUpdate()
    },

    notifyError(text) {
      this.$buefy.toast.open({
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