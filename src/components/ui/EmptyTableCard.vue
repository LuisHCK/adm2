<template>
    <section class="section" :class="customClass">
        <div class="content has-text-grey has-text-centered">
            <p>
                <b-icon :icon="icon" size="is-large" />
            </p>
            <p>
                {{ label }}
            </p>
        </div>
    </section>
</template>

<script>
export default {
    name: 'empty-table-card',

    props: {
        icon: {
            type: String,
            default: 'package-variant'
        },

        customClass: {
            type: String,
            default: ''
        },

        label: {
            type: String,
            default: 'No hay elementos para mostrar'
        }
    }
}
</script>
