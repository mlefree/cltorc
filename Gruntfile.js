

module.exports = function(grunt) {
	'use strict';

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				separator: ' ',
			},
			js: {
				src: [
							'www/l4p/libs/js/jquery/jquery-2.0.3.min.js',
							'www/l4p/libs/js/angular/angular.min.js',
							'www/l4p/libs/js/angular/angular-touch.min.js',
							'www/l4p/libs/js/angular/angular-animate.min.js',
							'www/l4p/libs/js/angular/angular-sanitize.min.js',
							'www/l4p/libs/js/angular/angular-resource.min.js',
							'www/l4p/libs/js/angular/ui-bootstrap-tpls.min.js',
							'www/l4p/libs/js/bootstrap/bootstrap.min.js',
							'www/l4p/libs/js/md5.js',
							'www/l4p/libs/js/l4p.min.js',
							'www/l4p/libs/js/jquery-plugins/jquery.noty.js',
							'www/l4p/libs/js/jquery-plugins/jquery.autosize.js',
							'www/l4p/libs/js/jquery-plugins/jquery.easing.1.3.js',
							'www/l4p/libs/js/jquery-plugins/jquery.popcircle.1.0.js',
							//'www/l4p/libs/js/jquery-plugins/TimelineJS-master/compiled/js/storyjs-embed.js',
							'www/models/c4p_locale.js',
							'www/models/c4p_demo.js',
							'www/js/a4p/*.js',
							'www/js/controller/*.js',
							'www/js/controller/dialog/*.js',
							'www/js/directive/*.js',
							'www/js/partial_templated/*.js',
							'www/js/service/*.js',
							'www/js/*.js'
				],
			dest: 'mobile/js/<%= pkg.name %>.js',
			},
		},
		uglify: {
			dev : {
				options: {
					banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd HH:MM") %> */\n',
					mangle: false,
					beautify: true
				},
				files: {
					'mobile/js/<%= pkg.name %>.js' : 'mobile/js/<%= pkg.name %>.js'
				}
			},
			prod : {
					options: {
						banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd HH:MM") %> */\n',
						mangle: false,
						compress: {
							global_defs: {
								"DEBUG": false
							},
							dead_code: true,
							drop_console: true
						}
					},
					files: {
						'mobile/js/<%= pkg.name %>.js' : 'mobile/js/<%= pkg.name %>.js'
					}
			}
		},
		replace: {
			console: {
				src: ['mobile/js/<%= pkg.name %>.js'],
				overwrite: true,
				replacements: [
													//{from: /console\.log('?"?.*'?"?)/g,to: "a4pFakeConsoleLog()"},
													//{from: /a4p\.InternalLog\.log('?"?.*'?"?)/g,to: "a4pFakeConsoleLog()"},
													{from: /console\.log/g,to: "a4pFakeConsoleLog"},
													{from: /a4p\.InternalLog\.log/g,to: "a4pFakeConsoleLog"}
											]
			}
		},
		clean: ["mobile"],
		copy: {
			mobileRessources: {
				files: [
					{expand: true, cwd: 'www/img/', src: ['**'], dest: 'mobile/img/'},
					{expand: true, cwd: 'www/l4p/img/', src: ['**'], dest: 'mobile/l4p/img/'},
					{expand: true, cwd: 'www/l4p/font/', src: ['**'], dest: 'mobile/l4p/font/'},
					{expand: true, cwd: 'www/l4p/css/', src: ['c4p-*.min.css'], dest: 'mobile/l4p/css/'},
					{expand: true, cwd: 'www/models/', src: ['c4p_*.json'], dest: 'mobile/models/'},
					{expand: true, cwd: 'www/models/', src: ['local_*.json'], dest: 'mobile/models/'},
					{expand: true, cwd: 'www/models/', src: ['data*.json'], dest: 'mobile/models/'},
					{expand: true, cwd: 'www/', src: 'mobile.html', dest: 'mobile/'}
				]
			},
		},
		rename: {
			mobileIndex: {
				files: [
					{src: ['mobile/mobile.html'], dest: 'mobile/index.html'}
				]
			}
		},
		ngtemplates:    {
			ptvTemplates: {
				cwd: '',
				src: [
					'views/**.html',
					'views/dashboard/*.html',
					'views/login/*.html',
					'views/chore/*.html',
					'views/user/*.html'
				],
				dest: 'javascripts/_templates.js',
				options: {
					standalone : true,
					htmlmin:  {
						collapseWhitespace: true,
						collapseBooleanAttributes: true,
						removeComments: true // Only if you don't use comment directives!
					}
				}
			}
		},
		nggettext_extract: {
			pot: {
				files: {
					'po/template.pot': ['app/views/**/*.html']
				}
			},
		},
		nggettext_compile: {
			all: {
				files: {
					'app/javascripts/languages/translation.js': ['po/*.po']
				}
			},
		},
		less: {
			development: {
				files: {
					"app/stylesheets/main.css": "app/stylesheets/less/main.less"
				}
			}
	  },
		version: {
			project: {
				src: ['package.json', 'bower.json']
			},
			appconfig: {
				options: {
					prefix: 'appVersion","'
				},
				src: ['app/javascripts/config/config.js']
			},
			appxml: {
				options: {
					prefix: 'version\\s+=\\s+[\'"]'
				},
				src: ['app/config.xml']
			}
		},
		watch: {
			po_changed: {
				files: ["po/*.po"],
				tasks: ["nggettext_compile"]
			},
			update_pot: {
				files: ['app/**/*.html'],
				tasks: ["nggettext_extract"]
			},
			less_changed: {
				files: ["app/stylesheets/less/*.less"],
				tasks: ["less"]
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-less');

	grunt.loadNpmTasks('grunt-version');

	grunt.loadNpmTasks('grunt-angular-templates');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-rename');
	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.loadNpmTasks('grunt-text-replace');
	grunt.loadNpmTasks('grunt-angular-gettext');


	// Tests
	grunt.registerTask('default', ['ngtemplates:ptvTemplates']);

	//grunt.registerTask('mobile', ['ngtemplates:ptvTemplates','concat:js']);
	grunt.registerTask('mobile', ['ngtemplates:ptvTemplates']);

	grunt.registerTask('translate:in',['nggettext_extract']);
	grunt.registerTask('translate:out',['nggettext_compile']);
	grunt.registerTask('version:all',['version:project:patch','version:appconfig','version:appxml']);

};
