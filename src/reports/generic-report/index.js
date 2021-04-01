import { render } from 'ejs'
import { printContentent } from '../../lib/print'
import template from './template.ejs'

/**
 * @typedef RenderProps
 * @property {Array} columns
 * @property {Array} data
 * @property {Object} shop
 * @property {sting} title
 */

/**
 * Render a the report
 * @param {RenderProps} param0
 */
const renderReport = ({ columns, data, shop, title }) => {
    const renderedTemplate = render(template, { columns, data, shop, title })
    printContentent(renderedTemplate, title)
}

export default renderReport
