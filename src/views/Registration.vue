<template>
  <div id="registration-page">
    <div class="form-container">
      <form @submit.prevent="submitForm">
        <!-- Name -->
        <b-field
          label="Nombre completo"
          :type="messages.name? 'is-danger':''"
          :message="messages.name"
        >
          <b-input v-model="form.name"></b-input>
        </b-field>

        <!-- Username -->
        <b-field
          label="Nombre de usuario"
          :type="messages.username? 'is-danger':''"
          :message="messages.username"
        >
          <b-input v-model="form.username"></b-input>
        </b-field>

        <!-- Phone -->
        <b-field label="Teléfono">
          <b-input v-model="form.phone"></b-input>
        </b-field>

        <!-- Password -->
        <b-field
          label="Constraseña"
          :type="messages.phone? 'is-danger':''"
          :message="messages.phone"
        >
          <b-input type="password" v-model="form.password" password-reveal></b-input>
        </b-field>

        <!--  -->
        <div class="form-group">
          <button class="button is-primary" type="submit">Crear cuenta</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { hashSync } from "../lib/auth";

export default {
  name: "Registration.vue",
  data() {
    return {
      form: {
        name: undefined,
        username: undefined,
        password: undefined,
        phone_number: undefined
      },
      messages: {}
    };
  },

  // Component methods
  methods: {
    validateForm() {
      if (!this.form.name) this.messages.name = "El nombre es requerido";

      if (!this.form.username)
        this.messages.username = "El nombre de usuario es requerido";

      if (!this.form.password)
        this.messages.password = "Por favor escribe una contraseña";

      if (!this.form.password || !this.form.username || !this.form.password)
        return false;
      else return true;
    },

    submitForm() {
      if (this.validateForm()) {
        // Set password hash
        this.form.password_digest = hashSync(this.form.password);
        delete this.form.password;
        // Register new usuer
        Database.user
          .add(this.form)
          .then(user => {
            this.notifySuccess("Se guardó el nuevo usuario");
            // Store current user
            this.$store.commit("setUser", user);
            // Redirect to path
            this.$router.push("/");
          })
          .catch(err => {
            console.log(err);
            this.notifyError("Ocurrió un error al guardar");
          });
      } else {
        this.notifyError("Por favor verifica los datos introducidos");
      }
    },

    notifyError(text) {
      this.$toast.open({
        duration: 3000,
        message: text,
        position: "is-bottom",
        type: "is-danger"
      });
    },

    notifySuccess(text) {
      this.$toast.open({
        duration: 3000,
        message: text,
        position: "is-bottom",
        type: "is-success"
      });
    }
  }
};
</script>

<style lang="scss" scoped>
#registration-page {
  background: linear-gradient(135deg, #5efff2 0%, #eb6aaf 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  .form-container {
    border-radius: 6px;
    border: 1px solid rgb(177, 177, 177);
    background-color: rgb(252, 252, 252);
    min-height: 100%;
    min-width: 450px;
    padding: 20px;
  }
}
</style>