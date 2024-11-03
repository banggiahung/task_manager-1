module.exports = {
  presets: [
    'module:@react-native/babel-preset',
    '@babel/preset-typescript'     // Hỗ trợ TypeScript (nhưng sẽ không cần khi code JS)
  ],
  plugins: [
    "react-native-reanimated/plugin",
  ],

};
