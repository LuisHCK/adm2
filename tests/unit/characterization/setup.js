import 'fake-indexeddb/auto'

// The legacy DB module assigns the instance to `window.Database`.
// Provide browser-like globals in the Node test environment.
if (typeof globalThis.window === 'undefined') {
    globalThis.window = globalThis
}
if (typeof globalThis.self === 'undefined') {
    globalThis.self = globalThis
}

// Some legacy modules read localStorage at import time.
if (typeof globalThis.localStorage === 'undefined') {
    const storage = new Map()

    globalThis.localStorage = {
        getItem: key => (storage.has(key) ? storage.get(key) : null),
        setItem: (key, value) => storage.set(key, String(value)),
        removeItem: key => storage.delete(key),
        clear: () => storage.clear(),
    }
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
