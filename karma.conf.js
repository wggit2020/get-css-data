// Dependencies
// =============================================================================
const fs           = require('fs');
const pkg          = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const { execSync } = require('child_process');


// Variables
// =============================================================================
const files = {
    fixtures: './tests/fixtures/**/*',
    test    : './tests/**/*.test.js'
};
const gitInfo = {
    branch   : execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
    commitMsg: execSync('git log -1 --pretty=%B').toString().trim(),
    isClean  : Boolean(execSync('[[ -n $(git status -s) ]] || echo "clean"').toString().trim()),
    isDirty  : Boolean(execSync('[[ -z $(git status -s) ]] || echo "dirty"').toString().trim())
};


// Settings
// =============================================================================
const settings = {
    files: [
        'node_modules/@babel/polyfill/dist/polyfill.js',
        files.test,
        // Served only (Access in tests by prepending /base/ to path)
        { pattern: files.fixtures, included: false, served: true, watched: true }
    ],
    preprocessors: {
        [files.fixtures]: ['file-fixtures'],
        [files.test]    : ['eslint', 'webpack', 'sourcemap']
    },
    frameworks: ['mocha', 'chai', 'webpack'],
    reporters : ['mocha', 'coverage-istanbul'], // 'Browserstack' added below
    fileFixtures: {
        stripPrefix: 'tests/fixtures/'
    },
    webpack: {
        mode  : 'development',
        module: {
            rules: [
                {
                    test   : /\.js$/,
                    exclude: [/node_modules/],
                    use    : [
                        {
                            loader : 'babel-loader',
                            options: {
                                // See .babelrc
                                plugins: [
                                    ['istanbul', { exclude: 'tests/*' }]
                                ]
                            },
                        }
                    ]
                }
            ]
        }
    },
    webpackMiddleware: {
        // https://webpack.js.org/configuration/stats/
        stats: 'minimal'
    },
    // Code coverage
    // https://github.com/mattlewis92/karma-coverage-istanbul-reporter
    coverageIstanbulReporter: {
        reports                : ['lcovonly', 'text-summary'],
        combineBrowserReports  : true,
        fixWebpackSourcePaths  : true,
        skipFilesWithNoCoverage: true
    },
    mochaReporter: {
        // https://www.npmjs.com/package/karma-mocha-reporter
        output: 'autowatch'
    },
    autoWatch  : false,
    colors     : true,
    concurrency: Infinity,
    port       : 9876,
    singleRun  : true,
    // browserDisconnectTimeout  : 1000*10, // default 2000
    // browserDisconnectTolerance: 1,       // default 0
    // browserNoActivityTimeout  : 1000*30, // default 10000
    // captureTimeout            : 1000*60, // default 60000
    client: {
        mocha: {
            timeout: 1000*5 // default 2000
        }
    }
};


// Export
// =============================================================================
module.exports = function(config) {
    const isRemote = Boolean(process.argv.indexOf('--remote') > -1);

    // Remote test
    if (isRemote) {
        // Browsers
        // https://www.browserstack.com/automate/capabilities
        settings.customLaunchers = {
            bs_chrome: {
                base           : 'BrowserStack',
                browser        : 'Chrome',
                browser_version: '48.0',
                os             : 'Windows',
                os_version     : '10'
            },
            bs_firefox: {
                base           : 'BrowserStack',
                browser        : 'Firefox',
                browser_version: '32',
                os             : 'Windows',
                os_version     : '10'
            },
            bs_ie_9: {
                base           : 'BrowserStack',
                browser        : 'IE',
                browser_version: '9.0',
                os             : 'Windows',
                os_version     : '7'
            },
            bs_safari: {
                base           : 'BrowserStack',
                browser        : 'Safari',
                os             : 'OS X',
                os_version     : 'Sierra',
            }
        };
        settings.browsers = Object.keys(settings.customLaunchers);

        // BrowserStack
        settings.reporters.push('BrowserStack');
        settings.browserStack = {
            username : process.env.BROWSERSTACK_USERNAME,
            accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
            build    : [
                `${process.env.GITHUB_RUN_ID ? 'GitHub' : 'Local'}:${gitInfo.branch} -`,
                gitInfo.isClean ? gitInfo.commitMsg : 'Uncommitted changes',
                `@ ${new Date().toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short', hour12: true })}`
            ].join(' '),
            project  : pkg.name,
            video    : false
        };
    }
    // Local
    else {
        settings.browsers = ['ChromeHeadless'];
        settings.webpack.devtool = 'inline-source-map';
        settings.coverageIstanbulReporter.reports.push('html');

        // eslint-disable-next-line
        console.log([
            '============================================================\n',
            `KARMA: localhost:${settings.port}/debug.html\n`,
            '============================================================\n'
        ].join(''));
    }

    // Logging: LOG_DISABLE, LOG_ERROR, LOG_WARN, LOG_INFO, LOG_DEBUG
    settings.logLevel = config.LOG_INFO;
    config.set(settings);
};
