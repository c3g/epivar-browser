/*
 * handlers.js
 */


exports.errorHandler = res => err => {
  if (err instanceof Error)
    res.json({ ok: false, message: err.toString(), stack: err.stack.split('\n') })
  else
    res.json({ ok: false, message: err })
  res.end()
}

exports.dataHandler = res => data => {
  res.json({ ok: true, data: data })
  res.end()
}

exports.textHandler = res => text => {
  res.header('Content-Length', text.length)
  res.end(text)
}
