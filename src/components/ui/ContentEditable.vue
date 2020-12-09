<template>
    <div>
        <div @click="toggleEdit" v-if="!isEditing">
            <slot />
        </div>
        <b-field v-else>
            <b-input
                v-if="inputType !== 'number'"
                :placeholder="placeholder"
                :type="inputType"
                v-model="editedValue"
                size="is-small"
                ref="inputRef"
                @keydown.native="handleKeydown"
                @focus="handleFocus"
                rounded
            />

            <!-- Is safer to use specific number input -->
            <b-numberinput
                :placeholder="placeholder"
                v-model="editedValue"
                size="is-small"
                ref="inputRef"
                @keydown.native="handleKeydown"
                @focus="handleFocus"
                :controls="false"
                :min="0"
                rounded
            />
            <p class="control">
                <b-button
                    @click="emitEditedValue"
                    type="is-success"
                    icon-left="send"
                    size="is-small"
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
            value: 'text'
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
                    this.$refs.inputRef.focus()
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
