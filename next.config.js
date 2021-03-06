// module.exports = {
//   webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
//     config.module.rules.push(
//       ...[
//         {
//           test: /\.yml$/,
//           type: "json",
//           use: "yaml-loader",
//         },
//         {
//           test: /\.svg$/,
//           use: "@svgr/webpack",
//         },
//       ]
//     );
//     if (!isServer) {
//       config.node = {
//         fs: "empty",
//       };
//     }
//     return config;
//   },
// };
module.exports = {
  webpack: (config, { isServer }) => {
    config.module.rules.push(
      ...[
        {
          test: /\.yml$/,
          type: "json",
          use: "yaml-loader",
        },
        {
          test: /\.svg$/,
          use: "@svgr/webpack",
        },
      ]
    );
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
};
