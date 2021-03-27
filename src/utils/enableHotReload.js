const enableHotReload = () => {
  try {
    require('electron-reloader')(module, {
      debug: true,
      watchRenderer: true
    });
  } catch (e) {
    console.error(`An error occurred: ${e}`);
  }
}

module.exports = { enableHotReload };