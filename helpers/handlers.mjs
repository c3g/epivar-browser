/*
 * handlers.js
 */


export const errorHandler = (res, status=500) => err => {
  if (status) {
    res.status(status);
  }

  if (err instanceof Error) {
    res.json({ok: false, status, message: err.toString(), stack: err.stack.split('\n')});
  } else {
    res.json({ok: false, status, message: err});
  }
  res.end();
};

export const dataHandler = res => data => {
  res.json({ ok: true, data: data });
  res.end();
};

export const textHandler = res => text => {
  res.header('Content-Length', text.length);
  res.end(text);
};

export const pngHandler = res => buf => {
  res.header("Content-Type", "image/png");
  res.header("Cache-Control", "public, max-age=15768000, immutable")
  res.end(buf);
};
