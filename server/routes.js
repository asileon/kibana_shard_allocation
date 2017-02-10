export default function (server) {

  let call = server.plugins.elasticsearch.callWithRequest;

  server.route({
    path: '/api/shard_allocation/overview',
    method: 'GET',
    handler(req, reply) {
      call(req, 'cluster.state', {metric: ['nodes','routing_table', 'metadata']}).then(response => reply(response));
    }
  });
};
