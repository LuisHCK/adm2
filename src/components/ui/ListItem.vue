<template>
    <div class="list-item">
        <div class="list-item-title">
            {{ title }}
        </div>

        <p class="list-item-content">
            {{ content }}

            <slot />
        </p>
    </div>
</template>

<script>
export default {
    name: 'list-item',

    props: {
        title: {
            type: String,
            default: ''
        },

        content: {
            type: [String, Object, Number],
            default: ''
        }
    }
}
</script>

<style lang="scss" scoped>
@import 'src/assets/_variables';

.list-item {
    width: 100%;
    height: 64px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    &:not(:last-child) {
        border-bottom: 1px solid $light-gray;
    }

    &-title {
        font-size: 16px;
        font-weight: 600;
    }

    &-content {
        font-size: 14px;
    }
}
</style>
