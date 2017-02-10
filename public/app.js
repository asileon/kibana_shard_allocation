import uiModules from 'ui/modules';
import uiRoutes from 'ui/routes';
import 'ui/autoload/all';
import './less/main.less';
import overviewTemplate from './templates/index.html';

document.title = "Shard Allocation - Kibana";

uiRoutes.enable();
uiRoutes
.when('/', {
  template: overviewTemplate,
  controller: 'elasticsearchShardAllocationOverview',
  controllerAs: 'ctrl'
});

uiModules
.get('app/shard_allocation')
.controller('elasticsearchShardAllocationOverview', ['$scope', '$http', '$route', ($scope, $http, $route) => {
  $scope.getNumber = (num => new Array(num));

  $scope.loadData = () => {
    $http.get('../api/shard_allocation/overview').then((response) => {

      function getNodes(data) {
        let nodes = [];
        for (var nodeId in data.nodes) {
          let nodeData = data.nodes[nodeId];
          nodeData.id = nodeId;
          nodes.push(nodeData);
        }
        return nodes;
      };

      function getClosedIndices(data) {
        let closed_indices = [];
        for (var index in data.metadata.indices) {
          if (data.metadata.indices[index].state === 'close') {
            closed_indices.push({name: index, is_system: index.startsWith('.')});
          }
        }
        return closed_indices;
      };

      function compareNames(a, b) {
        return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
      };

      let result = $scope.ctrl;

      result.nodes = getNodes(response.data);

      result.has_unassigned_shards = false;
      result.indices = [];
      for (var index in response.data.routing_table.indices) {
        let indexData = response.data.routing_table.indices[index];
        indexData.name = index;
        indexData.max_shard = -1;
        var shards = {};
        for (var shardId in indexData.shards) {
          for (var shardDataIndex in indexData.shards[shardId]) {
            let shardData = indexData.shards[shardId][shardDataIndex];

            if (shardData.shard > indexData.max_shard) {
              indexData.max_shard = shardData.shard;
            }

            if (shardData.node !== null) {
              response.data.nodes[shardData.node].has_shards = true;
              shards[shardData.node] = shards[shardData.node] || {};
              shards[shardData.node][shardData.shard] = shardData;
            } else {
              result.has_unassigned_shards = true;
              indexData.unassigned_shards = indexData.unassigned_shards || [];
              indexData.unassigned_shards.push(shardData);
            }

            if (shardData.relocating_node !== null) {
              shards[shardData.relocating_node] = shards[shardData.relocating_node] || {};
              shards[shardData.relocating_node][shardData.shard] = shardData;
            }
          }
        }

        indexData.shards = shards;
        indexData.is_system = indexData.name.startsWith('.');
        result.indices.push(indexData);
      }

      result.closed_indices = getClosedIndices(response.data);

      result.indices.sort(compareNames);
      result.closed_indices.sort(compareNames);
      result.nodes.sort(compareNames);
      result.cluster_uuid = response.data.metadata.cluster_uuid;
      result.first_load = true;
    });
  };

  $scope.topNavMenu = [{
    key: 'filter',
    description: 'Filter',
    template: require('./templates/index_filter.html'),
    testId: 'shardAllocationFilter'
  }, {
    key: 'refresh',
    description: 'Refresh',
    run: $scope.loadData,
    testId: 'shardAllocationRefresh'
  }];

  $scope.loadData();
}]);
