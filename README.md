# Chisel

An open source writing app.

### Installation

You will need:

1. An OpenAI key
2. A Firebase account
3. A machine with Node installed.

Then:

1. Add your OpenAI key to `settings.example.js`.
2. Add your Firebase config to `settings.example.js`.
3. Add a salt to `settings.example.js` (`tokenSalt`).
4. Rename `settings.example.js` to `settings.js`.
5. Get your `serviceAccountKey.json` from Firebase and save it in the root directory of your project.
6. `yarn` to install dependencies.

### Running

```
yarn build
yarn start
```

### Developing

You can use watch mode for faster development locally.

```
yarn watch # for webpack
yarn nodemon # for the server
```

### Running tests

```
NODE_OPTIONS=--experimental-vm-modules yarn test
```

### Integration tests

You'll first need to add login details for a real user in settings.js:

```js
testuser: {
  userid: '',
  email: '',
  password: ''
}
```

Now run:

```
yarn cypress
```

And follow the instructions.

### Bundle size

Run `yarn buildstats` and then run through https://chrisbateman.github.io/webpack-visualizer/
