import { render } from 'ejs'
import { printContentent } from '../../lib/print'
import template from './template.ejs'

/**
 * @typedef RenderProps
 * @property {Array} columns
 * @property {Array} data
 * @property {Object} shop
 * @property {sting} title
 * @property {string} created_at
 * @property {string} created_by
 * @property {string} notes
 */

/**
 * Render a the report
 * @param {RenderProps} param0
 */
const renderReport = ({
    columns,
    data,
    shop,
    title,
    created_at,
    created_by,
    notes
}) => {
    const renderedTemplate = render(template, {
        columns,
        data,
        shop,
        title,
        created_at,
        created_by,
        notes
    })
    printContentent(renderedTemplate, title)
}

export default renderReport
