<template>
    <b-carousel
        ref="carousel"
        class="registration-carousel"
        :autoplay="false"
        has-drag
    >
        <b-carousel-item
            v-for="item in carouselItems"
            :key="'carousel-item-' + item.id"
        >
            <div
                class="registration-message"
                :style="{
                    backgroundImage: `url('${item.backgroundImage}')`,
                }"
            >
                <h1 class="title is-2">{{ item.title }}</h1>

                <p class="is-size-4">{{ item.blurb }}</p>

                <template v-if="item.callToAction && item.callToActionText">
                    <b-button
                        class="mt-6"
                        size="is-medium"
                        :type="item.buttonType || 'is-primary'"
                        @click="item.callToAction()"
                        rounded
                    >
                        {{ item.callToActionText }}
                    </b-button>
                </template>
            </div>
        </b-carousel-item>
    </b-carousel>
</template>

<script>
export default {
    name: 'registration-carousel',

    computed: {
        carouselItems() {
            return [
                {
                    title: 'Toma el control de tu tienda',
                    blurb:
                        'ADM2 es la herramienta que llevará tu tienda al próximo nivel',
                    backgroundImage: 'pattern-bg-1.jpeg',
                    callToActionText: 'Siguiente',
                    callToAction: () => this.nextSlide(),
                    buttonType: 'is-dark',
                    id: 1,
                },
                {
                    title: 'Disfruta de una experiencia moderna',
                    blurb: `Enfocado en ofrecer una experiencia moderna y cómoda, ADM2
                    está diseñado especialmente para tiendas como la tuya`,
                    backgroundImage: 'pattern-bg-2.jpeg',
                    callToActionText: 'Siguiente',
                    callToAction: () => this.nextSlide(),
                    buttonType: 'is-dark',
                    id: 2,
                },
                {
                    title: '¿Estás listo para empezar?',
                    blurb: `Completa el formulario que se muestra a continuación y comienza a descrubir
                    las increíbles funcionalidades que hemos creado para tí`,
                    backgroundImage: 'pattern-bg-3.jpeg',
                    callToActionText: 'Continuar',
                    callToAction: () => this.displayForm(),
                    buttonType: 'is-success',
                    id: 3,
                },
            ]
        },
    },

    methods: {
        displayForm() {
            const isDesktop = window.innerWidth > 768

            if (isDesktop) {
                return
            }

            const registrationCarousel = document.getElementById(
                'registration-carousel',
            )
            const registrationForm = document.getElementById(
                'registration-form',
            )

            if (registrationCarousel.style.display !== 'none') {
                registrationCarousel.style.display = 'none'
            }

            if (registrationForm.style.display !== 'unset') {
                registrationForm.style.display = 'unset'
            }
        },

        nextSlide() {
            this.$refs.carousel.next()
        },
    },
}
</script>

<style lang="scss" scoped>
@import '~bulma/sass/utilities/_all';

.registration-carousel {
    height: 100%;
    margin: -9px 0px -9px -9px;
}

.registration-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 680px;

    padding: 20px;

    background-size: cover;
    background-repeat: no-repeat;

    text-align: center;
    & * {
        color: white;
    }
}

@include mobile {
    .registration-carousel {
        margin: -9px;
    }
}
</style>
