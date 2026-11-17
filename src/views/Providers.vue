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
                                    aria-label="Editar proveedor"
                                    @click="editProvider(props.row)"
                                    rounded
                                />
                            </div>
                            <div class="control">
                                <b-button
                                    type="is-danger"
                                    icon-left="delete"
                                    size="is-small"
                                    aria-label="Eliminar proveedor"
                                    @click="deleteProvider(props.row)"
                                    rounded
                                />
                            </div>
                        </b-field>
                    </b-table-column>
                </template>

                <template #empty>
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
            v-model="showForm"
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
import database from "@/db"
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
            database.provider
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

        deleteProvider(provider) {
            this.$buefy.dialog.confirm({
                title: 'Eliminar proveedor',
                message: `¿Deseas eliminar <b>${provider.name}</b>? Esta acción no se puede deshacer.`,
                confirmText: 'Sí, eliminar',
                cancelText: 'Cancelar',
                type: 'is-danger',
                hasIcon: true,
                onConfirm: () => this.performDeleteProvider(provider)
            })
        },

        async performDeleteProvider(provider) {
            try {
                await database.product_provider
                    .where('provider_id')
                    .equals(provider.id)
                    .delete()
                await database.provider.delete(provider.id)

                this.getProviders()
                this.$buefy.toast.open({
                    message: 'Se eliminó el proveedor',
                    type: 'is-success',
                    position: 'is-bottom'
                })
            } catch (error) {
                console.error(error)
                this.$buefy.dialog.alert({
                    title: 'Error al eliminar',
                    message: 'No se pudo eliminar el proveedor.',
                    type: 'is-danger',
                    hasIcon: true
                })
            }
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
