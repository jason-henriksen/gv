
const path = require( 'path' );

module.exports = {

    target: 'node',
    // bundling mode
    mode: 'production',

    // entry files
    entry: './src/main/cli.ts',

    // output bundles (location)
    output: {
        path: path.resolve( __dirname, 'dist' ),
        filename: 'main.cjs',
    },

    // file resolutions
    resolve: {
        extensions: [ '.ts', '.js' ],
    },

    // loaders
    module: {
        rules: [
            {
                test: /\.tsx?/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    }
};