  /*!
  * ----------------------
  * Keen IO Plugin
  * Data Visualization
  * ----------------------
  */

  (function(lib){
    var Keen = lib || {};

    var errors = {
      "google-visualization-errors-0": "No results to visualize"
    };

    var chartTypes = ['AreaChart', 'BarChart', 'ColumnChart', 'LineChart', 'PieChart', 'Table'];
    var chartMap = {};

    var dataTypes = {
      // dataType           // chartTypes (namespace)
      // 'singular':        null,
      'categorical':        ['piechart', 'barchart', 'columnchart', 'table'],
      'cat-interval':       ['columnchart', 'barchart', 'table'],
      'cat-ordinal':        ['barchart', 'columnchart', 'areachart', 'linechart', 'table'],
      'chronological':      ['areachart', 'linechart', 'table'],
      'cat-chronological':  ['linechart', 'columnchart', 'barchart', 'areachart'],
      'nominal':            ['table'],
      'extraction':         ['table']
    };

    // Create chart types
    // -------------------------------
    _each(chartTypes, function (type) {
      var name = type.toLowerCase();
      chartMap[name] = {
        initialize: function(){
          // Nothing to do here
        },
        render: function(){
          var self = this;
          if (self.view._artifacts['googlechart']) {
            this.destroy();
          }
          self.view._artifacts['googlechart'] = self.view._artifacts['googlechart'] || new google.visualization[type](self.el());
          google.visualization.events.addListener(self.view._artifacts.googlechart, 'error', function(stack){
            _handleErrors.call(self, stack);
          });
          this.update();
        },
        update: function(){
          var options = _getDefaultAttributes.call(this, type);
          Keen.utils.extend(options, this.chartOptions(), this.attributes());
          if (this.view._artifacts['datatable']) {
            this.view._artifacts['datatable'] = google.visualization.arrayToDataTable(this.data()));
          }
          if (this.view._artifacts['googlechart']) {
            this.view._artifacts['googlechart'].draw(this.view._artifacts['datatable'], options);
          }
        },
        destroy: function(){
          if (this.view._artifacts['googlechart']) {
            google.visualization.events.removeAllListeners(this.view._artifacts['googlechart']);
            this.view._artifacts['googlechart'].clearChart();
            this.view._artifacts['googlechart'] = null;
            this.view._artifacts['datatable'] = null;
          }
        }
      };
    });


    // Register library + types
    // -------------------------------

    Keen.Dataviz.register('google', chartMap, {
      capabilities: dataTypes,
      dependencies: [{
        type: 'script',
        url: 'https://www.google.com/jsapi',
        cb: function(done) {
          if(typeof google === 'undefined'){
            throw new Error("Problem loading Google Charts library. Please contact us!");
          } else {
            google.load('visualization', '1.1', {
                packages: ['corechart', 'table'],
                callback: function(){
                  done();
                }
            });
          }
        }
      }]
    });

    function _handleErrors(stack){
      var message = errors[stack['id']] || stack['message'] || "An error occurred";
      this.trigger('error', message);
    }

    function _getDefaultAttributes(type){
      var output = {};
      switch (type) {

        case "areachart":
          output.lineWidth = 2;
          output.hAxis = {
            baselineColor: 'transparent',
            gridlines: { color: 'transparent' }
          };
          output.vAxis = {
            viewWindow: { min: 0 }
          };
          if (this.dataType() === "chronological") {
            output.legend = {
              position: "none";
            }
          }
          break;

        case "barchart":
          break;

        case "columnchart":
          output.hAxis = {
            baselineColor: 'transparent',
            gridlines: { color: 'transparent' }
          };
          output.vAxis = {
            viewWindow: { min: 0 }
          };
          if (this.dataType() === "chronological") {
            output.legend = {
              position: "none";
            }
          }
          break;

        case "linechart":
          output.lineWidth = 2;
          output.hAxis = {
            baselineColor: 'transparent',
            gridlines: { color: 'transparent' }
          };
          output.vAxis = {
            viewWindow: { min: 0 }
          };
          if (this.dataType() === "chronological") {
            output.legend = {
              position: "none";
            }
          }
          break;

        case "piechart":
          output.sliceVisibilityThreshold = 0.01;
          break;

        case "table":
          break;
      }
      return output;
    }

  })(Keen);
