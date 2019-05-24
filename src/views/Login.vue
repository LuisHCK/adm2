<template>
  <div id="login-page">
    <div class="form-container">
      <form @submit.prevent="doLogin">
        <b-field label="Nombre de usuario" type="is-dange">
          <b-input v-model="form.auth"></b-input>
        </b-field>
        <b-field label="Constraseña">
          <b-input type="password" v-model="form.password" password-reveal></b-input>
        </b-field>
        <div class="form-group">
          <button class="button is-primary" type="submit">Iniciar sesión</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { logIn } from "../lib/auth";
export default {
  name: "Login",

  computed: {
    ...mapGetters(["userCount"])
  },

  data() {
    return {
      form: {
        auth: undefined,
        password: undefined
      },
      totalUsers: undefined
    };
  },

  methods: {
    async doLogin() {
      const result = await logIn(this.form.auth, this.form.password)
      if (result) {
        this.$router.push({name: 'home'})
      } else {
        alert('error')
      }
    }
  },

  created() {
    this.userCount.then(count => (this.totalUsers = count));
  },

  created() {
    // Redirect to Registration if not users
    this.$store.getters.userCount.then(count => {
      if (!count) {
        return this.$router.push('/registration')
      }
    })
  }
};
</script>

<style lang="scss" scoped>
#login-page {
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
    padding: 20px
    
  }
}
</style>