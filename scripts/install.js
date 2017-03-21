const exec = require("child_process").exec;
const execFile = require("child_process").execFile;
const spawn = require("child_process").spawn;
const presolve = require("path").resolve;


async function installWatchman(isWindows) {
  if (!isWindows) {
    try {
      await execProm("watchman --version", {stdio: "pipe", shell: true});
      console.log("watchman -- installed");
      // watchman installed -- exiting
      return;
    } catch (e) {
      // watchman not installed -- run install script
      try {
        await installWatchmanNix();
        return;
      } catch (e) {
        console.log("There was an error installing Watchman. Try installing it manually (https://facebook.github.io/watchman/)")
        return;
      }

    }
  }
  console.log("Watchman install not implemented for windows yet")
}

function installWatchmanNix() {
  return new Promise((resolve, reject) => {
    const installer = spawn(`${presolve(__dirname, "install-watchman.sh")}`, { shell: true });
    installer.stderr.pipe(process.stdout);
    installer.stdout.pipe(process.stdout);
    installer.on("exit", code => code === 0 ? resolve() : reject(code))
  });
}

function execProm(cmd, opts) {
  return new Promise((resolve, reject) => {
    exec(cmd, opts, (e, v) => {
      if (e) return reject(e);
      return resolve(v);
    })
  });
}


const isWindows = require("os").platform() === "win32";

installWatchman(isWindows)
  .catch(e => {
    console.log("there was a error installing stuff")
  });