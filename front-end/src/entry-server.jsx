import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server';
import App from './App'

export function render(url) {
    const sanitizedUrl = url.startsWith('/') ? url : `/${url}`;
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
        <App Router={StaticRouter} location={sanitizedUrl}/>
    </React.StrictMode>
  )
  return { html }
}
