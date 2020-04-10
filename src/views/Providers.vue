<template>
  <div class="page-container">
    <div class="panel">
      <b-table
        :paginated="true"
        :pagination-simple="true"
        :per-page="perPage"
        :data="providers"
        :striped="true"
        :hoverable="true"
        :loading="loading"
      >
        <template slot-scope="props">
          <b-table-column field="id" label="ID" width="40" numeric>{{
            props.row.id
          }}</b-table-column>

          <b-table-column field="name" label="Nombre">
            <strong>{{ props.row.name }}</strong>
          </b-table-column>

          <b-table-column field="phone" label="Teléfono">{{
            props.row.phone || '--'
          }}</b-table-column>

          <b-table-column field="email" label="Email">{{
            props.row.email || '--'
          }}</b-table-column>

          <b-table-column width="120" label="Opciones">
            <div class="field is-grouped">
              <div class="control">
                <button
                  @click="editProvider(props.row)"
                  class="button is-success is-small is-rounded"
                >
                  <i class="mdi mdi-pencil"></i>
                </button>
              </div>
              <div class="control">
                <button class="button is-danger is-small is-rounded">
                  <i class="mdi mdi-delete"></i>
                </button>
              </div>
            </div>
          </b-table-column>
        </template>
      </b-table>
    </div>

    <b-modal
      :active.sync="showForm"
      has-modal-card
      @close="selectedProvider = undefined"
    >
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Agregar un nuevo proveedor</p>
        </header>
        <section class="modal-card-body">
          <provider-form
            :show="showForm"
            @submit="saveProvider"
            :provider="selectedProvider"
          />
        </section>
      </div>
    </b-modal>
  </div>
</template>

<script>
import ProviderForm from '@/components/providers/ProviderForm.vue'

export default {
  name: 'providers',

  components: {
    ProviderForm
  },

  data() {
    return {
      providers: [],
      showForm: false,
      loading: true,
      perPage: 50,
      selectedProvider: undefined
    }
  },

  methods: {
    getProviders() {
      Database.provider
        .reverse()
        .toArray()
        .then(providers => (this.providers = providers))
        .then(() => (this.loading = false))
    },

    saveProvider() {
      this.showForm = false
      return this.getProviders()
    },

    editProvider(provider) {
      this.selectedProvider = provider
      this.showForm = true
    },

    setActionButtons() {
      const addProvider = {
        type: 'is-success',
        icon: 'plus',
        label: 'Nuevo Proveedor',
        action: () => {
          this.showForm = true
        }
      }
      this.$store.commit('SET_ACTION_BUTTONS', [addProvider])
    }
  },

  mounted() {
    this.getProviders()
    this.setActionButtons()
  }
}
</script>

<style lang="scss" scoped></style>
