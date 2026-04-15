# Run dev server and open the app

Do this from the **repository root** (`toasts-callouts-banners`).

1. **Start the app**: run `yarn dev` in the terminal.  
   - Uses **webpack-dev-server** on **http://localhost:5173/** (see `webpack.config.js`).  
   - With `devServer.open: true`, the default browser should open automatically once the server is ready.

2. **If the browser did not open**, open the app manually:  
   - macOS: `open http://localhost:5173/`  
   - Windows: `start http://localhost:5173/`  
   - Linux: `xdg-open http://localhost:5173/`  

3. **If the port is already in use**, read the dev-server output for the actual URL (or stop the other process using that port), then open that URL instead.

4. Run the dev server **in the background** only when the user wants to keep working while it runs; otherwise a normal foreground terminal is fine.

5. If `yarn dev` fails, run `yarn install` from the project root and retry.
