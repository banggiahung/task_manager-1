const { getDefaultConfig } = require('@react-native/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');
const path = require('path');

// Lấy cấu hình mặc định của Metro
const defaultConfig = getDefaultConfig(__dirname);

// Cấu hình tùy chỉnh thêm thư mục và định dạng asset
const customConfig = {
  watchFolders: [
    path.resolve(__dirname, 'src'), // Theo dõi thư mục 'src'
  ],
  resolver: {
    assetExts: ['db', 'mp4', 'png', 'jpg', 'jpeg', 'svg'], // Các định dạng asset bạn cần hỗ trợ
  },
};

// Hợp nhất cấu hình mặc định với cấu hình tùy chỉnh và bọc với `react-native-reanimated`
module.exports = wrapWithReanimatedMetroConfig({
  ...defaultConfig,
  ...customConfig,
});
