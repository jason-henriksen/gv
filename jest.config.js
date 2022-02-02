export default {
    globals: {
        extensionsToTreatAsEsm: ['.ts', '.js'],


        'ts-jest': {
            tsconfig:'tsconfig.json',
            target: "esnext",  // DO NOT CHANGE!
            module: "esnext",  // DO NOT CHANGE!

        }
    },

    preset: 'ts-jest/presets/js-with-ts-esm',
    testTimeout: 15000,

    // from https://stackoverflow.com/a/57916712/15076557
    transformIgnorePatterns: [
//        'node_modules/(?!(module-that-needs-to-be-transformed)/)'
    ],
    testPathIgnorePatterns:[
      "/node_modules/",
      "dist"
    ]
  }