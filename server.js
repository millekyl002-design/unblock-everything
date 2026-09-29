const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to proxy all requests to the target URL
// We use a custom path: /proxy?url=https://example.com
app.use('/proxy', (req, res, next) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).send('Missing URL parameter');
    }

    // Create a proxy to the target URL
    const proxy = createProxyMiddleware({
        target: url,
        changeOrigin: true,
        ws: false,
        onError: (err, req, res) => {
            res.status(500).send('Proxy Error: ' + err.message);
        }
    });

    // Modify the request to strip some headers that might cause issues
    delete req.headers['x-forwarded-for'];
    
    // Pipe the request to the proxy
    proxy(req, res, next);
});

// Serve a simple UI for entering URLs
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Simple Web Proxy</title>
            <style>
                body { font-family: sans-serif; padding: 20px; }
                input { width: 300px; padding: 10px; }
                button { padding: 10px 20px; cursor: pointer; }
                iframe { width: 100%; height: 80vh; border: none; margin-top: 20px; }
            </style>
        </head>
        <body>
            <h2>Web Proxy</h2>
            <form action="/proxy" method="GET">
                <input type="text" name="url" placeholder="https://example.com" required>
                <button type="submit">Go</button>
            </form>
            <div id="content"></div>
        </body>
        </html>
    `);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
