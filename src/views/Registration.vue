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
                    label="Empresa"
                    :type="messages.company_name ? 'is-danger' : ''"
                    :message="messages.company_name"
                >
                    <b-input
                        type="text"
                        v-model="form.company_name"
                        placeholder="Nombre de la empresa o compañía"
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
import EventBus from '@/event-bus'
import { hashSync } from '../lib/auth'
import { restoreDatabase } from '@/db/backup'

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

        submitForm() {
            if (this.validateForm()) {
                // Set password hash
                this.form.password_digest = hashSync(this.form.password)
                delete this.form.password
                // Register new usuer
                Database.user
                    .add(this.form)
                    .then(user => {
                        this.notifySuccess('Se guardó el nuevo usuario')
                        // Store current user
                        this.$store.commit('setUser', user)
                        // Save store.name
                        this.SET_STOREName(this.form.company_name)
                        // Redirect to path
                        this.$router.push('/')
                    })
                    .catch(err => {
                        console.log(err)
                        this.notifyError('Ocurrió un error al guardar')
                    })
            } else {
                this.notifyError('Por favor verifica los datos introducidos')
            }
        },

        SET_STOREName(name) {
            this.$store.commit('SET_STORE', { name: name })
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
            const usersCount = await Database.user.count()

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
