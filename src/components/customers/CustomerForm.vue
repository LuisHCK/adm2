<template>
    <form @submit.prevent="submit">
        <!-- Name -->
        <b-field label="Nombre*">
            <b-input
                v-model="form.name"
                placeholder="Nombre del cliente"
            ></b-input>
        </b-field>
        <!-- phone -->
        <b-field label="Teléfono">
            <b-input
                v-model="form.phone"
                placeholder="Número de teléfono"
            ></b-input>
        </b-field>
        <!-- email -->
        <b-field label="Email">
            <b-input
                v-model="form.email"
                placeholder="Correo electrónico"
            ></b-input>
        </b-field>
        <!-- address -->
        <b-field label="Direccion">
            <b-input
                v-model="form.address"
                placeholder="Domicilio del cliente"
            ></b-input>
        </b-field>

        <b-field>
            <button type="submit" class="button is-primary is-fullwidth">
                Guardar
            </button>
        </b-field>
    </form>
</template>

<script>
export default {
    name: 'customer-form',

    data() {
        return {
            form: {},
        }
    },

    methods: {
        submit() {
            if (this.form.name) {
                this.form.created_at = new Date().toISOString()
                this.form.updated_at = new Date().toISOString()
                Database.customer
                    .add(this.form)
                    .then(data => {
                        this.showToast('Se guardó el nuevo cliente')
                        this.$emit('input')
                        this.$emit('onSave')
                    })
                    .catch(err => {
                        console.log(err)
                    })
            } else {
                this.showToast('El nombre es requerido', 'is-danger')
            }
        },

        showToast(message, type = 'is-success') {
            this.$buefy.toast.open({
                message: message,
                type: type,
                position: 'is-bottom',
            })
        },
    },
}
</script>

<style lang="scss" scoped></style>
