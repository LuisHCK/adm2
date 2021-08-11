export const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
]

export const daysAbr = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']

export const days = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
]

/**
 * Remove all accents and normalize a string
 * @param {string} textValue Text to normalize
 * @returns string
 */
export const normalizeText = textValue => {
    if (typeof textValue === 'string') {
        return textValue.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    } else {
        return textValue
    }
}
