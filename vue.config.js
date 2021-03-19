module.exports = {
    /* ... other config ... */
    transpileDependencies: ['vuex-persist'],
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true
        }
    },
    configureWebpack: {
        devtool: 'source-map'
    },

    css: {
        loaderOptions: {
            sass: {
                data: `@import 'src/assets/_variables.scss';`
            }
        }
    }
}
