<template>
    <form @submit.prevent="submitStoreForm">
        <div class="columns is-mobile is-multiline">
            <!-- Name -->
            <div class="column is-half">
                <b-field
                    label="Nombre"
                    :type="{ 'is-danger': errors.has('name') }"
                    :message="errors.first('name')"
                >
                    <b-input
                        v-model="store.name"
                        name="name"
                        v-validate="'required'"
                        icon="text"
                    />
                </b-field>
            </div>

            <!-- Address -->
            <div class="column is-half">
                <b-field label="Dirección">
                    <b-input v-model="store.address" icon="routes" />
                </b-field>
            </div>

            <!-- Phone number -->
            <div class="column is-half">
                <b-field label="Teléfono">
                    <b-input v-model="store.phone" icon="phone" />
                </b-field>
            </div>

            <div class="column is-half">
                <b-field label="ID Legal">
                    <b-input v-model="store.legal_id" icon="id-card" />
                </b-field>
            </div>

            <div class="column is-half">
                <b-field label="Moneda">
                    <b-input v-model="store.currency" icon="currency-usd" />
                </b-field>
            </div>

            <!-- Logo -->
            <div class="column is-half">
                <b-field label="Logo">
                    <b-upload @input="handleLogo" class="file-label">
                        <span class="file-cta">
                            <b-icon class="file-icon" icon="upload"></b-icon>
                            <span class="file-label"
                                >Click para seleccionar</span
                            >
                        </span>
                        <span class="file-name" v-if="store.file">
                            {{ store.file.name }}
                        </span>
                    </b-upload>
                </b-field>
            </div>

            <div class="column is-full">
                <b-button
                    icon-left="content-save"
                    type="is-success"
                    native-type="submit"
                    expanded
                >
                    Guardar
                </b-button>
            </div>
        </div>
    </form>
</template>

<script>
import { fileToBase64 } from '../../lib/filesys'

export default {
    name: 'store',

    data() {
        return {
            store: {},
            settingsId: undefined,
            logo: undefined
        }
    },

    methods: {
        async submitStoreForm() {
            if (!this.store.name) {
                return
            }

            const payload = { name: 'store', value: this.store }

            let updatedStore

            if (this.settingsId) {
                updatedStore = await Database.settings.update(
                    this.settingsId,
                    payload
                )
            } else {
                updatedStore = await Database.settings.add(payload)
            }

            this.showSuccess()

            this.getStoreData()
        },

        async handleLogo(e) {
            const imgBase64 = await fileToBase64(e)
            this.store.logo = imgBase64
        },

        async getStoreData() {
            const settings = await Database.settings.get({ name: 'store' })

            if (settings) {
                this.settingsId = settings.id

                this.store = { ...settings.value }
            }

            this.$store.commit('SET_STORE', settings.value)
        },

        showSuccess() {
            this.$buefy.toast.open({
                duration: 5000,
                message: 'Se guardaron los datos',
                type: 'is-success'
            })
        }
    },

    mounted() {
        this.getStoreData()
    }
}
</script>

<style lang="scss" scoped></style>
