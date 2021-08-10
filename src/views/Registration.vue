<template>
    <div id="registration-page">
        <div class="panel">
            <div id="registration-carousel" class="panel-side">
                <registration-carousel />
            </div>

            <div id="registration-form" class="panel-side">
                <div class="form-container">
                    <h2 class="title is-2 has-text-centered">Crear cuenta</h2>
                    <form @submit.prevent="submitForm">
                        <h2 class="title is-5 has-text-grey">
                            Información personal
                        </h2>
                        <!-- Name -->
                        <b-field
                            label="Nombre completo"
                            :type="messages.name ? 'is-danger' : ''"
                            :message="messages.name"
                            rounded
                        >
                            <b-input
                                v-model="form.name"
                                placeholder="Nombre y apellido"
                                icon="text-short"
                                validation-message="Este campo es requerido"
                                required
                                rounded
                            />
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
                                icon="account"
                                validation-message="Este campo es requerido"
                                required
                                rounded
                            />
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
                                icon="lock"
                                placeholder="Al menos 6 caracteres"
                                validation-message="Este campo es requerido"
                                required
                                rounded
                            />
                        </b-field>

                        <hr />

                        <h2 class="title is-5 has-text-grey">
                            Datos de la tienda
                        </h2>

                        <b-field
                            label="Nombre"
                            :type="messages.company_name ? 'is-danger' : ''"
                            :message="messages.company_name"
                        >
                            <b-input
                                type="text"
                                v-model="form.company_name"
                                icon="domain"
                                placeholder="Se mostrará en los recibos"
                                validation-message="Este campo es requerido"
                                required
                                rounded
                            />
                        </b-field>

                        <hr />

                        <b-button
                            native-type="submit"
                            type="is-primary"
                            icon-left="send"
                            expanded
                            rounded
                        >
                            Crear cuenta
                        </b-button>

                        <b-upload
                            @input="importDatabase($event)"
                            :loading="importing"
                            class="w-100"
                        >
                            <a
                                class="button is-link is-rounded is-fullwidth mt-3"
                            >
                                <b-icon icon="upload"></b-icon>
                                <span>Importar copia de seguridad</span>
                            </a>
                        </b-upload>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import EventBus from '@/event-bus'
import { restoreDatabase } from '@/db/backup'
import { createSettings } from '@/controllers/settings'
import { registerUser, getTotalUsers } from '@/controllers/users'
import RegistrationCarousel from '@/components/registration/RegistrationCarousel.vue'

export default {
    name: 'Registration.vue',

    components: {
        RegistrationCarousel,
    },

    data() {
        return {
            form: {
                name: undefined,
                username: undefined,
                password: undefined,
                phone_number: undefined,
            },
            importing: false,
            messages: {},
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
                type: 'is-danger',
            })
        },

        notifySuccess(text) {
            this.$buefy.toast.open({
                duration: 3000,
                message: text,
                position: 'is-bottom',
                type: 'is-success',
            })
        },

        importDatabase(file) {
            if (file.type !== 'application/json') {
                return this.$buefy.dialog.alert({
                    title: 'Error de importación',
                    message: `<b>El archivo seleccionado no parece ser una copia de seguridad válida</b>.
                    </br>
                    Si tienes dudas por favor consulta el manual de usuario`,
                    type: 'is-danger',
                    hasIcon: true,
                    icon: 'alert-circle',
                    ariaRole: 'alertdialog',
                    ariaModal: true,
                })
            }
            restoreDatabase(Database, file)
        },

        async checkUsers() {
            const usersCount = await getTotalUsers()

            if (usersCount > 0) {
                return this.$router.push('/login')
            }
        },
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
    },
}
</script>

<style lang="scss" scoped>
@import '~bulma/sass/utilities/_all';

#registration-page {
    background-image: url('/solen-feyissa-iez9wUP_nFI-unsplash.jpeg');
    background-size: cover;
    background-position: center;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;

    .panel {
        width: 100%;
        max-width: 1080px;
        display: flex;
        flex-direction: row;
        margin: 0px 20px;
    }

    .panel-side {
        width: 50%;
    }

    .registration-carousel {
        height: 100%;
    }

    .form-container {
        padding: 20px 30px;
        height: 100%;
    }

    @include mobile {
        .form-container {
            margin: 0px 0px;
        }

        .panel {
            width: 100%;
        }
    }

    @include mobile {
        .panel-side {
            width: 100%;
        }

        #registration-carousel {
            display: initial;
        }

        #registration-form {
            display: none;
        }
    }
}
</style>
