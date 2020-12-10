import { importDB, exportDB, importInto } from 'dexie-export-import'
import FileSaver from 'file-saver'
import * as moment from 'moment'
import EventBus from '../event-bus'

let progress = 0

// Database export
function backupDatabase(database) {
    // Notify progress
    EventBus.$emit('EXPORTING_DB', progress)

    return exportDB(database, { progressCallback })
        .then(blob => {
            FileSaver.saveAs(blob, `${getFilename()}.json`)
        })
        .catch(err => {
            console.error(err)
        })
        .finally(() => {
            EventBus.$emit('IMPORT_FINISH')
        })
}

function restoreDatabase(database, blob) {
    EventBus.$buefy.dialog.confirm({
        title: '¡CUIDADO!',
        message: `Está a punto de cargar una copia de seguridad, esta opción
      <b>sobreescribirá cualquier información</b> que haya creado anteriormente.<br/>
      ¿Deseas continuar?`,
        confirmText: 'Si, contunar',
        cancelText: 'Cancelar',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: () => {
            EventBus.$emit('IMPORTING_DB', progress)
            importInto(database, blob, {
                progressCallback,
                overwriteValues: true,
                clearTablesBeforeImport: true
            })
                .then(db => {
                    setTimeout(() => {
                        location.reload(true)
                    }, 500)
                })
                .catch(err => {
                    console.error(err)
                })
                .finally(EventBus.$emit('IMPORT_FINISH'))
        }
    })
}

/**
 * Print progress
 * @param {Object} options
 */
function progressCallback({ totalRows, completedRows }) {
    progress = (100 * completedRows) / totalRows
}

function getFilename() {
    return moment().format('lll')
}

export { backupDatabase, restoreDatabase }
