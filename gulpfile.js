/*
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

var gulp        = require('gulp');
var browserSync = require('browser-sync').create();

// Static server
gulp.task('show-docs', function() {
    browserSync.init({
        server: {
            baseDir: "./docs/gen"
        }
    });
});

var jsdoc = require('gulp-jsdoc3');

gulp.task('doc', function (cb) {
    gulp.src(['README.md', 'src/**/*.js'], {read: false})
        .pipe(jsdoc(cb));
});

const jasmine = require('gulp-jasmine');

gulp.task('test', () =>
    gulp.src('src/spec/**/*.js')
        // gulp-jasmine works on filepaths so you can't have any plugins before it
        .pipe(jasmine())
);
