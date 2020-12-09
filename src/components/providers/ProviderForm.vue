<template>
    <form @submit.prevent="submit" class="provider-form">
        <div class="columns is-mobile is-multiline">
            <!-- Name -->
            <div class="column is-full">
                <b-field
                    label="Nombre*"
                    :type="{ 'is-danger': errors.has('name') }"
                    :message="errors.first('name')"
                >
                    <b-input
                        v-model="form.name"
                        placeholder="Nombre del Proveedor"
                        name="name"
                        v-validate="'required'"
                        icon="text"
                    />
                </b-field>
            </div>

            <!-- phone #1 -->
            <div class="column is-half">
                <b-field label="Dirección">
                    <b-input
                        v-model="form.address"
                        icon="map-marker"
                        placeholder="Dirección"
                    />
                </b-field>
            </div>

            <!-- phone #1 -->
            <div class="column is-half">
                <b-field label="Teléfono">
                    <b-input
                        v-model="form.phone"
                        placeholder="Número de teléfono"
                        icon="phone"
                    />
                </b-field>
            </div>

            <!-- phone #2 -->
            <div class="column is-half">
                <b-field label="Teléfono secundario">
                    <b-input
                        v-model="form.phone_alt"
                        placeholder="Número de teléfono"
                        icon="phone"
                    />
                </b-field>
            </div>

            <!-- email -->
            <div class="column is-half">
                <b-field label="Email">
                    <b-input
                        v-model="form.email"
                        placeholder="Correo electrónico"
                        icon="email"
                    />
                </b-field>
            </div>

            <div class="column is-full">
                <b-field label="Notas">
                    <b-input type="textarea" v-model="form.notes" icon="text" />
                </b-field>
            </div>

            <div class="column is-full">
                <b-button
                    type="is-success"
                    native-type="submit"
                    icon-left="content-save"
                    expanded
                >
                    Cuardar
                </b-button>
            </div>
        </div>
    </form>
</template>

<script>
export default {
    name: 'provider-form',

    props: {
        provider: {
            type: Object,
            default: undefined
        }
    },

    data() {
        return {
            form: {}
        }
    },

    methods: {
        submit() {
            const date = new Date().toISOString()
            this.form.created_at = date
            this.form.updated_at = date

            this.$validator.validateAll().then(result => {
                if (result) {
                    if (this.provider) {
                        this.updateProvider()
                    } else {
                        this.saveProvider()
                    }
                } else {
                    this.$buefy.toast.open({
                        message:
                            'No se pudieron guardar los cambios. Revisa el formulario',
                        type: 'is-danger',
                        position: 'is-bottom'
                    })
                }
            })
        },

        saveProvider() {
            Database.provider.add(this.form).then(result => {
                this.$emit('submit')
                this.form = {}
                this.$buefy.toast.open({
                    message: 'Se guardó el nuevo proveedor',
                    type: 'is-success',
                    position: 'is-bottom'
                })
            })
        },

        updateProvider() {
            delete this.form.id
            Database.provider.update(this.provider.id, this.form).then(() => {
                this.$emit('submit')
                this.form = {}
                this.$buefy.toast.open({
                    message: 'Se actualizó el proveedor',
                    type: 'is-success',
                    position: 'is-bottom'
                })
            })
        }
    },

    mounted() {
        if (this.provider) {
            this.form = Object.assign({}, this.provider)
        }
    }
}
</script>

<style lang="scss" scoped></style>
