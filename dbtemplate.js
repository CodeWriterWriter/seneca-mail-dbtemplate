"use strict";

var ejs     = require('ejs')

module.exports = function (options) {
  var plugin = "db_template"
  var seneca = this

  function generateBody(args, done) {
    var code = args.code // template identifier

    if (!code) {
      return done('No template identifier provided, cannot continue.')
    }

    var content = args.content || {}

    var templ_ent = seneca.make$('', 'template')
    templ_ent.load$({type: 'mail', templateName: code}, function (err, template) {
      if (err) {
        return done('Error processing template, err: ' + err)
      }
      if (!template) {
        return done('Cannot find template, cannot continue.')
      }

      var body = template.body
      var subject = template.subject

      if (!body){
        return done('Template body is missing, cannot continue.')
      }
      body = ejs.render(body, content)
      if (subject){
        subject = ejs.render(subject, content)
      }

      var ret_obj = {
        ok: true,
        html: body
      }
      if (subject){
        ret_obj.subject = subject
      }
      done(null, ret_obj)
    })
  }

  seneca.add({role: 'mail', cmd: 'generate'}, generateBody)

  return {
    name: plugin
  }
}
