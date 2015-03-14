var argv = require("yargs")
  .usage('Usage: $0 -use|-p plugin [--config|-c config.json] --output|-o output.css input.css')
  .example('postcss --use autoprefixer -c options.json -o screen.css screen.css',
    'Use autoprefixer as a postcss plugin')
  .example('postcss --use autoprefixer --autoprefixer.browsers "> 5%" -o screen.css screen.css',
    'Pass plugin parameters in plugin.option notation')
  .demand(1, 'Please specify input file.')
  .config('c')
  .alias('c', 'config')
  .describe('c', 'JSON file with plugin configuration')
  .alias('u', 'use')
  .describe('u', 'postcss plugin name (can be used multiple times)')
  .demand('u', 'Please specify at least one plugin name.')
  .alias('o', 'output')
  .describe('o', 'Output file')
  .demand('o', 'Please specify output file.')
  .requiresArg(['u', 'c', 'o'])
  .boolean('safe')
  .describe('safe', 'Enable postcss safe mode.')
  .version(function() {
    return [
      'postcss version',
      require('./node_modules/postcss/package.json').version
    ].join(' ');
  }, 'v')
  .alias('v', 'version')
  .help('h')
  .alias('h', 'help')
  .wrap()
  .argv;

if (!Array.isArray(argv.use)) {
  argv.use = [argv.use];
}

// load and configure plugin array
var plugins = argv.use.map(function(name) {
  var plugin = require(name);
  if (name in argv) {
    plugin = plugin(argv[name]);
  } else {
    plugin = plugin.postcss;
  }
  return plugin;
});


var fs = require('fs');

var input = argv._[0];
var output = argv.output;

var css = fs.readFileSync(input, 'utf8');

var postcss = require('postcss');
var processor = postcss(plugins);
var result = processor.process(css, {
  safe: argv.safe,
  from: input,
  to: output
});


fs.writeFileSync(output, result.css);
