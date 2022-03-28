const userAgent = navigator.userAgent;

/**
 * This file helps decrease build size for more than 10Kb.
 *
 *
 * How to use in WEBPACK:
 *  resolve: {
 *    alias: {
 *      'fbjs/lib/UserAgent': path.join(__dirname, '/node_modules/medium-draft-ts/dist/esm/util/DraftJSUserAgent.js'),
 *    }
 *  },
 *
 *
 * How to use in ROLLUP:
 *  plugins: [
 *    alias({
 *      entries: [
 *        {
 *          find: 'fbjs/lib/UserAgent',
 *          replacement: path.join(__dirname, '/node_modules/medium-draft-ts/dist/esm/util/DraftJSUserAgent.js'),
 *        }
 *      ]
 *    })
 *  ],
 *
 *
 */
export default {
    isBrowser: (request: string): boolean => {
        switch (request) {
            case 'IE <= 11':
                return /MSIE/.test(userAgent) && !/rv:11\.0/.test(userAgent);

            case 'IE':
                return /MSIE/.test(userAgent);

            case 'Chrome':
                return /Chrome/.test(userAgent);

            case 'Firefox':
                return /Firefox/.test(userAgent);

            case 'Chrome < 60.0.3081.0':
                const execResult = /Chrome\/([\d]+)/.exec(userAgent);

                if (execResult && execResult[1]) {
                    const version = parseInt(execResult[1], 10);

                    // tslint:disable-next-line:no-magic-numbers
                    return version < 60;
                }
                break;
        }

        /*
        if (request === 'Firefox < 29') {
            return false;
        }

        if (request === 'IE <= 9') {
            return false;
        }
        */

        return false;
    },
    isEngine: (request: string): boolean => {
        if (request === 'Gecko') {
            return /Gecko/.test(userAgent);
        }

        return false;
    },
    isPlatform: (request: string): boolean => {
        if (request === 'Mac OS X') {
            return /Mac OS X/.test(userAgent);
        }

        return false;
    }
};
