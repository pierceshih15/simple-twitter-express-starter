const moment = require('moment')

module.exports = {
  ifCond: function(a, b, options) {
    if (a === b) {
      return options.fn(this)
    }
    return options.inverse(this)
  },

  moment: function(a) {
<<<<<<< HEAD
    return moment(a).format('YYYY-MM-DD HH:mm:ss')
=======
    return moment(a).fromNow()
  },

  momentCreateAt: function(a) {
    return moment(a).format('YYYY-MM-DD, HH:MM')
>>>>>>> 80a64cb7f2770338a9f3506df51996fcb305a5ff
  }
}
