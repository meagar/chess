
Back-end classes for a Chess game.

UI exists [here](http://github.com/meagar/vue-chess).

## Development

`webpack.config.js` is setup to output to `../vue-chess/static`, so just `--watch` and VueChess should receive the
latest build automatically:

1. Install node modules

    ```
    npm install
    ```

2. Run webpack:

    ```
    $ ./node_modules/webpack/bin/webpack.js  --watch
    ```

    or

    ```
    $ ./start.sh
    ```
    
## Testing

Limited test exist but functionality is still missing:

```
npm test
```
