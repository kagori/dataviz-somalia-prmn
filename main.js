
//Create the dc.js chart objects and link to div

var displaceTotalNumber = dc.numberDisplay("#dc-displace-total-number");

var displaceReasonChart = dc.rowChart("#dc-displace-reason-chart");

var prevRegionChart = dc.rowChart("#dc-prev-region-chart");
var currRegionChart = dc.rowChart("#dc-curr-region-chart");

var prevRegionMap = dc.geoChoroplethChart("#dc-prev-region-map");
var currRegionMap = dc.geoChoroplethChart("#dc-curr-region-map");

var displaceMonthChart = dc.barChart("#dc-month-chart");

// Load data from CSV file
d3.csv("data/FAO_Dataset.csv", function (data){
  // Load data from JSON file
  // d3.json("data/admin1.json", function (govtJson){
  d3.json("data/Som_Admbnda_Adm1_UNDP.json", function (govtJson){
    
    // format our data
    data.forEach(function(d){
      d.id = +d.id;
      d.lyear = +d.lyear;
      d.nmonth = +d.nmonth;
      d.tpeople = +d.tpeople;
      // d.yrmonthnum = +d.yrmonthnum;
    });


    // run the data thru crossfilter
    var facts = crossfilter(data); 

    // create people dimension and group
    var peopleGroup = facts.groupAll().reduceSum(function(d){
      return d.tpeople;
    });

    displaceTotalNumber
      .group(peopleGroup)
      .formatNumber(d3.format(","))
      .valueAccessor(function(d){ return d });


    // configure displacement month dimension and group
    var displaceMonth = facts.dimension(function(d){
      return d.yrmonthnum;
    });
    var displaceMonthGroup = displaceMonth.group()
    .reduceSum(function(d){
      return d.tpeople;
    });

    // Configure displacement month bar chart parameters
    displaceMonthChart.width(1090).height(180)
      .margins({top:20, right:0, bottom:50, left:50})
      .dimension(displaceMonth)
      .group(displaceMonthGroup, "Year-Month")
      .valueAccessor(function(d){
        return d.value;
      })
      .title(function(d){
        return d3.format(",")(d.value);
      })
      // .ordering(function(d) { return -d.key; }) // desc
      // .ordering(function(d) { return d.key; }) // asc
      .colors('#4292c6')
      .barPadding(0.1)
      .outerPadding(0.05)
      .brushOn(false)
      .x(d3.scale.ordinal())
      .xUnits(dc.units.ordinal)
      .elasticY(true)
      .renderHorizontalGridLines(true)
      .yAxis().ticks(5);      
 

    // create displacement reason dimension and group
    var displaceReason = facts.dimension(function(d){
      return d.creason;
    });   
    var displaceReasonGroup = displaceReason.group().reduceSum(
      function(d){
        return d.tpeople;
      }
    );  

    // configure displacement reason chart parameters
    displaceReasonChart.width(350)
      .height(320)
      .margins({top:5, right:10, bottom:20, left:10})
      .dimension(displaceReason)
      .group(displaceReasonGroup)
      .ordering(function(d){ return -d.value; })
      .valueAccessor(function(d){
        return (d.value);
      })
      // .colors(d3.scale.category20())
      // .colors('#4292c6')
      .ordinalColors(['#e5c494','#ffd92f','#fc8d62','#a6d854','#66c2a5','#8da0cb','#e78ac3'])
      .label(function(d){
        return _.upperFirst(d.key);
      })
      .title(function(d){
        return _.upperFirst(d.key) + ": "
                 + d3.format(",")(d.value);
      })
      .elasticX(true)
      .xAxis()
      .ticks(4);
      // .tickFormat(function(v){ return v/1000 + 'K'; });
    
    // // disble mouse click for displaceReasonChart
    // displaceReasonChart.filter = function(){};


    // create previous region dimension and group
    var prevRegion = facts.dimension(function(d){
      return d.pregion;
    });    

    var prevRegionGroup = prevRegion.group().reduceSum(function(d){
      return d.tpeople;
    });

    // configure previous region chart parameters
    prevRegionChart.width(330)
      .height(500)
      .margins({top:5, right:10, bottom:20, left:10})
      .dimension(prevRegion)
      .valueAccessor(function(d){ return d.value; })
      .group(prevRegionGroup)
      .ordering(function(d){ return -d.value; })
      // .colors(d3.scale.ordinal().range(colorbrewer.Set2[6]))
      .ordinalColors(['#eb5a5e'])
      .label(function(d){
        return d.key;
      })
      .title(function(d){
        return d.key + ": " + d3.format(",")(d.value);
      })
      .elasticX(true)
      .xAxis().ticks(4);


    // create current region dimension and group
    var currRegion = facts.dimension(function(d){
      return d.cregion;
    });    

    var currRegionGroup = currRegion.group().reduceSum(function(d){
      return d.tpeople;
    });

    // configure current region chart parameters
    currRegionChart.width(330)
      .height(500)
      .margins({top:5, right:10, bottom:20, left:10})
      .dimension(currRegion)
      .valueAccessor(function(d){ return d.value; })
      .group(currRegionGroup)
      .ordering(function(d){ return -d.value; })
      // .colors(d3.scale.ordinal().range(colorbrewer.Set2[6]))
      .colors('#4292c6')
      .label(function(d){
        return d.key;
      })
      .title(function(d){
        return d.key + ": " + d3.format(",")(d.value);
      })
      .elasticX(true)
      .xAxis().ticks(4);


    // create map dimension and group
    var prevRegion = facts.dimension(function(d){
       return d.pregion; 
      }); 
    var prevRegionGroup = prevRegion.group().reduceSum(function(d){
      return d.tpeople;
    });
    
    // Convert zipped shapefiles to GeoJSON with mapshaper (mapshaper.org).
    // Use d3.geo.mercator projections and play around with the scale and 
    // translate method parameters to get the right fit for the map. 
    // The maximum value for colorDomain can be automatically calculated 
    // from the dataset.
    // colorAccessor returns a grey color for 0 or undefined data values. 
    // Remember to set the 'stroke' color for the admin1 borders to stand-out,
    // to increase thickness set 'stroke-width' to 2px or more. See 'style.css'.
    prevRegionMap
      .width(640)
      .height(320)
      .transitionDuration(1000)
      .dimension(prevRegion)
      .group(prevRegionGroup)
      .projection(d3.geo.mercator()
        .scale(1300)
        .translate([-870, 280])
      )
      .keyAccessor(function(d){ return d.key; })
      .valueAccessor(function(d){ return d.value; })
      // .colors(['#ccc'].concat(colorbrewer.Blues[9])) 
      .colors(["#CCC", '#f4a0a2','#f28e91','#f07d80','#ee6b6f','#eb5a5e','#e9484d','#e7373b','#e5252a','#dd1a20'])
      .colorDomain([0, prevRegionGroup.top(1)[0].value / 2]) 
      .colorAccessor(function (d,i) { return d ? d:0; })         
      .overlayGeoJson(govtJson.features, "admin1Name",function(d){
        return d.properties.admin1Name;
      })
      .title(function(d){
        return  d.key + ": " + d3.format(",")(d.value);
      });

      
    // create map dimension and group
    var currRegion = facts.dimension(function(d){
       return d.cregion; 
      }); 
    var currRegionGroup = currRegion.group().reduceSum(function(d){
      return d.tpeople;
    });

    currRegionMap
      .width(640)
      .height(320)
      .transitionDuration(1000)
      .dimension(currRegion)
      .group(currRegionGroup)
      .projection(d3.geo.mercator()
        .scale(1300)
        .translate([-870, 280])
      )
      .keyAccessor(function(d){ return d.key; })
      .valueAccessor(function(d){ return d.value; })
      // .colors(['#ccc'].concat(colorbrewer.Blues[9])) 
      .colors(["#CCC", '#E2F2FF','#C4E4FF','#9ED2FF','#81C5FF','#6BBAFF','#51AEFF','#36A2FF','#1E96FF','#0089FF','#0061B5'])
      .colorDomain([0, currRegionGroup.top(1)[0].value / 2]) 
      .colorAccessor(function (d,i) { return d ? d:0; })         
      .overlayGeoJson(govtJson.features, "admin1Name",function(d){
        return d.properties.admin1Name;
      })
      .title(function(d){
        return d.key + ": " + d3.format(",")(d.value);
      });      

    // Render the charts
    dc.renderAll();

  });
});

