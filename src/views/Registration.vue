<template>
    <div id="registration-page">
        <div class="form-container">
            <form @submit.prevent="submitForm">
                <!-- Name -->
                <b-field
                    label="Nombre completo"
                    :type="messages.name ? 'is-danger' : ''"
                    :message="messages.name"
                >
                    <b-input
                        v-model="form.name"
                        placeholder="Nombre y apellido"
                    ></b-input>
                </b-field>

                <!-- Username -->
                <b-field
                    label="Nombre de usuario"
                    :type="messages.username ? 'is-danger' : ''"
                    :message="messages.username"
                >
                    <b-input
                        v-model="form.username"
                        placeholder="Nombre de usuario para inicio de sesión"
                    >
                    </b-input>
                </b-field>

                <!-- Password -->
                <b-field
                    label="Constraseña"
                    :type="messages.phone ? 'is-danger' : ''"
                    :message="messages.phone"
                >
                    <b-input
                        type="password"
                        v-model="form.password"
                        password-reveal
                    ></b-input>
                </b-field>

                <b-field
                    label="Nombre de la tienda"
                    :type="messages.company_name ? 'is-danger' : ''"
                    :message="messages.company_name"
                >
                    <b-input
                        type="text"
                        v-model="form.company_name"
                    >
                    </b-input>
                </b-field>

                <!--  -->
                <div class="form-group buttons">
                    <button class="button is-primary" type="submit">
                        Crear cuenta
                    </button>
                    <b-upload
                        @input="importDatabase($event)"
                        :loading="importing"
                    >
                        <a class="button is-link">
                            <b-icon icon="upload"></b-icon>
                            <span>Importar copia de seguridad</span>
                        </a>
                    </b-upload>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import EventBus from '../event-bus'
import { restoreDatabase } from '../db/backup'
import { createSettings } from '../controllers/settings'
import { registerUser, getTotalUsers } from '../controllers/users'

export default {
    name: 'Registration.vue',
    data() {
        return {
            form: {
                name: undefined,
                username: undefined,
                password: undefined,
                phone_number: undefined
            },
            importing: false,
            messages: {}
        }
    },

    // Component methods
    methods: {
        validateForm() {
            if (!this.form.name) this.messages.name = 'El nombre es requerido'

            if (!this.form.username)
                this.messages.username = 'El nombre de usuario es requerido'

            if (!this.form.password)
                this.messages.password = 'Por favor escribe una contraseña'

            if (!this.form.company_name)
                this.messages.company_name =
                    'Por favor indica el nombre de la empresa'

            if (
                !this.form.password ||
                !this.form.username ||
                !this.form.password
            )
                return false
            else return true
        },

        async submitForm() {
            if (this.validateForm()) {
                // Register new usuer
                try {
                    const newUser = await registerUser(this.form)
                    this.$store.commit('setUser', newUser)
                } catch (error) {
                    console.error(error)
                    this.notifyError('Ocurrió un error al guardar')
                }

                this.setStoreName(this.form.company_name)
                this.notifySuccess('Se guardó el nuevo usuario')
                this.$router.push('/')
            } else {
                this.notifyError('Por favor verifica los datos introducidos')
            }
        },

        async setStoreName(name) {
            this.$store.commit('SET_STORE', { name: name })
            await createSettings({ name: 'store', value: { name } })
        },

        notifyError(text) {
            this.$buefy.toast.open({
                duration: 3000,
                message: text,
                position: 'is-bottom',
                type: 'is-danger'
            })
        },

        notifySuccess(text) {
            this.$buefy.toast.open({
                duration: 3000,
                message: text,
                position: 'is-bottom',
                type: 'is-success'
            })
        },

        importDatabase(file) {
            restoreDatabase(Database, file)
        },

        async checkUsers() {
            const usersCount = await getTotalUsers()

            if (usersCount > 0) {
                return this.$router.push('/login')
            }
        }
    },

    beforeMount() {
        this.checkUsers()
    },

    mounted() {
        EventBus.$on('EXPORTING_DB', progress => {
            this.importing = true
        })

        EventBus.$on('IMPORT_FINISH', progress => {
            this.importing = false
            this.$router.push('/login')
        })
    }
}
</script>

<style lang="scss" scoped>
#registration-page {
    background-image: url('/blake-wisz-GFrBMipOd_E-unsplash.jpg');
    background-size: cover;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    .form-container {
        border-radius: 6px;
        border: 1px solid rgb(177, 177, 177);
        background-color: rgb(252, 252, 252);
        min-height: 100%;
        min-width: 450px;
        padding: 20px;
    }
}
</style>
