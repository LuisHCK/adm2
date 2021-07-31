<template>
    <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
            <p class="modal-card-title">Login</p>
            <button type="button" class="delete" @click="$emit('close')" />
        </header>

        <section class="modal-card-body">
            <slot />
        </section>
    </div>
</template>

<script>
export default {
    name: 'modal-card',
}
</script>
