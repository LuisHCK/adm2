import 'fake-indexeddb/auto'

// The legacy DB module assigns the instance to `window.Database`.
// Provide browser-like globals in the Node test environment.
if (typeof globalThis.window === 'undefined') {
    globalThis.window = globalThis
}
if (typeof globalThis.self === 'undefined') {
    globalThis.self = globalThis
}

// dexie-export-import (v1) reads blobs with FileReader, which Node lacks.
if (typeof globalThis.FileReader === 'undefined') {
    globalThis.FileReader = class FileReader {
        readAsText(blob) {
            blob
                .text()
                .then(result => {
                    this.result = result
                    if (this.onload) this.onload({ target: this })
                })
                .catch(error => {
                    this.error = error
                    if (this.onerror) this.onerror({ target: this })
                })
        }

        readAsArrayBuffer(blob) {
            blob
                .arrayBuffer()
                .then(result => {
                    this.result = result
                    if (this.onload) this.onload({ target: this })
                })
                .catch(error => {
                    this.error = error
                    if (this.onerror) this.onerror({ target: this })
                })
        }
    }
}
