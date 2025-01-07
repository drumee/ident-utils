const { ArgumentParser } = require('argparse');
function parseArgs() {
  const parser = new ArgumentParser({
    description: 'Drumee schemas utils',
    add_help: true
  });
  parser.add_argument('--id', {
    type: String,
    required: true,
    help: 'Domain id'
  });
  return parser.parse_args();
}
const args = parseArgs();
module.exports = args;
