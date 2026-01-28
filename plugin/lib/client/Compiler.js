const { ClientSocket } = require('./ClientSocket.js');
const { replace } = require('./hmr.js');
const { error, info, warn } = require('./log.js')();

class Compiler {
  constructor(options, buildHash) {
    this.options = options;
    this.state = {
      connected: false,
      compiler: {
        done: true,
        errors: [],
        warnings: [],
        progress: 0,
      },
    };
    this.listeners = [];
    this.buildHash = buildHash;

    this.init();
  }

  init() {
    const { address, client = {}, secure, liveReload } = this.options;

    const protocol = secure ? 'wss' : 'ws';
    this.socket = new ClientSocket(
      client,
      `${client.protocol || protocol}://${client.address || address}/wps`,
    );

    // prevents ECONNRESET errors on the server
    window.addEventListener('beforeunload', () => this.socket.close());

    this.socket.addEventListener('message', (message) => {
      this.handleMessage(message);
    });

    this.socket.onDisconnect(() => {
      this.state.connected = false;
      this.broadcastUpdate();
    });

    if (module.hot) {
      info('Hot Module Replacement is active');

      if (liveReload) {
        info('Live Reload taking precedence over Hot Module Replacement');
      }
    } else {
      warn('Hot Module Replacement is inactive');
    }

    if (!module.hot && liveReload) {
      info('Live Reload is active');
    }
  }

  onChange(listener) {
    this.listeners.push(listener);
  }

  broadcastUpdate() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  handleMessage(message) {
    const { action, data = {} } = JSON.parse(message.data);
    const { errors, hash = '<?>', warnings } = data || {};
    const shortHash = hash.slice(0, 7);
    const identifier = this.options.compilerName
      ? `(Compiler: ${this.options.compilerName}) `
      : '';
    const { wpsId } = data;

    switch (action) {
      case 'build':
        this.state.compiler.done = false;
        // clear errors and warnings when a new build begins
        this.state.compiler.errors = [];
        this.state.compiler.warnings = [];

        this.broadcastUpdate();
        break;
      case 'connected':
        this.state.connected = true;
        this.state.compiler.done = data.buildDone;
        info(`WebSocket connected ${identifier}`);
        this.broadcastUpdate();
        break;
      case 'done':
        this.state.compiler.done = true;
        this.broadcastUpdate();
        break;
      case 'progress':
        this.state.compiler.progress = data.percent * 100;
        this.broadcastUpdate();
        break;
      case 'problems':
        if (data.errors.length) {
          error(`${identifier}Build ${shortHash} produced errors:\n`, errors);
          this.state.compiler.errors = data.errors;
        }
        if (data.warnings.length) {
          warn(
            `${identifier}Build ${shortHash} produced warnings:\n`,
            warnings,
          );
          this.state.compiler.warnings = data.warnings;
        }
        this.broadcastUpdate();
        break;
      case 'reload':
        window.location.reload();

        break;
      case 'replace':
        // actions with a wpsId in tow indicate actions that should only be executed when the wpsId sent
        // matches the wpsId set in options. this is how we can identify multiple compilers in the
        // client.
        if (wpsId && wpsId === this.options.wpsId) {
          replace(
            this.buildHash,
            hash,
            this.options.hmr === 'refresh-on-failure',
          );
        }
        break;
      default:
    }
  }
}

module.exports = Compiler;
