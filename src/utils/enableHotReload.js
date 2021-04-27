const enableHotReload = () => {
  try {
    require('electron-reloader')(module, {
      debug: true,
      watchRenderer: true,
      ignore: 'data.json'
    })
  } catch (e) {
    console.error(`An error occurred: ${e}`)
  }
}

module.exports = { enableHotReload }