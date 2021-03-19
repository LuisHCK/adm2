<template>
    <div class="panel">
        <div class="card-image">
            <figure
                class="image"
                :style="{ backgroundImage: `url('${image}')` }"
            >
                <span
                    class="value has-text-white is-size-2-desktop is-size-3-mobile has-text-weight-bold"
                >
                    {{ total }}
                </span>
            </figure>
        </div>
        <div class="card-content">
            <div class="content has-text-centered">
                <div class="is-size-4-desktop is-size-5-mobile">
                    {{ title }}
                </div>
            </div>
        </div>
        <div class="card-footer">
            <a @click="$router.push(`/${linkTo}`)" class="card-footer-item">
                {{ linkLabel }}
            </a>
        </div>
    </div>
</template>

<script>
export default {
    name: 'info-card',

    props: {
        total: {
            type: [Number, String],
            default: 0
        },

        title: {
            type: String,
            default: ''
        },

        linkTo: {
            type: String,
            default: ''
        },

        linkLabel: {
            type: String,
            default: ''
        },

        image: {
            type: String,
            default: ''
        }
    }
}
</script>

<style lang="scss" scoped>
@import "~bulma/sass/utilities/_all";

.image {
    background-size: cover;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;

    @include mobile {
        height: 100px;
        background-position: center;
    }
}
</style>
