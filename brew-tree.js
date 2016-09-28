'use strict';

var spawn = require('child_process').spawn;

var pkg = process.argv[2];

// Collect information on package
var uses = spawn('brew', ['uses', '--installed', pkg]);
var deps = spawn('brew', ['deps', pkg]);

var uses_data = '', uses_finished = false;
uses.stdout.on('data', (data) => {
  uses_data += data.toString();
});
uses.on('close', () => {
  uses_finished = true;
  if (uses_finished && deps_finished) data_collected();
});

var deps_data = '', deps_finished = false;
deps.stdout.on('data', (data) => {
  deps_data += data.toString();
});
deps.on('close', () => {
  deps_finished = true;
  if (uses_finished && deps_finished) data_collected();
});

// Called when child processes end
var data_collected = function () {
  uses_data = uses_data.trim().split('\n');
  deps_data = deps_data.trim().split('\n');

  var str = '', max = false;
  if (uses_data.length > 0) {
    max = uses_data.reduce(function (len, c) {
      return c.length > len ? c.length : len;
    }, 0) + 2;
    if (pkg.length / 2 > max - 2) max = Math.floor(pkg.length / 2 + 2);

    // First has different suffix
    var first = uses_data.shift() + ' ';
    while (first.length < max) first += '━';
    str = '  ' + first + '┓\n';

    str = uses_data.reduce(function (acc, p) {
      p += ' ';
      while (p.length < max) p += '━';
      return acc + '  ' + p + '┫\n';
    }, str);
  }

  if (deps_data.length > 0) {
    // Compute length of spaces prefix
    var prefix_spaces = '';
    if (!max) {
      // No packages depend on this package, str is empty
      prefix_spaces = '  ';
    } else {
      while (prefix_spaces.length < max) {
        prefix_spaces += ' ';
      }
      prefix_spaces = '  ' + prefix_spaces;
    }

    // Print this package itself
    var prefix_cut = prefix_spaces.length - Math.ceil(pkg.length / 2) + 1;
    str += prefix_spaces.substring(0, prefix_cut) + pkg + '\n';

    // Print dependencies
    var last = deps_data.pop();
    str = deps_data.reduce(function (acc, p) {
      return acc + prefix_spaces + '┣━ ' + p + '\n';
    }, str);

    str += prefix_spaces + '┗━ ' + last + '\n';
  }

  if (str !== '') {
    console.log('\n' + str);
  } else {
    console.log('none');
  }
}
