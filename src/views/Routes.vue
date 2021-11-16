<template>
  <div class="page-container">
    <button
      class="button is-success is-pulled-right is-rounded"
      @click="showModalForm=!showModalForm"
    >
      <span>Nuevo</span>
      <b-icon icon="plus"></b-icon>
    </button>
    <h4 class="has-text-weight-bold">Rutas</h4>
    <hr />

    <!-- Layout init -->
    <div class="columns is-mobile is-multiline">
      <div class="column is-half-desktop" v-for="route in routes" :key="route.id">
        <route-card :route="route" />
      </div>
    </div>

    <!-- Form modal -->
    <b-modal :active.sync="showModalForm" has-modal-card>
      <div class="modal-card">
        <div class="modal-card-head">
          <span v-if="routeForm.id" class="modal-card-title">Editar Ruta</span>
        </div>
        <div class="modal-card-body">
          <form @submit.prevent="submit">
            <b-field
              label="Nombre*"
              :type="formErrors.name? 'is-danger':''"
              :message="formErrors.name"
            >
              <b-input :required="true" v-model="routeForm.name" placeholder="Nombre de la ruta"></b-input>
            </b-field>

            <b-field label="Contacto">
              <b-input v-model="routeForm.phone" placeholder="Numero de contacto"></b-input>
            </b-field>

            <b-field label="Descripción">
              <b-input v-model="routeForm.description" type="textarea"></b-input>
            </b-field>

            <hr />
            <div>
              <button type="submit" class="button is-success">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import RouteCard from '@/components/routes/RouteCard.vue'

export default {
  components: {
    RouteCard
  },

  data() {
    return {
      showModalForm: false,
      routes: [],
      routeForm: {},
      formErrors: {}
    }
  },

  methods: {
    getRoutes() {
      Database.route
        .toArray()
        .then(routes => {
          this.routes = routes
        })
        .catch(err => console.error(err))
    },

    /**
     * Save Route
     */
    submit() {
      Database.route
        .add(this.routeForm)
        .then(data => {
          // Perform post-create action
          this.showModalForm = false
          this.routeForm = {}
          this.formErrors = {}
          this.getRoutes()
        })
        .catch(err => console.error(err))
    }
  },

  mounted() {
    this.getRoutes()
  }
}
</script>

<style>
</style>