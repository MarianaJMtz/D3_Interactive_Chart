var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(USData, chosenXAxis) {
  // create scales for X
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(USData, d => d[chosenXAxis] * 0.8),
      d3.max(USData, d => d[chosenXAxis]* 1.1)
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(USData, chosenYAxis) {
  // create scales for Y
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(USData, d => d[chosenYAxis]*0.8),
      d3.max(USData, d => d[chosenYAxis]*1.1)
    ])
    .range([0, height]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxesX(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderAxesY(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}

// function used for updating circles group with a transition to
// new circles Y
function renderCirclesY(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// new circles X
function renderCirclesX(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

//new texts Y
function renderTextsY(circlesTexts, newYScale, chosenYAxis) {

  circlesTexts.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis]));

  return circlesTexts;
}

//new texts X
function renderTextsX(circlesTexts, newXScale, chosenXAxis) {

  circlesTexts.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));

  return circlesTexts;
}

// function used for updating circles group with new tooltip in X
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var xLabel = "In Poverty (%):";
  }
  else if (chosenXAxis === "age") {
    var xLabel = "Age (Median):";
  }
  else {
    var xLabel = "Household Income (Median):";
  }

  if (chosenYAxis === "healthcare") {
    var yLabel = "Lacks Healthcare (%):";
  }
  else if (chosenYAxis === "obesity") {
    var yLabel = "Obese (%):";
  }
  else {
    var yLabel = "Smokes (%):";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .style("background", "dimgray")
    .offset([80, -60])
    .html(function(d) {
      return (`<span style = 'color:white'>${d.state}<br>${yLabel} ${d[chosenYAxis]}<br>${xLabel} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv")
  .then(function(USData) {

  // parse data
  USData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.income = +data.income;
    data.age = +data.age;
    data.abbr = data.abbr;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(USData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(USData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .attr("transform", `translate(0, 0)`)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(USData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 11)
    .attr("fill", "steelblue")
    .attr("opacity", ".5");

  // add text on circles
  var circlesTexts = chartGroup.selectAll("text")
    .data(USData)
    .enter()
    .append("text")
    .text(d => d.abbr)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .attr("font-weight", 500)
    .attr("font-size", "10px");

  // Create group for  2 x- axis labels
  var XlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = XlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = XlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = XlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  var YlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${-80}, ${height/2})`);

  var healthcareLabel = YlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 10)
    .attr("transform", "rotate(-90)")
    .attr("value", "healthcare") //value to grab for event listener
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var obesityLabel = YlabelsGroup.append("text")
    .attr("x", -30)
    .attr("y", 30)
    .attr("transform", "rotate(-90)")
    .attr("value", "obesity") //value to grab for event listener
    .classed("active", false)
    .text("Obese (%)");

  var smokesLabel = YlabelsGroup.append("text")
    .attr("x", -30)
    .attr("y", 50)
    .attr("transform", "rotate(-90)")
    .attr("value", "smokes") //value to grab for event listener
    .classed("active", false)
    .text("Smokes (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  XlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(USData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxesX(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCirclesX(circlesGroup, xLinearScale, chosenXAxis);

        //update texts with new x values
        circlesTexts = renderTextsX(circlesTexts, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
    // y axis labels event listener
  YlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

        console.log(chosenYAxis)

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(USData, chosenYAxis);

        // updates x axis with transition
        yAxis = renderAxesY(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCirclesY(circlesGroup,yLinearScale, chosenYAxis);

        //update texts with new x values
        circlesTexts = renderTextsY(circlesTexts, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "obesity") {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
});
