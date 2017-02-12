export default function (server) {

  const { callWithRequest } = server.plugins.elasticsearch.getCluster('data');

  server.route({
    path: '/api/shard_allocation/overview',
    method: 'GET',
    handler(req, reply) {
      callWithRequest(req, 'cluster.state', {metric: ['nodes','routing_table', 'metadata']}).then(response => reply(response));
    }
  });
};
