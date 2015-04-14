module.exports = function (grunt) {

    var commonTestWatchFiles = ['index.js', 'Gruntfile.js', 'package.json', 'src/**/*.*', 'test/lib/**/*.*'];

    grunt.initConfig({
        clean: {
            coverage: ["html-report", 'cobertura-coverage.xml']
        },
        intern: {
            options: {
                config: 'test/intern-config',
                reporters: ['console', 'lcovhtml', 'cobertura'],
                grep: grunt.option('grep') ? grunt.option('grep') : '.*'
            },
            test_unit: {
                options: {
                    suites: ['test/unit/all']
                }
            },
            test_integration: {
                options: {
                    suites: ['test/integration/all']
                }
            }
        },
        watch: {
            options: {
                spawn: false
            },
            test_unit: {
                files: commonTestWatchFiles.concat(['test/unit/**/*.*']),
                tasks: ['test-unit']
            },
            test_integration: {
                files: commonTestWatchFiles.concat(['test/integration/**/*.*', 'test/vendor/**/*.*']),
                tasks: ['test-integration']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('intern');

    grunt.registerTask('test', ['clean:coverage', 'intern']);
    grunt.registerTask('test-unit', ['clean:coverage', 'intern:test_unit']);
    grunt.registerTask('testing-unit', ['watch:test_unit']);
    grunt.registerTask('test-integration', ['clean:coverage', 'intern:test_integration']);
    grunt.registerTask('testing-integration', ['watch:test_integration']);

    grunt.registerTask('default', ['test']);

};