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
                <template>
                    <b-table-column
                        v-slot="props"
                        field="id"
                        label="ID"
                        width="40"
                        numeric
                        >{{ props.row.id }}</b-table-column
                    >

                    <b-table-column v-slot="props" field="name" label="Nombre">
                        <strong>{{ props.row.name }}</strong>
                    </b-table-column>

                    <b-table-column
                        v-slot="props"
                        field="phone"
                        label="Teléfono"
                        >{{ props.row.phone || '--' }}</b-table-column
                    >

                    <b-table-column
                        v-slot="props"
                        field="email"
                        label="Email"
                        >{{ props.row.email || '--' }}</b-table-column
                    >

                    <b-table-column v-slot="props" width="120" label="Opciones">
                        <b-field>
                            <div class="control">
                                <b-button
                                    type="is-primary"
                                    icon-left="pencil"
                                    size="is-small"
                                    @click="editProvider(props.row)"
                                    rounded
                                />
                            </div>
                            <div class="control">
                                <b-button
                                    type="is-danger"
                                    icon-left="delete"
                                    size="is-small"
                                    @click="deleteProvider(props.row)"
                                    rounded
                                />
                            </div>
                        </b-field>
                    </b-table-column>
                </template>

                <template slot="empty">
                    <section class="section">
                        <div class="content has-text-grey has-text-centered">
                            <p>
                                <b-icon
                                    icon="package-variant"
                                    size="is-large"
                                ></b-icon>
                            </p>
                            <p>No hay proveedores para mostrar.</p>
                        </div>
                    </section>
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
                    <p class="modal-card-title">
                        {{
                            selectedProvider
                                ? 'Editar proveedor'
                                : 'Agregar un nuevo proveedor'
                        }}
                    </p>
                    <button
                        type="button"
                        class="delete"
                        @click="showForm = false"
                    />
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
