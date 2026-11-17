<template>
    <div>
        <div @click="toggleEdit" v-if="!isEditing">
            <slot />
        </div>
        <b-field v-else>
            <div @keydown="handleKeydown" style="display: contents;">
                <b-input
                    v-if="inputType !== 'number'"
                    :placeholder="placeholder"
                    :type="inputType"
                    v-model="editedValue"
                    size="is-small"
                    ref="inputRef"
                    @focus="handleFocus"
                    rounded
                />

                <!-- Is safer to use specific number input -->
                <b-numberinput
                    :placeholder="placeholder"
                    v-model="editedValue"
                    size="is-small"
                    ref="inputRef"
                    @focus="handleFocus"
                    :controls="false"
                    :min="0"
                    rounded
                />
            </div>
            <p class="control">
                <b-button
                    @click="emitEditedValue"
                    type="is-success"
                    icon-left="send"
                    size="is-small"
                    aria-label="Guardar"
                    rounded
                />
            </p>
        </b-field>
    </div>
</template>

<script>
export default {
    name: 'content-editable',

    props: {
        inputValue: {
            type: [Number, String, Object],
            default: ''
        },

        placeholder: {
            type: [String],
            default: ''
        },

        inputType: {
            type: String,
            default: 'text'
        }
    },

    data() {
        return {
            isEditing: false,
            editedValue: this.inputValue
                ? Number(this.inputValue.valueOf())
                : undefined
        }
    },

    methods: {
        toggleEdit() {
            this.isEditing = !this.isEditing

            if (this.isEditing) {
                setTimeout(() => {
                    const input = this.$refs.inputRef

                    if (input && typeof input.focus === 'function') {
                        input.focus()
                    } else if (input && input.$el) {
                        input.$el.focus()
                    }
                }, 150)
            }
        },

        emitEditedValue() {
            this.$emit('submit', this.editedValue)
            this.toggleEdit()
        },

        handleKeydown(event) {
            if (event.key === 'Enter') this.emitEditedValue()
        },

        handleFocus(event) {
            event.target ? event.target.select() : null
        }
    }
}
</script>

<style lang="scss" scoped></style>
