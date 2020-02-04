	const POP = 20000000; // area population suseptable
	const MAX_NEW_INFECTION = 50000; // fudge factor to limit new infections based to the population = 120;
  const SIMULATION_DAYS = 90;


	// These are options/parameters needed to perform the simulation
	// Thes values are updated by the user interface

	/* var baseOptions = {
	  // Model parameters
	  initial: 60, // initial people infected
	  daysOfSickness: 30, // days from infection to well or death
	  becomeSpreader: 4, // days after infection you become a spreader
	
	  daysAsSpreader: 6, // how many days you a spreader can infect new people before he/she gets too sick to spread
	  symptomsAppear: 9, // days after infection visible symptoms appear (recognized as beeing infected)
	
	  // Simulation parameters
	  infectPerDay: 2.3, // how may people a spreader infects every day
	  percentRecorded: 0.02, // percent of people who are sick that are identified
	  lockdown: 28, // day of lockdown from original start date
	  spreadReduction: 0.99, // reduction in spreading after lockdown
	  administrativeDelay: 2, // days after symptom appears and person at hospital authorities record
	  dateAdjust: 33, // alligh the sickness daily list to align with actual statistics date
	  ticks: 4,
    all: false
	
	}; */
  

let officialData = [
    {date: new Date("2020-01-20"), official: 282},
    {date: new Date("2020-01-21"), official: 362},
    {date: new Date("2020-01-22"), official: 555},
    {date: new Date("2020-01-23"), official: 653},
    {date: new Date("2020-01-24"), official: 941},
    {date: new Date("2020-01-25"), official: 2040},
    {date: new Date("2020-01-26"), official: 2757},
    {date: new Date("2020-01-27"), official: 4464},
    {date: new Date("2020-01-28"), official: 6057},
    {date: new Date("2020-01-29"), official: 7783},
    {date: new Date("2020-01-30"), official: 9821},
    {date: new Date("2020-01-31"), official: 11948},
    {date: new Date("2020-02-01"), official: 14551},
    {date: new Date("2020-02-02"), official: 17387},
    {date: new Date("2020-02-03"), official: 20900}
].map(({date, official}) => ({date: date.getTime(), official}));

	setTimeout(() => {
    setOptionValues();
	  buildInterface();
	  simulate();
	}, 10);
	window.addEventListener('load', (event) => {
	  console.log('page is fully loaded');
	  simulate();
	});
  
  function round(val, scale=0.001) {
     return Math.round(val/scale)*scale;
  }

	function simulate() { 
    let res = computeData(SIMULATION_DAYS, baseOptions);
    let err = Math.sqrt(error(officialData, res))/officialData.length*100;
    let span = document.getElementById("error_val");
    if(span) span.innerHTML = round(err);
	  lineChart(res, true, baseOptions.tick, 1200, 400, baseOptions);
	}
  
  function computeData(lenOfRun, baseOptions) {
  	let res = doRun(lenOfRun, baseOptions);
	  let testData = res.map(({
	    date,
	    value
	  }) => ({
	    date: new Date(date).getTime(),
	    value: value[0] || 0.1,
      realValue: value[2] || 0.1,
      newCases: value[3] || 0.1
	  }));
    return testData;
  }
  
  function less(a,b) {
   return a.date < b.date;
  }
  
  function square(a) { return a*a; }
  
  function error(officialData, simulatedData) {
      let i=0;
      for(; less(simulatedData[i],officialData[0]); i++);
      return officialData.reduce( (sum, v, j) => sum+square(Math.log(v.official)-Math.log(simulatedData[i+j].value)), 0);
  }


	function setUp() {

	}
	console.log(addDays(new Date(2020, 0, 25), -5))

	function range(start, end) {
	  if (end === undefined) {
	    end = start;
	    start = 0;
	  }
	  let res = []; //newArray(end-start,0);
	  start = start | 0;
	  for (let i = start; i < end; i++) res.push(i);
	  return res;
	}

	function arrSum(arr) {
	  if (arr.length === 0) return 0;
	  var result = arr[0];
	  for (var i = 1; i < arr.length; i++)
	    result += arr[i];
	  return result;
	}


	function addDays(d, days) {
	  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
	}

	// Creates an array of elements representing the days of an infection
	// each entry represents the in each infection day relative to the start of their infection
	// In the simulation we move all the cells 1 place to the right, and the rightmost element drops off
	function init(initialInfection, daysOfSickness) {
	  var model = range(daysOfSickness).map(() => 0); // create a model array all zeros
	  model[0] = initialInfection;
	  return model;
	}

	// In a simulation, create model for the next day of the simulation
	// the next day model is created by shifting all the elements of the array right by 1 cell, dropping the last cell
	// compute the new infections for next day, and put it into 

	function modelForNextDay(model, day, infectPerDay, becomeSpreader, daysAsSpreader, lockdown, spreadReduction) {
	  let reduction = () => day < lockdown ? 1 : (Math.max(Math.exp(-(day - lockdown)), (1 - spreadReduction)));
	  let perDay = reduction() * infectPerDay; //number pof people infected per day per infected person
	  //console.log({day, perDay});
	  let spreadPeriod = model.slice(becomeSpreader, becomeSpreader + daysAsSpreader);
	  const sumInfections = (sum, spreaders) => (sum || 0) + Math.min(MAX_NEW_INFECTION, spreaders * perDay);
	  let newInfections = spreadPeriod.reduce(sumInfections, 0);
	  const forwardOneDay = model.slice(0, model.length - 1); // all existing infected people list moves forward by one day
	  return [newInfections, ...forwardOneDay];
	}

	function doRun(n, options) {
	  var defaults = {
	    initial: 60, // initial people infected
	    daysOfSickness: 30, // days from infection to well or death
	    becomeSpreader: 4, // days after infection you become a spreader
	    infectPerDay: 2.3, // how may people a spreader infects per day
	    daysAsSpreader: 6, // how many days you are a spreader before too sick to spread
	    symptomsAppear: 9, // days after infection visible symptoms appear (recognized as beeing infected)
	    percentRecorded: 0.02, // percent of people who are sick that are identified
	    lockdown: 28, // day of lockdown from original start date
	    spreadReduction: 0.99, // reduction in spreading after lockdown
	    administrativeDelay: 2, // days after symptom appears and person at hospital authorities record
	    dateAdjust: 45 // alligh the sickness daily list to align with actual statistics date
	  };

	  let {
	    initial,
	    daysOfSickness,
	    becomeSpreader,
	    infectPerDay,
	    daysAsSpreader,
	    symptomsAppear,
	    percentRecorded,
	    administrativeDelay,
	    lockdown,
	    spreadReduction,
	    dateAdjust
	  } = adjustValues(Object.assign(defaults, options));
	  const today = new Date(2020, 0, 25);
	  const asDate = n => addDays(today, n - dateAdjust);
	  //console.log("Test date"+asDate(0))
	  let model = init(initial, daysOfSickness);
	  let sickAcc = 0
	  return range(n).map((day) => {
	    let sick = arrSum(model.slice(symptomsAppear, model.length));
	    let newCases = model[symptomsAppear + administrativeDelay];
      sickAcc += newCases;
	    let rateLimit = (POP-sickAcc) / POP;  // spread limited by population, as more people are infected the the the effective population reduces
	    model = modelForNextDay(model, day, infectPerDay*rateLimit, becomeSpreader, daysAsSpreader, lockdown, spreadReduction);
	    return {
	      day,
	      date: asDate(day),
	      value: [Math.round(sickAcc * percentRecorded), Math.round(sick * percentRecorded), sick, Math.round(newCases*percentRecorded)]
	    };
	  })
	}

	window.updateData = function(name, value, scale = 1) {
	  if (baseOptions[name] === undefined) {
	    console.log(`${name} not found in options`);
	  }
	  baseOptions[name] = value * scale;
	  if (baseOptions.becomeSpreader >= baseOptions.daysOfSickness)
	    baseOptions.becomeSpreader = baseOptions.daysOfSickness - 1;
	  if (baseOptions.symptomsAppear >= baseOptions.daysOfSickness)
	    baseOptions.symptomsAppear = baseOptions.daysOfSickness - 1;
	  if (baseOptions.becomeSpreader + baseOptions.daysAsSpreader >= baseOptions.daysOfSickness)
	    baseOptions.daysAsSpreader = baseOptions.daysOfSickness - 1 - baseOptions.becomeSpreader;
	  if (baseOptions.symptomsAppear + baseOptions.administrativeDelay >= baseOptions.daysOfSickness)
	    baseOptions.administrativeDelay = baseOptions.daysOfSickness - 1 - baseOptions.symptomsAppear;
	  simulate();
	  return baseOptions;
	}




	function lineChart(data, _, tickCount = 4, _width = 1000, _height = 400,opts ={}) {
    let {showReal, official, simulated, isLog, newCases} = opts;
    console.log({showReal, official, simulated})
	  function processData(data, modFn, process) {
	    process(data.map(modFn))
	  }

	  function positive(x) {
	    if (!isLog) return x;
	    if (!x) return 1;
	    if (x < 1) return 1;
	    return x;
	  }
	  // set the dimensions and margins of the graph
	  var margin = {
	      top: 10,
	      right: 30,
	      bottom: 30,
	      left: 60
	    },
	    width = _width - margin.left - margin.right,
	    height = _height - margin.top - margin.bottom;

	  // append the svg object to the body of the page
	  let div = document.getElementById("model_target");
	  div.innerHTML = null;
	  var svg = d3.select("#model_target")
	    .append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    .append("g")
	    .attr("transform",
	      "translate(" + margin.left + "," + margin.top + ")");
      function num(x) {
         console.log("newCases"+ x);
         if(isNaN(x)) return 0;
         return 0;
      }
	 
	  //Read the data
	  //d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv",
	  processData(data,

	    // reformat the data if necessary
	    d => ({
	      date: +d.date,
	      value: positive(+d.value),
        realValue: positive(+d.realValue),
        newCases: positive(+d.newCases)
	    }), //
	    //return { date : d3.timeParse("%Y-%m-%d")(d.date), value : positive(+d.value) }


	    // Now I can use this dataset:
	    function(data) {
          console.log(data);
	      // Add X axis --> it is a date format
	      var x = d3.scaleTime()
	        .domain(d3.extent(data, function(d) {
	          return d.date;
	        }))
	        .range([0, width]);
	      svg.append("g")
	        .attr("transform", "translate(0," + height + ")")
	        .call(d3.axisBottom(x));

	      // Add Y axis
	      let minVal = isLog ? 1 : 0;
	      var y = (isLog ? d3.scaleLog() : d3.scaleLinear())
	        .domain([minVal, d3.max(data, d => showReal ? d.realValue: d.value)])
	        .range([height, 0]);
	      svg.append("g")
	        .call(
	          d3.axisLeft()
	          .scale(y)
	          .tickFormat(d3.format(","))
	          .ticks(tickCount)

	        );

	      // Add the line
         if( official ) {
                svg.append("path")
                  .datum(official?officialData:[])
                  .attr("fill", "none")
                  .attr("stroke", "green")
                  .attr("stroke-width", 2.5)
                  .attr("d", d3.line()
                    .x(d => x(d.date))
                    .y(d => y(d.official))
                  );
        } 
	      // Add the line
        if( simulated ){
          svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2.5)
            .attr("d", d3.line()
              .x(d => x(d.date))
              .y(d => y(d.value))
            );
          svg.selectAll("dot")
            .data(data)
            .enter().append("circle")
            .attr("r", 2)
            .attr("cx", function(d) { return x(d.date); })
            .attr("cy", function(d) { return y(d.value); });
        }
        
        if(showReal){  
          svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
              .x(d => x(d.date))
              .y(d => y(d.realValue))
            );
          }
         if( false ) {
                svg.append("path")
                  .datum(data)
                  .attr("fill", "none")
                  .attr("stroke", "black")
                  .attr("stroke-dasharray","2,2")
                  .attr("stroke-width", 0.5)
                  .attr("d", d3.line()
                    .x(d => x(d.date))
                    .y(d => y(d.newCases))
                  );
        } 

	    });
	}
  
  function ID(name) { return document.getElementById(name) || {}; }
  
  function adjustValues(opts) {
      return opts; // do nothing for now
  }
  
  function setOptionValues() {
     let b = baseOptions;
     getInterfaceInfo().forEach((e) => {
        let {name, step} = e;
        step = step || 1;
        let val = Math.round(b[name]/step);
        ID(name+'_val').innerHTML = round(val*step,step);
        ID(name+"_slider").value = val;
     });
     ID('showLog').checked = b.isLog != 0;
     ID('showReal').checked = b.showReal != 0;
  }

	 function getInterfaceInfo() {
   	return [{
	      name: "infectPerDay",
            val: 2.16,
            min: 0,
            max: 10.0,
            step: 0.01,
            title: "infectPerDay",
            description: " How may people a spreader infects every day"
          },
          {
            name: "becomeSpreader",
            val: 4,
            min: 0,
            max: 15,
            title: "Spreader Day",
            description: "Days after infection you become a spreader"
          },
          {
            name: "daysAsSpreader",
            val: 6,
            min: 2,
            max: 15,
            title: "Days as Spreader",
            description: "How many days you a spreader can infect new people before he/she gets too sick to spread"
          },
          {
            name: "symptomsAppear",
            val: 9,
            min: 5,
            max: 15,
            title: "Symptoms Appear",
            description: "Days after infection visible symptoms appear (recognized as beeing infected)"
          },
          {
            name: "percentRecorded",
            val: 0.02,
            min: 0,
            max: 1.0,
            step: 0.01,
            title: "percentRecorded",
            description: " percent of people who are sick that are identified"
          },
          {
            name: "lockdown",
            val: 28,
            min: 0,
            max: 100,
            title: "lockdown",
            description: "Day of lockdown from original start date"
          },
          {
            name: "administrativeDelay",
            val: 2,
            min: 0,
            max: 10,
            title: "administrativeDelay",
            description: "Days after symptom appears and person at hospital authorities record"
          },
          {
            name: "spreadReduction",
            val: 0.99,
            min: 0,
            max: 1.0,
            step: 0.01,
            title: "spreadReduction",
            description: "Reduction in spreading after lockdown"
          },
          {
            name: "initial",
            val: 60,
            min: 1,
            max: 200,
            title: "Initially infected",
            description: "initial people infected"
          },
          {
            name: "daysOfSickness",
            val: 30,
            min: 13,
            max: 100,
            title: "Days of Sickness",
            description: "Days from infection to well (no longer a spreader)"
          },
          {
            name: "dateAdjust",
            val: 33,
            min: 0,
            max: 100,
            title: "dateAdjust",
            description: "Align the sickness daily list to align with actual statistics date"
          },
          {
            name: "ticks",
            val: 4,
            min: 2,
            max: 6,
            title: "ticks",
            description: "chart tick count"
          }
	 	 ];
    }


	function buildInterface() {
	  let str = getInterface();
	  var div = document.getElementById("interface");
	  //div.innerHTML = str;
	}

	function getInterface() {


	  function toRows(arr, n) {
	    if (!n) return [arr];
	    let res = [];
	    for (let i = 0; i < arr.length; i += n) {
	      res.push(arr.slice(i, i + n))
	    }
	    return res;
	  }

	  function genSlider(opts) {
	    if (opts === undefined) return "";
	    let {
	      name,
	      val,
	      min,
	      max,
	      title,
	      description,
	      step
	    } = opts;
	    step = step || 1;
	    val = Math.round(val / step);
	    min = Math.round(min / step);
	    max = Math.round(max / step);
	    return "here"
	  }

	  return toRows(getInterfaceInfo(), 3).map(row => {
	    return ('<div class="row">\n' +
	      row.map(genSlider).join("\n") +
	      "</div>"
	    );
	  }).join('\n');
	}
