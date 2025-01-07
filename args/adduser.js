const { ArgumentParser } = require('argparse');
function parseArgs() {
  const parser = new ArgumentParser({
    description: 'Drumee schemas utils',
    add_help: true
  });
  parser.add_argument('--ident', {
    type: String,
    required: true,
    help: 'Domain ident. Alphanum'
  });
  parser.add_argument('--email', {
    type: String,
    required: true,
    help: 'User email'
  });
  parser.add_argument('--username', {
    type: String,
    help: 'User email'
  });
  parser.add_argument('--firstname', {
    type: String,
    required: true,
    help: 'User firstname'
  });
  parser.add_argument('--lastname', {
    type: String,
    required: true,
    help: 'User lastname'
  });
  return parser.parse_args();
}
const args = parseArgs();
module.exports = args;
