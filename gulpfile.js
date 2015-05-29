var gulp        = require('gulp');
var awspublish  = require('gulp-awspublish');
var browserSync = require('browser-sync');
var changed     = require('gulp-changed');
var concat      = require('gulp-concat');
var cssmin      = require('gulp-cssmin');
var jade        = require('gulp-jade');
var jshint      = require('gulp-jshint');
var less        = require('gulp-less');
var reload      = browserSync.reload;
var rename      = require('gulp-rename');
var uglify      = require('gulp-uglify');

gulp.task('js', function(){
  gulp.src('app/js/common/**/*.js')
    .pipe(changed('build/js/'))
    .pipe(jshint()).pipe(jshint.reporter('default')) // flag js errors or style gaffes
    .pipe(concat('common.js'))          // concatenate all the files together into one
    .pipe(uglify())                     // minify
    .pipe(gulp.dest('build/js'))        // save the minified content
    .pipe(reload({stream:true}));       // tell browser-sync to reload

  gulp.src(['app/js/**/*.js', '!app/js/common/**/*.js'])
    .pipe(changed('build/js/'))
    .pipe(jshint()).pipe(jshint.reporter('default'))
    .pipe(uglify())
    .pipe(gulp.dest('build/js'))
    .pipe(reload({stream:true}));
});

gulp.task('serve', function() {
  browserSync({ server: "build" });
  gulp.watch("app/styles/**/*.less",  ['less']);
  gulp.watch("app/js/**/*.js",        ['js']);
  gulp.watch("app/views/**/*.jade",   ['jade']);
  gulp.watch("app/views/**/*.html",   ['html']).on('change', reload);
  gulp.watch("app/assets/**",         ['assets']);
  gulp.watch("vendor/**/*",           ['vendor']);
});

gulp.task('assets', function() {
  return gulp.src('app/assets/**')
    .pipe(changed('build'))
    .pipe(gulp.dest('build'))
    .pipe(reload({stream:true}));
});

gulp.task('html', function() {
  return gulp.src('app/views/**/*.html')
    .pipe(changed('build'))
    .pipe(gulp.dest('build'))
    .pipe(reload({stream:true}));
});

gulp.task('jade', function() {
  return gulp.src('app/views/**/*.jade')
    .pipe(jade()) // FYI: pipe(changed) not working here, so any jade changing reloads all jade
    .pipe(changed('build'))
    .pipe(rename(function(path) { path.extname = ".html"; }))
    .pipe(gulp.dest('build'))
    .pipe(reload({stream:true}));
});

gulp.task('assets', function() {
  return gulp.src('app/assets/**/*')
    .pipe(changed('build'))
    .pipe(gulp.dest('build'))
    .pipe(reload({stream:true}));
});

gulp.task('less', function() {
  return gulp.src('app/styles/**/*.less')
    .pipe(changed('build/styles'))
    .pipe(less())
    .pipe(concat('app.css'))
    .pipe(cssmin())
    .pipe(gulp.dest('build/styles'))
    .pipe(reload({stream:true}));
});

gulp.task('aws-deploy', function() {
  var publisher = awspublish.create({
    // NOTE: accessKeyId, secretAccessKey, and region are in aws-credentials.json
    bucket:          'front-end-skel'
  });

  gulp.src([ // first publish any pre-compressed assets (WITHOUT gzip'ing):
      'build/**/*.gif',
      'build/**/*.jpg',
      'build/**/*.png',
    ])
    .pipe(publisher.publish( { 'Cache-Control': 'max-age=315360000, no-transform, public' }))
    .pipe(publisher.cache()) // avoid dupe uploads w/.aws-blah-cache file; delete to clear cache
    .pipe(awspublish.reporter()); // print updates to console

  gulp.src([ // then publish any (text-based) files that CAN be served gzip'd from S3:
      'build/**/*.html',
      'build/**/*.js',
      'build/**/*.css',
      'build/**/*.woff',
      'build/**/*.svg',
      'build/**/*.eot',
      'build/**/*.txt'
    ])
    .pipe(awspublish.gzip())
    .pipe(publisher.publish( { 'Cache-Control': 'max-age=315360000, no-transform, public' }))
    .pipe(publisher.cache())
    .pipe(awspublish.reporter());
});

gulp.task('vendor', function() {
  return gulp.src('vendor/**')
    .pipe(gulp.dest('build/vendor'));
});

gulp.task('build',   ['js', 'less', 'html', 'jade', 'assets', 'vendor']);
gulp.task('deploy',  ['build', 'aws-deploy']);
gulp.task('default', ['build', 'serve']);

