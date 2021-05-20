<template>
    <form @submit.prevent="submit">
        <div class="columns is-mobile is-multiline">
            <!-- Name -->
            <div class="column is-half-desktop is-full-mobile">
                <b-field
                    label="Nombre*"
                    :type="messages.name ? 'is-danger' : ''"
                    :message="messages.name"
                >
                    <b-input
                        v-model="form.name"
                        placeholder="Nombre del producto"
                    ></b-input>
                </b-field>
            </div>

            <!-- Brand -->
            <div class="column is-half-desktop is-full-mobile">
                <b-field
                    label="Marca*"
                    :type="messages.brand ? 'is-danger' : ''"
                    :message="messages.brand"
                >
                    <b-input
                        v-model="form.brand"
                        placeholder="Marca del producto"
                    ></b-input>
                </b-field>
            </div>

            <!-- Presentation -->
            <div class="column is-half-desktop is-full-mobile">
                <b-field label="Presentación">
                    <b-input
                        v-model="form.content"
                        placeholder="Presentación del producto"
                    ></b-input>
                </b-field>
            </div>

            <!-- Unit -->
            <div class="column is-half-desktop is-full-mobile">
                <b-field
                    label="Unidad*"
                    :type="messages.unit ? 'is-danger' : ''"
                    :message="messages.unit"
                >
                    <b-input
                        v-model="form.unit"
                        placeholder="Unidad de medida"
                    ></b-input>
                </b-field>
            </div>

            <!-- Codebar -->
            <div class="column is-half-desktop is-full-mobile">
                <b-field label="Codigo">
                    <b-input
                        v-model="form.codebar"
                        placeholder="Codigo o codigo de barras"
                    ></b-input>
                </b-field>
            </div>

            <!-- Categories -->
            <div class="column is-half-desktop is-full-mobile">
                <b-field label="Categorías">
                    <b-taginput
                        v-model="form.categories"
                        ellipsis
                        icon="label"
                        placeholder="Agregar categorías"
                    ></b-taginput>
                </b-field>
            </div>

            <!-- Status -->
            <div class="column is-half-desktop is-full-mobile">
                <b-field label="Estatus">
                    <b-select
                        v-model="form.status"
                        placeholder="Estus del producto"
                    >
                        <option
                            v-for="(option, i) in statuses"
                            :value="option"
                            :key="'opt' + i"
                            >{{ option }}</option
                        >
                    </b-select>
                </b-field>
            </div>

            <div class="column is-full">
                <!-- Providers -->
                <b-field label="Proveedores">
                    <b-taginput
                        placeholder="Seleccionar proveedores"
                        @typing="getFilteredProviders"
                        v-model="selectedProviders"
                        :data="filteredProviders"
                        type="is-primary"
                        icon="label"
                        field="name"
                        autocomplete
                        rounded
                    />
                </b-field>
            </div>

            <div class="column is-full">
                <!-- Description -->
                <b-field label="Descripción">
                    <b-input
                        v-model="form.description"
                        type="textarea"
                    ></b-input>
                </b-field>
            </div>

            <div class="column is-full">
                <b-button
                    native-type="submit"
                    type="is-success"
                    icon-left="content-save"
                    rounded
                >
                    Guardar
                </b-button>
            </div>
        </div>
    </form>
</template>

<script>
export default {
    name: 'product-form',

    props: {
        product: {
            type: Object,
            default: () => {}
        },
        productId: Number
    },

    data() {
        return {
            form: {
                name: undefined,
                brand: undefined,
                unit: undefined
            },
            messages: {},
            statuses: ['activo', 'en revisión', 'deshabilitado'],
            providers: [],
            filteredProviders: [],
            selectedProviders: []
        }
    },

    methods: {
        submit() {
            if (this.form.name && this.form.brand && this.form.unit) {
                if (this.selectedProviders) {
                    this.form.providers = this.selectedProviders.map(p => p.id)
                }

                this.$emit('submit', this.form)
            } else {
                this.notifyError('Por favor revise el formulario')
                this.showMessages()
            }
        },

        showMessages() {
            if (!this.form.name) {
                this.messages.name = 'Este campo es requerido'
            }
            if (!this.form.brand) {
                this.messages.brand = 'Este campo es requerido'
            }
            if (!this.form.unit) {
                this.messages.unit = 'Este campo es requerido'
            }
            this.$forceUpdate()
        },

        notifyError(text) {
            this.$buefy.toast.open({
                duration: 3000,
                message: text,
                position: 'is-bottom',
                type: 'is-danger'
            })
        },

        /**
         * Load product from db using ID prop
         */
        async getProduct(id) {
            this.form = await Database.product.get(id)
        },

        async getProviders() {
            this.providers = await Database.provider.toArray()
            this.selectedProviders = this.providers.filter(p =>
                this.form.providers ? this.form.providers.includes(p.id) : false
            )
        },

        getFilteredProviders(text) {
            this.filteredProviders = this.providers.filter(option => {
                return (
                    option.name
                        .toString()
                        .toLowerCase()
                        .indexOf(text.toLowerCase()) >= 0
                )
            })
        }
    },

    mounted() {
        if (this.productId) {
            this.getProduct(this.productId)
        }
        this.getProviders()
    }
}
</script>

<style lang="scss" scoped></style>
