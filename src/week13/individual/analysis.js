function analyze(){

  //
  // Getting To Know the Data
  //

  heading('Examples')

  ask('how many measurements were included in this dataset?', example1)

  ask('how many samples does each measurement contain?', example2)

  ask('at the 10-th measurement, what are valid sample values (> 0)?', example3)
  // a sample value is valid if it is greater than zero

  heading('Measurements and Samples')

  ask('how many unique non-zero, non-negative sample values in this dataset? what are they?', func1)

  ask('what is the average time (seconds) between two measurements?', func2)

  ask('at 09:57:18, how many samples in this measurement have the value 7?', func3)

  ask('which measurement has the most number of samples with the value 3?', func4)

  ask('how many measurements have no sample value greater than zero?', func5)

  ask('which valid (i.e., greater than zero) sample value is the most common?', func6)

  heading('Mapping')

  ask('when was the boat furthest away from NYC (40.7127 N, 74.0059 W)? what was the distance?', func7)
  // use Leaflet to draw a line between NYC and this "furtherest away" location

  ask('what was the path of the boat?', func8)
  // use Leaflet to draw a line between every two locations

  ask('where were the most common sample value measured?', func9)
  // say, your answer to Question Six is 13, draw a marker for each measurement that has
  // at least one sample whose value is 13

  ask('how does the desensity of valid sample values change across the geographical area?', func10)
  // use the brightness to indicate high number of valid sample values each
  // for each measurement, draw a marker,
  // use the brightness to represent the number of valid samples
  // the brighter a spot, the higher the number
  // for those measurements without a valid sample, draw nothing

  heading('Science')

  ask('what is the distribution of fish?', func11)

  ask('what is the distribution of  are schools of zooplankton?', func12)


  $('pre code').each(function(i, block) {
    hljs.highlightBlock(block);
  })
  toggleSourecode()
}

function example1(){
  return items.length
}

function example2(){
  return items[0].Samples.length
}

function example3(){
  return _.filter(items[9].Samples, function(d){
    return d > 0
  }).join(', ')
}

function func1(){
  greaterThanZero = [];
  _.forEach(items, function(d,key){
    greaterThanZero[key] = _.filter(d.Samples, function(e){
      return e > 0
    });
  })
  uniqueMeas = _.uniq(_.flatten(greaterThanZero))
  retStr = "There are "+uniqueMeas.length+" unique measurements greater than 0. They are: "
  retStr += _.sortBy(uniqueMeas, function(d){
    return parseFloat(d)
  }).join(', ')
  return retStr
}
//ask('what is the average time (seconds) between two measurements?', func2)
// assume measurment time = Ping_date, Ping_time
function func2(){
  // number of deltas is count - 1
  var time1 = moment(_.first(items).Ping_date+' '+_.first(items).Ping_time,"YYYY-MM-DD HH:mm:ss" ) 
  var time2 = moment(_.last(items).Ping_date+' '+_.last(items).Ping_time,"YYYY-MM-DD HH:mm:ss" ) 
  
  return _.round(time2.diff(time1, 'seconds')/items.length,4) + ' seconds'
}
//   ask('at 09:57:18, how many samples in this measurement have the value 7?', func3)

function func3(){
  var rightTime = _.find(items, function(d){
    return d.Ping_time == '09:57:18'
  })
  if (_.isUndefined(rightTime)){
    return "No measurements found at 09:57:18"
  }
  var rightValues = _.filter(rightTime.Samples,function(d){
    return parseFloat(d) == 7
  })
  return rightValues.length + " samples have value 7"
}
//   ask('which measurement has the most number of samples with the value 3?', func4)

function func4(){
  var numVal3 = _.mapValues(items,function(d){
    var rightValues = _.filter(d.Samples,function(d){
      return parseFloat(d) == 3
    })
    d.val3Count = rightValues.length
    return d
  })
  var maxCountObj = _.max(numVal3, 'val3Count')
  return "The measurement at Ping_index "+maxCountObj.Ping_index+" had "+
      maxCountObj.val3Count+" values of 3"
}
//   ask('how many measurements have no sample value greater than zero?', func5)
function func5(){
  var noValid = _.filter(items,function(d){
    var validValue = _.find(d.Samples,function(d){
      return parseFloat(d) > 0
    })
    // filter out any meas that have any samples > 0
    return _.isUndefined(validValue)
  })
  return noValid.length + " measurements have no samples > 0"
}

//which valid (i.e., greater than zero) sample value is the most common?
function func6(){
  greaterThanZero = [];
  _.forEach(items, function(d,key){
    greaterThanZero[key] = _.filter(d.Samples, function(e){
      return e > 0
    });
  })
  greaterThanZero = _.flatten(greaterThanZero)
  grouped = _.groupBy(greaterThanZero)

  maxObj =  _.max(grouped, function(d){
    return d.length
  })
  return maxObj[0]
}
// when was the boat furthest away from NYC (40.7127 N, 74.0059 W)?
function func7(){

  // this sample code shows how to display a map and put a marker to visualize
  // the location of the first item (i.e., measurement data)
  // you need to adapt this code to answer the question
  var pos = [items[0].Latitude, items[0].Longitude]
  var el = $(this).find('.viz')[0]    // lookup the element that will hold the map
  $(el).height(500) // set the map to the desired height
  var map = createMap(el, pos, 5)
  var itemsDist = _.mapValues(items, function(d){
    var pos = [d.Latitude, d.Longitude]
    var circle = L.circle(pos, 500, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5
    }).addTo(map);

    d.dist = geolib.getDistance({latitude: 40.7127, longitude: -74.0059},
              {latitude: d.Latitude, longitude: d.Longitude})
    return d
  })
  maxObj =  _.max(itemsDist, function(d){
    return d.dist
  })

  var polyline = L.polyline(
    [[40.7127, -74.0059],
    [parseFloat(maxObj.Latitude), parseFloat(maxObj.Longitude)]]
    , {color: 'green'}).addTo(map);
  return "The boat was furthest away at "+maxObj.Ping_time +" when it was "
   + maxObj.dist  + " meters from NYC"


  
}
// what was the path of the boat?
function func8(){

  // assume center is close to middle of path for making map
  var midIndex = _.round((items.length)/2)
  var pos = [items[midIndex].Latitude, items[midIndex].Longitude]
  var el = $(this).find('.viz')[0]    // lookup the element that will hold the map
  $(el).height(500) // set the map to the desired height
  var map = createMap(el, pos, 12)
  _.forEach(items, function(d, key,items){
    var pos = [parseFloat(d.Latitude), parseFloat(d.Longitude)]
    var circle = L.circle(pos, 1, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.25
    }).addTo(map);
    if (d != _.last(items)){
      var pos2 = [parseFloat(items[key+1].Latitude),
                  parseFloat(items[key+1].Longitude)]
      var polyline = L.polyline([pos,pos2], {color: 'red'}).addTo(map);
    }
   
  })
// add first and last markers to map
pos = [_.first(items).Latitude, _.first(items).Longitude]
var circle = L.circle(pos, 50, {
        color: 'green',
        fillColor: 'green',
        fillOpacity: 1.0
    }).addTo(map);
pos = [_.last(items).Latitude, _.last(items).Longitude]

circle = L.circle(pos, 50, {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 1.0
    }).addTo(map);
  return 'the boat travelled from lat:'+_.first(items).Latitude+' long:' +_.first(items).Longitude
  +' (green) to lat:'+_.last(items).Latitude+' long:'+_.last(items).Longitude+' (blue)'
}
// where were the most common sample value measured?
function func9(){
  var mostCommonSample = func6();
  // assume center is close to middle of path for making map
  var midIndex = _.round((items.length)/2)
  var pos = [items[midIndex].Latitude, items[midIndex].Longitude]
  var el = $(this).find('.viz')[0]    // lookup the element that will hold the map
  $(el).height(500) // set the map to the desired height
  var map = createMap(el, pos, 12)
  var hasMostCommonSample = _.filter(items, function(d){
    var x = _.some(d.Samples,function(e){
      return e == mostCommonSample;
    } )
    // grouped = _.groupBy(d.Samples)
    // console.log(d.Ping_index+' '+ _.keys(grouped).join(', '))
    // console.log(x)
    return x
  })
  _.forEach(hasMostCommonSample, function(d, key,items){
    var pos = [parseFloat(d.Latitude), parseFloat(d.Longitude)]
    var circle = L.circle(pos, 1, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.25
    }).addTo(map);
   
  })
  return hasMostCommonSample.length + ' sites have most common sample ('+mostCommonSample+')'
}

//ask('how does the desensity of valid sample values change across the geographical area?', func10)
  // use the brightness to indicate high number of valid sample values each
  // for each measurement, draw a marker,
  // use the brightness to represent the number of valid samples
  // the brighter a spot, the higher the number
  // for those measurements without a valid sample, draw nothing
function func10(){
  var validSamples = _.filter(items,function(d){
    var validValues = _.some(d.Samples,function(d){
      return parseFloat(d) > 0
    })
    return validValues
  })
  validSamples = _.mapValues(validSamples, function(d){
    d.validCount = _.reduce(d.Samples, function(count, e){
      if (e > 0) count+=1;
      return count
    }, 0)
    return d
  })

// assume center is close to middle of path for making map
  var midIndex = _.round((items.length)/2)
  var pos = [items[midIndex].Latitude, items[midIndex].Longitude]
  var el = $(this).find('.viz')[0]    // lookup the element that will hold the map
  $(el).height(1000) // set the map to the desired heightvar map = createMap(el, pos, 12)
  var map = createMap(el, pos, 12)
  var maxValidCount = _.max(validSamples, 'validCount').validCount;
   _.forEach(validSamples, function(d, key,items){
    var pos = [parseFloat(d.Latitude), parseFloat(d.Longitude)]
    var color = 'red'
    if (d.validCount/maxValidCount >= .8) color = 'blue'
    var circle = L.circle(pos, 10, {
        color: color,
        fillColor: color,
        fillOpacity: d.validCount/maxValidCount
    }).addTo(map);
   //console.log(d.Ping_index+' '+d.validCount/maxValidCount)
  })

  return "The density of valid samples is represented by opacity of the fill color. Blue circles are used for valid sample densities > .8 "
}
// 18 kHz is mapped to 1 - fish
// 38 kHz is mapped to 3 - fish
// 70 kHz is mapped to 29
// 120 kHz is mapped to 7 - zooplankton
// 200 kHz is mapped to 13 - zooplankton
function hasFish(sample){
  if (sample <= 0) return false;
  
  var hasFish = false;
  if (sample >= 29) sample -= 29;
  if (sample >= 13) sample -=13;
  if (sample >= 7) sample -= 7; 
  if (sample >= 3) {sample -= 3; hasFish = true;}
  if (sample >= 1) {sample -= 1; hasFish = true;}
  return hasFish;
}
function hasZoopl(sample){
  if (sample <= 0) return false;
  var has = false;
  if (sample >= 29) sample -= 29; 
  if (sample >= 13) {sample -=13; has = true;}
  if (sample >= 7) {sample -= 7; has = true;}
  if (sample >= 3) sample -= 3; 
  if (sample >= 1) sample -= 1; 
  return has;
}
 //ask('what is the distribution of fish?', func11)
function func11(){
var fishSamples = _.filter(items,function(d){
    return _.some(d.Samples,hasFish)
 })
  fishSamples = _.mapValues(fishSamples, function(d){
    d.fish = [];
    d.fishCount = 0;
    _.forEach(d.Samples, function(e,index){
      if (hasFish(e)) {
        d.fish.push(index)
        d.fishCount ++;
      }

    })
    return d
  })

  // // assume center is close to middle of path for making map
  // var midIndex = _.round((items.length)/2)
  // var pos = [items[midIndex].Latitude, items[midIndex].Longitude]
  // var el = $(this).find('.viz')[0]    // lookup the element that will hold the map
  // $(el).height(1000) // set the map to the desired heightvar map = createMap(el, pos, 12)
  // var map = createMap(el, pos, 12)
  // var maxFishCount = _.max(fishSamples, 'validCount').fishCount;
  //  _.forEach(fishSamples, function(d){
  //   var pos = [parseFloat(d.Latitude), parseFloat(d.Longitude)]
  //   var color = 'red'
  //  // if (d.fishCount/maxFishCount >= .8) color = 'blue'
  //   var circle = L.circle(pos, 10, {
  //       color: color,
  //       fillColor: color,
  //       fillOpacity: d.fishCount/1000
  //   }).addTo(map);
  //  // console.log(d.Ping_index+' '+d.fishCount)
  // })  
   

var options = {
  showLine: false,
  
  axisX: {
    // // scaleMinSpace: 100 not supported for x axis
      labelInterpolationFnc: function(value, index) {
        return index % 400 === 0 ? value : null;
      }
    //divisor: 100
    },
  axisY:{
    onlyInteger: true,
    scaleMinSpace: 50
  }
};
var labelArr = []
var serArr = []
_.forEach(fishSamples, function(d){
  _.forEach(d.fish, function(e){
    labelArr.push(d.Ping_index);
    serArr.push(e*-2)  // convert to depth in feet e*-2
  })

})
 
  new Chartist.Line('#chartKari2', {
     labels: labelArr,
     series: [serArr]
    //labels: [1, 2, 3, 4],
    //series: [[100, 120, 180, 200]] 
  }, options);
return "See chart below "
}


function func12(){
var zooplSamples = _.filter(items,function(d){
    return _.some(d.Samples,hasZoopl)
 })
  zooplSamples = _.mapValues(zooplSamples, function(d){
    d.zoop = [];
    d.zooplCount = 0;
    _.forEach(d.Samples, function(e,index){
      if (hasZoopl(e)) {
        d.zoop.push(index)
        d.zooplCount++;
      }

    })
    return d
  })

  // // assume center is close to middle of path for making map
  // var midIndex = _.round((items.length)/2)
  // var pos = [items[midIndex].Latitude, items[midIndex].Longitude]
  // var el = $(this).find('.viz')[0]    // lookup the element that will hold the map
  // $(el).height(1000) // set the map to the desired heightvar map = createMap(el, pos, 12)
  // var map = createMap(el, pos, 12)
  // var maxZooplCount = _.max(zooplSamples, 'zooplCount').zooplCount;
  //  _.forEach(zooplSamples, function(d){
  //   var pos = [parseFloat(d.Latitude), parseFloat(d.Longitude)]
  //   var color = 'red'
  //   //if (d.zooplCount/maxZooplCount >= .8) color = 'blue'
  //   var circle = L.circle(pos, 10, {
  //       color: color,
  //       fillColor: color,
  //       fillOpacity: d.zooplCount/1000
  //   }).addTo(map);
  //   //console.log(d.Ping_index+' '+d.zooplCount)
  // }) 
var options = {
  showLine: false,
  
  axisX: {
    // // scaleMinSpace: 100 not supported for x axis
      labelInterpolationFnc: function(value, index) {
        return index % 100 === 0 ? value : null;
      }
    //divisor: 100
    },
  axisY:{
    onlyInteger: true,
    scaleMinSpace: 50
  }
};
var labelArr = []
var serArr = []
_.forEach(zooplSamples, function(d){
  _.forEach(d.zoop, function(e){
    labelArr.push(d.Ping_index);
    serArr.push(e*-2)  // convert to depth - e*-2
  })

})
 
  new Chartist.Line('#chartKari', {
     labels: labelArr,
     series: [serArr]
    //labels: [1, 2, 3, 4],
    //series: [[100, 120, 180, 200]] 
  }, options);
   return  "See chart below"

}