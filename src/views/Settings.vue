
<template>
  <div id="settings-page">
    <section class="panel">
      <h4 class="is-size-3 has-text-weight-bold">Compañía</h4>
      <hr />
      <div class="columns is-mobile is-centered">
        <div class="column is-full-mobile is-half-desktop">
          <form @submit.prevent="submitCompanyForm">
            <!-- Name -->
            <b-field
              label="Nombre"
              :type="{'is-danger': errors.has('name')}"
              :message="errors.first('name')"
            >
              <b-input v-model="company.name" name="name" v-validate="'required'" />
            </b-field>
            <!-- Address -->
            <b-field label="Dirección">
              <b-input v-model="company.address"></b-input>
            </b-field>
            <!-- Phone number -->
            <b-field label="Teléfono">
              <b-input v-model="company.phone"></b-input>
            </b-field>
            <!-- Logo -->
            <b-field label="Logo">
              <b-upload v-model="company.file">
                <a class="button is-primary">
                  <b-icon icon="upload"></b-icon>
                  <span>Click para seleccionar</span>
                </a>
              </b-upload>
              <span class="file-name" v-if="company.file">{{ company.file.name }}</span>
            </b-field>
            <div class="field">
              <b-checkbox v-model="removeLogo">Quitar logo</b-checkbox>
            </div>
            <b-field>
              <button type="submit" class="button is-success">
                <b-icon icon="content-save-outline"></b-icon>
                <span>Guardar</span>
              </button>
            </b-field>
          </form>
        </div>
      </div>

      <hr />

      <div class="columns is-mobile is-centered">
        <div class="column is-full-mobile is-half-desktop">
          <button @click="seedProducts" class="button is-info">Seed products</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import EventBus from '@/event-bus'

export default {
  name: 'settings',

  data() {
    return {
      removeLogo: false,
      company: {}
    }
  },

  methods: {
    submitCompanyForm() {
      this.$validator.validateAll().then(result => {
        if (result) {
          return this.saveCompany()
        }
        this.$toast.open({
          message: 'No se pudieron guardar los cambios. Revisa el formulario',
          type: 'is-danger',
          position: 'is-bottom'
        })
      })
    },

    saveCompany() {
      this.storeLogo()
      this.deleteLogo()
      let company = Object.assign({}, this.company)
      delete company.file
      // Commit on Vuex
      this.$store.commit('setCompany', company)
      // Show toast
      this.$toast.open({
        message: 'Se guardaron los cambios',
        type: 'is-success',
        position: 'is-bottom'
      })
    },

    storeLogo() {
      const reader = new FileReader()
      reader.onloadend = function() {
        localStorage.setItem('company_logo', reader.result)
        // trigger event bus
        EventBus.$emit('UPDATE_LOGO')
      }
      if (this.company.file) {
        reader.readAsDataURL(this.company.file)
      }
    },

    deleteLogo() {
      if (this.removeLogo) {
        localStorage.removeItem('company_logo')
        this.removeLogo = false
        // trigger event bus
        EventBus.$emit('UPDATE_LOGO')
      }
    },

    /**
     * this insert all products in products.json
     */
    seedProducts() {
      const products = require('@/assets/products.json')
      products.map(product => {
        product.categories = product.categories.split('&')
        product.subcategories = product.subcategories.split('&')
        // Insert into db (Oh God halp plz)
        Database.product.add(product).then(() => {
          console.log('success')
        })
        this.$toast.open({
          message: 'Success',
          type: 'is-success',
          position: 'is-bottom'
        })
      })
    }
  },

  mounted() {
    this.company = Object.assign({}, this.$store.getters.company)
  }
}
</script>