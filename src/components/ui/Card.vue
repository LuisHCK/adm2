<template>
    <div class="card">
        <header class="card-header">
            <slot name="title">
                <p class="card-header-title">
                    {{ title }}
                </p>
            </slot>
        </header>
        <div class="card-content">
            <div class="content">
                <slot />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'card',

    props: {
        title: {
            type: String,
            default: ''
        }
    }
}
</script>

<style lang="scss" scoped></style>
