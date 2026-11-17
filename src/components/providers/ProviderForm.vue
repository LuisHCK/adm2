<template>
    <form @submit.prevent="submit" class="provider-form">
        <div class="columns is-mobile is-multiline">
            <!-- Name -->
            <div class="column is-full">
                <b-field
                    label="Nombre*"
                    :type="nameError ? 'is-danger' : ''"
                    :message="nameError"
                >
                    <b-input
                        v-model="form.name"
                        placeholder="Nombre del Proveedor"
                        name="name"
                        icon="text"
                        @update:model-value="nameError = ''"
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
import database from "@/db"
import { validate } from '@/lib/validation'
import { toPlain } from '@/lib/serialization'

export default {
    name: 'provider-form',

    emits: ['submit'],

    props: {
        provider: {
            type: Object,
            default: undefined
        }
    },

    data() {
        return {
            form: {},
            nameError: ''
        }
    },

    methods: {
        async submit() {
            const { valid, errors } = await validate(
                this.form.name,
                'required',
            )
            this.nameError = valid ? '' : errors[0]

            if (!valid) {
                this.$buefy.toast.open({
                    message:
                        'No se pudieron guardar los cambios. Revisa el formulario',
                    type: 'is-danger',
                    position: 'is-bottom'
                })
                return
            }

            const date = new Date().toISOString()
            this.form.created_at = date
            this.form.updated_at = date

            if (this.provider) {
                this.updateProvider()
            } else {
                this.saveProvider()
            }
        },

        saveProvider() {
            database.provider.add(toPlain(this.form)).then(result => {
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
            database.provider.update(this.provider.id, toPlain(this.form)).then(() => {
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
