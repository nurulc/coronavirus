	let POP = 10000000; // area population suseptable
	let MAX_NEW_INFECTION = 100000; // fudge factor to limit new infections based to the population = 120;
  let SIMULATION_DAYS = 140;
	const DEFAULTS = Object.assign({}, baseOptions);
  
  
  function OPTS(opts) { return Object.assign(Object.assign({}, DEFAULTS), opts)} 
  
let scenarios = [
   { desc: "Best data fit",
     opts: OPTS(DEFAULTS)
   },  
   {
      desc: "Lower infection rate",
      opts:  {
                initial:200,
              becomeSpreader:3.1, daysAsSpreader:3,
              symptomsAppear:5.7,
              infectPerDay:1.009,
              percentRecorded:0.16,
              lockdown:30.3,
              spreadReduction:0.75,
              administrativeDelay:4,
              dateAdjust:30,
              susceptible:2800000,
              maxNewInfection: 330000,
              daysOfSimulation:90,
              showReal:1, isLog:1
          }
    }
  ];

  function createScnearios() {
  	var array = scenarios.map( s=> s.desc);
  	let parent = ID("scenario_div");
  	if( !parent ) throw new Error(scenario_div+" not found");
  	parent.innerHTML = null;
    //Create and append select list
    var selectList = document.createElement("select");
    selectList.id = "scenarios";
    selectList.onchange = () =>{
        //alert("hello "+selectList.value);
        let optV = scenarios.find(e => e.desc === selectList.value);
        baseOptions = OPTS(optV.opts);
        setOptionValues();
        simulate();
        
       // alert(JSON.stringify(baseOptions));
        
    };
    
    parent.appendChild(selectList);

    //Create and append the options
    for (var i = 0; i < array.length; i++) {
        var option = document.createElement("option");
        option.value = array[i];
        option.text = array[i];
        selectList.appendChild(option);
    }

  }
   
  

	
  
  
  const digits = scale => { 
  		if(!scale || scale <= 10) return v => v.toString().slice(0,5); 
      return d3.format(".3s");
  }
  const formatNum = (val,percent,scale) => percent ? d3.format(".0%")(val) : digits(scale)(val);
  console.log(JSON.stringify(baseOptions));

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
    {date: new Date("2020-02-03"), official: 20900}, //28365, 31532
    {date: new Date("2020-02-04"), official: 24641},
    {date: new Date("2020-02-05"), official: 28365},
		{date: new Date("2020-02-06"), official: 31532},//37553
    {date: new Date("2020-02-07"), official: 34958},
    {date: new Date("2020-02-08"), official: 37553}, //40,653
    {date: new Date("2020-02-09"), official: 40653}, //42,760
    {date: new Date("2020-02-10"), official: 43106},
    {date: new Date("2020-02-11"), official: 45171}, //60,310
    {date: new Date("2020-02-12"), official: 60310},
].map(({date, official}) => ({date: date.getTime(), official}));

setTimeout(() => {
    setOptionValues();
	  buildInterface();
    createScnearios();
	  simulate();
	}, 100);
/* window.addEventListener('load', (event) => {
    console.log('page is fully loaded');
    simulate();
  });
 */  
	
  
 function round(val, scale=0.001) {
    return (Math.round(val/scale)*scale).toString().substr(0,6);
}

function _simulate(opts) { 
	let o = Object.assign({}, baseOptions);
	if(opts) o = Object.assign(o, opts);
    SIMULATION_DAYS = o.daysOfSimulation; // run simulation for this number of days
    POP = o.susceptible; // area population suseptable
    MAX_NEW_INFECTION = o.maxNewInfection; 
    
    //console.log({POP});
    let res = computeData(SIMULATION_DAYS, o);
    let err = Math.sqrt(error(officialData, res))/officialData.length*100;
    return [res, err];
} 

function simulate(opts) {
    let [res, err] = _simulate(opts);   
    let span = document.getElementById("error_val");
    if(span) span.innerHTML = round(err);
	  lineChart(res, true, baseOptions.tick, 1200, 600, baseOptions);
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
      newCases: value[3] || 0.1,
      perDay: value[4]
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
	//console.log(addDays(new Date(2020, 0, 25), -5))

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
  
  function last(array) {
     if(!array || !array.length) return undefined;
     return array[array.length-1];
  }

/* 	function arrSum(arr) {
	  if (arr.length === 0) return 0;
	  var result = arr[0];
	  for (var i = 1; i < arr.length; i++)
	    result += arr[i];
	  return result;
	} */
  
  
  // Perform array sum from fractional start and fractional length
  // examples arrSum([2,3,5]) => 2+3+5 => 10
  //          arrSum([2,3,5], 0, 3) => 2+3+5 =>10
  //          arrSum([2,3,5], 0, 1.5) =>  2 + (3*0.5) => 3.5
  //          arrSum([2,3,5], 0.5, 1.5) => (2*0.5) + 3 => 4
  //  so a start of 2.5 will take half the value in index 2 of the array
  function arrSum(arr, start, len) {
    const trunc = Math.trunc;
    if(!start) start = 0;
    if(!len) len = arr.length-start;
    len = Math.min( len, arr.length-start ); 
    let trunc_start = trunc(start);
    let delta = start- trunc_start;
    let sum = 0;
    if(delta > 0 ) {
        let fraction = (1.0-delta);
        sum = arr[trunc_start] * fraction;
        start = trunc_start+1;
        len = len - fraction;
    }
    let delta1 = len- trunc(len);
    if( delta1 > 0 ) {
          sum += arr[start+trunc(len)]*delta1;
          len--;
     }
     for(let i= start; i<start+len; i++) sum += arr[i];
    return sum;
}


	/* function addDays(d, days) {
	  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
	}
	 */
  function addDays(date, days) {
 		 const copy = new Date(Number(date))
  	 copy.setDate(date.getDate() + days)
  return copy
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
	  let spreaders = arrSum(model,becomeSpreader, daysAsSpreader);
	  //const sumInfections = (sum, spreaders) => (sum || 0) + Math.min(MAX_NEW_INFECTION, spreaders * perDay);
	  //let newInfections = spreadPeriod.reduce(sumInfections, 0);
    //let newInfections =  Math.min(MAX_NEW_INFECTION,spreaders*perDay);
    let newInfections = arrSum(model,becomeSpreader, daysAsSpreader) * perDay;
        
	  const forwardOneDay = model.slice(0, model.length - 1); // all existing infected people list moves forward by one day
	  //return { newModel: [newInfections, ...forwardOneDay], actualPerDay: perDay};
    return { newModel: [Math.min(MAX_NEW_INFECTION,newInfections), ...forwardOneDay], 
    				 actualPerDay: perDay
             };

	}

	function doRun(n, options) {
	  var defaults = DEFAULTS;

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
	  const today = new Date("2020-01-25");
	  const asDate = n => addDays(today, n - dateAdjust);
	  //console.log("Test date"+asDate(0))
	  let model = init(initial, daysOfSickness);
	  let sickAcc = 0;
    let accInfected = 0 ;
	  return range(n).map((day) => {
      if(!model) throw Error("no model");
	   	let sick = arrSum(model,symptomsAppear);
	    let newCases = arrSum(model,symptomsAppear + administrativeDelay, 1);
      sickAcc += newCases;
      accInfected += model[0];
      
	    let rateLimit = (POP-accInfected) / POP;  // spread limited by population, as more people are infected the the the effective population reduces
	    let {newModel, actualPerDay} = modelForNextDay(model, day, infectPerDay*rateLimit, becomeSpreader, daysAsSpreader, lockdown, spreadReduction);
      model = newModel;
      if(!model) throw Error("no model");
	    return {
	      day,	
	      date: asDate(day),
	      value: [Math.round(sickAcc * percentRecorded),
        			 Math.round(sick * percentRecorded), 
              sick, Math.round(newCases*percentRecorded),
              actualPerDay
              ]
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
//official simulated showReal
const LAB = { 
			"Reported Infected" : "simulated" , 
      "All Infected" : "showReal", 
      "Newly Infected (recorded)" :"simulated" , 
      "Official Numbers (China)" : "official"
 };

function lineChart(data, _, tickCount = 4, _width = 1000, _height = 700,opts ={}) {
    let {showReal, official, simulated, isLog, newCases, lockdown} = opts;
    //console.log({showReal, official, simulated})
	  function processData(data, modFn, process) {
	    process(data.map(modFn))
	  }

	  function positive(x) {
	    if (!isLog) return Math.max(0,x||0);
	    if (!x) return 1;
	    if (x < 1) return 1;
	    return x;
	  }
    function num(x) {
         console.log("newCases"+ x);
         if(isNaN(x)) return 0;
         return 0;
     }
      
	  // set the dimensions and margins of the graph
	  var margin = {
	      top: 40,
	      right: 120,
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


      
      function legend(svg) {
          var ordinal = d3.scaleOrdinal()
            .domain(["Reported Infected", 
            				 "All Infected", 
                     "Newly Infected (recorded)", 
                     "Official Numbers (China)"])
            .range([ "darkcyan", "red", "grey", "darkorange"]);

          var svg = d3.select("svg");

          svg.append("g")
            .attr("class", "legendOrdinal")
            .attr("transform", "translate(120,50)");

          var legendOrdinal = d3.legendColor()
            .shape("path", d3.symbol().type(d3.symbolSquare).size(100)())
            .shapePadding(1.5)
            //use cellFilter to hide the "e" cell
            .cellFilter(d => !!opts[LAB[d.label]])
            .scale(ordinal);

          svg.select(".legendOrdinal")
            .call(legendOrdinal);
        }
	 
	  //Read the data
	  //d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv",
	  processData(data,

	    // reformat the data if necessary
	    d => ({
	      date: +d.date,
	      value: positive(+d.value),
        realValue: positive(+d.realValue),
        newCases: positive(+d.newCases),
        perDay: d.perDay
	    }), //
	    //return { date : d3.timeParse("%Y-%m-%d")(d.date), value : positive(+d.value) }


	    // Now I can use this dataset:
	    function(data) {
          //console.log(data);
	      // Add X axis --> it is a date format
		    var x = d3.scaleTime()
		        .domain(d3.extent(data, function(d) {
		          return d.date;
		        }))
		        .range([0, width]);
	        legend(svg);
		    svg.append("g")
		        .attr("transform", "translate(0," + height + ")")
		        .call(d3.axisBottom(x));

		      // Add Y axis
		    let minVal = isLog ? 1 : 0;
		    var y = (isLog ? d3.scaleLog() : d3.scaleLinear())
		        .domain([minVal, d3.max(data, d => showReal ? d.realValue: d.value)])
		        .range([height, 0]);
         
        const LL =(text, color, x, y) => lineLabel(svg,text, color, x, y);
        const UPPER = 30;  
         svg.append('rect')
         		.attr("width", width)
            .attr("height", height+UPPER)
            .attr("x", 0)
            .attr("y", -UPPER)
            .attr("fill", 'white'); // set backgrouns
            
        let lockdownDate = data[Math.trunc(lockdown+4)].date;
        let xLockdown = x(lockdownDate);
        svg.append('rect')
         		.attr("width", width-xLockdown)
            .attr("height", height+UPPER)
            .attr("x", xLockdown)
            .attr("y", -UPPER)
            .attr("fill", '#efefffff');
            
        const yL = positive(28-Math.trunc(lockdown))*((height+UPPER)-20)/28-UPPER; 
        svg.append("text")
           // .attr("transform", "rotate(-90)")
            .attr("y", yL)
            .attr("x", xLockdown+10)
            .attr("dy", ".81em")
            //.style("text-anchor", "end")
            .style("font-size", "0.8rem")
            .style('font-weight', 700)
            .attr('fill', "darkblue")
            .text("Lockdown "+dateFormatter(lockdownDate));
          
	      svg.append("g")
	        .call(
	          d3.axisLeft()
	          .scale(y)
	          .tickFormat(d3.format(","))
	          .ticks(tickCount)

	        );
         svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 4)
            .attr("x", "-.25rem")
            .attr("dy", ".81em")
            .style("text-anchor", "end")
            .style("font-size", "0.75rem")
            .text("Number of Infections");

	      // Add  line

	      // Add the line
	    let labelD = data[Math.trunc(data.length*0.95)];
	    let labelR = data[Math.trunc(data.length*0.50)];
	    let labelC = officialData[Math.trunc(officialData.length*0.70)];
        if( simulated ){
          svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "darkcyan")
            .attr("stroke-dasharray","4,1")
            .attr("stroke-width", 2.5)
            .attr("d", d3.line()
              .x(d => x(d.date))
              .y(d => y(d.value))
            );

           LL("Predicted infections (reported)", "darkcyan", x(labelD.date)-50, y(labelD.value), "start");
        }
        if( official ) {
           svg.append("path")
             .datum(officialData)
             .attr("fill", "none")
             .attr("stroke", "darkorange")
             .attr("stroke-width", 3.5)
             .attr("d", d3.line()
                   .x(d => x(d.date))
                   .y(d => y(d.official))
                  );
           svg.selectAll("dot")
             .data(officialData)
             .enter().append("circle")
             .attr("r", 2)
             .attr("cx", function(d) { return x(d.date); })
             .attr("cy", function(d) { return y(d.official); });
             LL("China official Infections", "darkorange", x(labelC.date)-4, y(labelC.official));
        } 
        
        if(showReal){  
          svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-dasharray","5,2")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
              .x(d => x(d.date))
              .y(d => y(d.realValue))
            );
           LL("Predicted infections (actual)", "red", x(labelR.date)+(isLog?40:100), y(labelR.realValue)-15, "start");

          }
        if( simulated ) {
          svg.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", "grey")
          .attr("stroke-dasharray","2,2")
          .attr("stroke-width", 1.5)
          .attr("d", d3.line()
            .x(d => x(d.date))
            .y(d => y(d.newCases))
          );
          if(isLog) LL("New cases/ day (predicted)", "grey", x(labelD.date)-50, y(labelD.newCases)-5);

                  
        };
        addTooltip(svg,x,y,data, officialData, opts, width, height);

	    });
}

function lineLabel(svg, text,color, x,y, end="end" ) {
	svg.append("text")
    .attr("y", y)
    .attr("x", x)
    .attr("dy", "-0.5rem")
    .style("text-anchor", end)
    .style("font-size", "0.6rem")
    //.style('font-weight', 700)
    .attr('fill', color)
    .text(text);
}
   
function dateFormatter(time) {
    const pad = num => ('000' + num).slice(-2); 
    var dateObj = new Date(time);
    
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    return year + "-" + pad(month) + "-" + pad(day);
}
  
  function addTooltip(svg,x,y,data,china, opts, width,height) {
         const {daysAsSpreader}  = opts;
         const bisectDate = d3.bisector(function(d) { return d.date; }).left,
         			 formatValue = d3.format(","),
               dateFormatterD3 = d3.timeFormat("%m/%d/%y");
         var focus = svg.append("g")
            .attr("class", "focus-d3")
            .style("display", "none");

        focus.append("circle")
            .attr("r", 5);

        let rct = focus.append("rect")
            .attr("class", "tooltip-d3")
            .attr("width", 210)
            .attr("height", 120)
            .attr("x", 10)
            .attr("y", -22)
            .attr("rx", 4)
            .attr("ry", 4);

        /* focus.append("text")
            .attr("class", "tooltip-date")
            .attr("x", 18)
            .attr("y", -2); */
        "date,Date\tofficial,Official\tvalue,Reported\tnewCases,New Cases\trealValue,All Infection\tperDay,New Infections".split("\t")
          .map(s => s.split(',')).map(([key,label],i) => {
              focus.append("text")
                  .attr("class", 'tooltip-label')
                  .attr("x", 18)
                  .attr("y", 18*(i)-2)
                  .text(label);

              focus.append("text")
                  .attr("class", "tooltip-d3-"+key)
                  .attr("x", 120)
                  .attr("y", 18*(i)-2);
				
				});
        svg.append("rect")
            .attr("class", "overlay-d3")
            .attr("width", width)
            .attr("height", height)
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); })
            .on("mousemove", mousemove);
        function getItem(arr, x0) {
                let i = bisectDate(arr, x0, 1),
                		d0 = arr[i - 1],
                		d1 = arr[i];
                return x0 - d0.date > d1.date - x0 ? d1 : d0;
        }
        
        let Y = yv => Math.max(Math.min(height-120,yv),0)

        function mousemove() {
            var x0 = x.invert(d3.mouse(this)[0]),
                d = getItem(data,x0);
            var od = china.find(v => dateFormatter(d.date) === dateFormatter(v.date));
            //console.log({d, od, cma: [dateFormatter(d.date), new Date(d.date), od?dateFormatter(od.date):'']});
                
            focus.attr("transform", "translate(" + x(d.date) + "," + y(d.value) + ")");
            focus.select(".tooltip-d3-date").text(dateFormatter(d.date));
            focus.select(".tooltip-d3-value").text(formatValue(Math.round(d.value)));
            focus.select(".tooltip-d3-realValue").text(formatValue(Math.round(d.realValue)));
            focus.select(".tooltip-d3-newCases").text(formatValue(Math.round(d.newCases)));
            focus.select(".tooltip-d3-official")
               .text((od && od.official)?formatValue(Math.round(od.official)):'');
            focus.select(".tooltip-d3-perDay").text(formatValue(Math.round(d.perDay*100*daysAsSpreader)/100)+" /spreader");

        }
  }
  
  function ID(name) { return document.getElementById(name) || {}; }
  
  function adjustValues(opts) {
      return opts; // do nothing for now
  }
  
  function setOptionValues() {
     let b = baseOptions;
     getInterfaceInfo().forEach((e) => {
        let {name, step, percent} = e;
        step = step || 1;
        let actualV = b[name];
        let val = Math.round(actualV/step);
        ID(name+'_val').innerHTML = formatNum(actualV,percent, step);
        ID(name+"_slider").value = val;
     });
     ID('showLog').checked = b.isLog != 0;
     ID('showReal').checked = b.showReal != 0;
  }

	 function getInterfaceInfo() {
   
   	return [
      {name: "infectPerDay", val: 2.3, min: 0, max:10.0, step: 0.001, title: "Infect/Day ",
      	description: " How may people a spreader infects every day, this is just the base for computing the actual new infections per spreader. This value depends on the lockdown factor and the total population seceptable to infection. Hover ove the graph to see the actual new infections created by each spreader"},
      {name: "becomeSpreader", val: 4, min: 0, max:15, title: "Spreader Day ", step: 0.1,
      	description: "Days after infection the person become a spreader"},
      {name: "daysAsSpreader", val: 6,min: 2, max:15, title: "Days as Spreader ", step: 0.1,
      	description: "How many days you a spreader can infect new people before he/she gets too sick to spread"},
      {name: "symptomsAppear", val: 9,min: 5, max:15, title: "Day Symptoms Appear ", step: 0.1,
      	description: "Days after infection visible symptoms appear (recognized as beeing infected)"},
      {name: "percentRecorded", val: 0.02, percent: true, min: 0, max: 1.0, step: 0.01, title: "Percent Recorded ", 
      	description: " Percent of infected people that are recorded/reported as infected"},
      {name: "lockdown", val: 28,min: 0, max:100, title: "Lockdown day ", step: 0.1,
      	description: "Day of lockdown from original start date for simulation"},
      {name: "administrativeDelay", val: 2,min: 0, max:10, title: "Delay recording infection", step: 0.1,
      	description: "Days after symptom appears and hospital authorities record/report the infection"},
      {name: "spreadReduction", val: 0.99, percent: true, min: 0, max:1.0, step: 0.01, title: "Effectivness of Lockdown", 
      	description: "Reduction in spreading after lockdown"},
      {name: "initial",        val: 60, min: 1, max:600, title: "Initially infected (from other sources)", step: 0.1,
      	description: "initial people infected"},
      {name: "daysOfSickness", val: 30, min: 13, max:100, title: "Days of Sickness", 
      	description: "Days from infection to recovery"},
      {name: "susceptible",    val: 1000000, min:1000000, max: 20000000, step: 200000, title: "Sucep. Pop", 
      	description: "total number of people succeptable to infection" },
      {name: "maxNewInfection", val: 100000, min: 20000,  max: 2000000,  step: 10000,   title: "Max Infec/Day",
      	description: "maximum new infection per day" },
      {name: "daysOfSimulation", val: 190,    min: 50,     max: 300,  step: 10, title: "Simul. Len", 
      	description: "How many days the simulation" },
      {name: "dateAdjust", val: 33,min: 0, max:100, title: "Align against actual", 
      	description: "Align the sickness daily list to align with actual statistics date"},
      {name: "ticks", val: 4, min: 2, max:6, title: "ticks", description:"Chart tick count"}
  ];
    }


	function buildInterface() {
    let interface = getInterfaceInfo();
	  let str = getInterface(interface);
	  var div = document.getElementById("interface");
    
         
	  div.innerHTML = str;
    interface.forEach(({name,step,percent}) => {
      step = step || 1;
      var slider =  document.getElementById(name+ '_slider');
      var output = document.getElementById(name+ '_val');
      output.innerHTML = (slider.value)*step;

      slider.oninput = function() {
        output.innerHTML = formatNum(this.value*step,percent,step);
        updateData( name , (+this.value), step);
      }        
    });
    setOptionValues();
	}

	function getInterface(interface) {
   function element(name, props, content,sep='') {
        if(content === undefined && typeof props !== 'object' ) {
            content = props;
            props = {};
        }
        return `<${name}${genProps(props,name,content,sep)}`
    }
    
    function empty(v) {
        if(!v) return true;
        if(Array.isArray(v) && v.length === 0) return true;
        if(typeof v === 'object' && Object.keys(v).length == 0) return true;
        return false;
    }

    function genProps(props,name,content, sep1) {
        if(empty(props) && empty(content)) return "/>";
        let s = Object.keys(props).map(key => setProp(key, props[key])).join(' ');
        if(s) s = ' '+s;
        if( empty(content) ) return s+"/>";
        return `${s}>${sep1||''}${strContent(content)}${sep1||''}</${name}>`
    }
    
    function setProp(name, value) {
        //console.log({name, value})
        if(!name) return "";
        if(name === 'klass') name = 'class';
        let v = strContent(value, ' ').replace(/"/g, '\\"');
        if(!value) return "";
        return `${name}="${v}"`;
    }
    
    function strContent(v,sep) {
        if(!v) return "";
        if(typeof v === 'function') return v() || '';
        if(Array.isArray(v)) {
            return v.map(strContent).join(sep||"");
        }
        if(typeof v === 'string') return v || '';
        
        return ""+v;
    }
    function makeElem(name, sep, dflt) {
        if(!dflt) return (props,c) => element(name, props,c,sep||'');
        else throw Error("Make elem - defaulst not yet implemented")
    }
    const div = makeElem('div','\n'),
        span = makeElem('span'),
        input = makeElem('input'),
        h1 = makeElem('h1'),
        h2  = makeElem('h2'),
        p  = makeElem('p');
    
    
    function toRows(arr, n) {
        if(!n) return [arr];
        let res = [];
        for(let i=0; i<arr.length; i += n) {
            res.push(arr.slice(i,i+n))
        }
        return res;
    }

    function genSlider(opts){
        if(opts === undefined) return "";
        let {name, val, min, max, title, description, step,percent} = opts;
        step = step || 1;
        val = Math.round(val/step);
        min = Math.round(min/step);
        max = Math.round(max/step);
        return div({klass: 'col-md-4'}, () => 
            [div({klass: "my-tooltip"},[
                title+':&nbsp;', 
                span({klass: "my-bold-text", id: name+'_val'},formatNum(val,percent,step)),
                `&nbsp;(${name})`,
                span({klass: "my-tooltiptext"}, description),
                
                ]),
                div({klass: 'my-slidecontainer'},[
                  input({type: 'range', 
                         klass:  "my-slider", 
                         id:`${name}_slider`,
                         min, max, value: val,
                         name}, null),
                  p()
                ])
        ]);
    }
   
    return toRows(interface,3).map( row => 
                div({klass: 'row'},  () => row.map(genSlider).join("\n"))
        ).join('\n')
   }
   
   function downloadJSON(data,name, mime_type) {

    mime_type = mime_type || 'application/json';

    let blob = new Blob([data], {type: mime_type});	
    let link = document.createElement('a');
    link.setAttribute('href', window.URL.createObjectURL(blob));
    link.setAttribute('download', name+'.json');
    link.onclick = function(e) {
      var that = this;
      setTimeout(function() {
        window.URL.revokeObjectURL(that.href);
      }, 1500);
    };
    document.body.appendChild(link); // Required for FF
    link.click();
    link.remove();
}
