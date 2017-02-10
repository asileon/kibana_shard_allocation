import api from './server/routes';

export default function (kibana) {

  const monitoringOrder = 9002;

  return new kibana.Plugin({
    require: ['kibana', 'elasticsearch'],

    uiExports: {
      app: {
        title: 'Shard Allocation',
        description: 'Elasticsearch Shards Allocation Visualization',
        main: 'plugins/shard_allocation/app',
        icon: 'plugins/shard_allocation/icon.svg',
        order: monitoringOrder + 0.5 // place the app in the menu right after Monitoring
      }
    },

    init(server, options) {
      api(server);
    }

  });
};
