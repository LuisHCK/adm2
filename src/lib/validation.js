import { defineRule, validate } from 'vee-validate'

defineRule('required', value => {
    const isEmpty =
        value === null ||
        value === undefined ||
        String(value).trim() === ''

    return isEmpty ? 'Este campo es obligatorio' : true
})

export { validate }
