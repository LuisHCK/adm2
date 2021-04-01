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
                additionalData: `@import 'src/assets/_variables.scss';`
            }
        }
    },

    chainWebpack: config => {
        config.module
            .rule('rawloader')
            .test(/\.(txt|html|ejs)$/)
            .use('raw-loader')
            .loader('raw-loader')
    }
}
