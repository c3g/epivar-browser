/*
 * handlers.js
 */


const GENERIC_MESSAGE =
  "An error was encountered while processing this request. See the server logs for more information.";

export const errorHandler = (res, status=500) => err => {
  if (status) {
    res.status(status);
  }

  if (err instanceof Error) {
    let message = err.toString();
    console.error(`Error encountered (status=${status}): ${message}; stack:\n`, err.stack);
    if (message.startsWith("Error: Command failed:")) {
      message = GENERIC_MESSAGE;
    }
    res.json({ok: false, status, message});
  } else {
    let message = err;
    if (message.startsWith("Error: Command failed:")) {
      message = GENERIC_MESSAGE;
    }
    res.json({ok: false, status, message});
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
