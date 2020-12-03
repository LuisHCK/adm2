<template>
    <div id="login-page">
        <div class="form-container">
            <div class="title">
                Iniciar sesión
            </div>
            <form @submit.prevent="doLogin">
                <b-field label="Nombre de usuario" type="is-dange">
                    <b-input v-model="form.auth"></b-input>
                </b-field>
                <b-field label="Contraseña">
                    <b-input
                        type="password"
                        v-model="form.password"
                        password-reveal
                    ></b-input>
                </b-field>
                <div class="form-group">
                    <b-button type="is-primary" native-type="submit" expanded>
                        Iniciar sesión
                    </b-button>
                </div>
            </form>

            <b-notification
                type="is-danger"
                aria-close-label="Close notification"
                role="alert"
                class="mt-4"
                v-model="showError"
            >
                Nombre de usuario o contraseña inválidos
            </b-notification>
        </div>

        <div class="helper-bar">
            <a href="#">Soporte técnico</a>
            <a href="#">Política de privacidad </a>
            <a href="#">Novedades</a>
            <a href="#">
                <b-icon icon="facebook-messenger" />
            </a>
            <a href="#">
                <b-icon icon="whatsapp" />
            </a>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { logIn } from '../lib/auth'
export default {
    name: 'Login',

    computed: {
        ...mapGetters(['userCount'])
    },

    data() {
        return {
            form: {
                auth: undefined,
                password: undefined
            },
            totalUsers: undefined,
            showError: false
        }
    },

    methods: {
        async doLogin() {
            if (!this.form.auth || !this.form.password) {
                return (this.showError = true)
            }

            const result = await logIn(this.form.auth, this.form.password)
            if (result) {
                this.$router.push({ name: 'home' })
            } else {
                this.showError = true
            }
        }
    },

    created() {
        this.userCount.then(count => (this.totalUsers = count))
    },

    created() {
        // Redirect to Registration if not users
        this.$store.getters.userCount.then(count => {
            if (!count) {
                return this.$router.push('/registration')
            }
        })
    }
}
</script>

<style lang="scss" scoped>
#login-page {
    background-image: url('/photo-1605287792145-c6102b500214.jpeg');
    background-size: cover;
    background-position: center;
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

.helper-bar {
    width: 100%;
    height: 48px;
    position: absolute;
    bottom: 0;
    left: 0;
    background-color: transparentize($color: #000000, $amount: 0.5);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;

    a {
        color: white;
        margin-right: 2%;
        margin-left: 2%;
    }
}
</style>
