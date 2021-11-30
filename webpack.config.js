export default {
  target: 'webworker',
  entry: './index.js', // inferred from "main" in package.json
  mode: 'production',
  output: {
    hashFunction: 'xxhash64',
  },
};
