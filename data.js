const dataURL = "./data.csv";

// Set up the SVG dimensions
const offsetWidth = document.querySelector(".data__container").offsetWidth;
const margin = {
    top: offsetWidth * 0.05,
    right: offsetWidth * 0.05,
    bottom: offsetWidth * 0.05,
    left: offsetWidth * 0.05,
};
const width = offsetWidth - margin.left - margin.right;
const height = window.innerHeight * 0.8 - margin.top - margin.bottom; // 80% of the viewport height

const svg = d3
    .select(".data__container")
    .append("div")
    .attr("id", "chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const parseRow = (d) => {
    d["Random Data"] = +d["Random Data"];
    return d;
};

// Append a tooltip div
const tooltip = d3
    .select("#chart-container")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");

const main = async () => {
    try {
        const data = await d3.csv(dataURL, parseRow);

        // Convert date string to Date object
        const parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");

        data.forEach((d) => {
            d.Date = parseTime(d.Date);
        });

        // Set up scales
        const xValue = (d) => d.Date;
        const yValue = (d) => d["Random Data"];
        const xScale = d3
            .scaleTime()
            .domain(d3.extent(data, xValue))
            .range([0, width]);
        const yScale = d3
            .scaleLinear()
            .domain(d3.extent(data, yValue))
            .range([height, 0]);

        // Add the x-axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale))
            .call((g) =>
                g
                    .append("text")
                    .attr("x", width - 4 + "px")
                    .attr("y", -8 + "px")
                    .attr("font-weight", "bold")
                    .attr("text-anchor", "end")
                    .attr("fill", "currentColor")
                    .attr("font-size", "32px")
                    .text("Date/Time")
            );

        // Add the y-axis
        svg.append("g")
            .call(d3.axisLeft(yScale))
            .call((g) =>
                g
                    .append("text")
                    .attr("x", "-32px")
                    .attr("y", "-16px")
                    .attr("font-weight", "bold")
                    .attr("text-anchor", "start")
                    .attr("fill", "currentColor")
                    .attr("font-size", "32px")
                    .text("Temperature")
            );

        const line = d3
            .line()
            .curve(d3.curveCatmullRom)
            .x((d) => xScale(d.Date))
            .y((d) => yScale(d["Random Data"]));

        // Draw the line
        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        // Draw the circles on top of the line
        svg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", (d) => xScale(d.Date))
            .attr("cy", (d) => yScale(d["Random Data"]))
            .attr("r", 6)
            .attr("fill", "white")
            .attr("stroke", "black")
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1);
            })
            .on("mousemove", function (event, d) {
                tooltip.style("opacity", 1);
                const x = event.pageX;
                const y = event.pageY;
                tooltip
                    .html(`${d["Random Data"].toFixed(2)}°F`)
                    .style("left", x + 16 + "px")
                    .style("top", y - 16 + "px")
                    .style("font-size", "18px");
            })
            .on("mouseleave", function () {
                tooltip
                    .transition()
                    .duration(100)
                    .style("opacity", 0)
                    .style("left", 0 + "px")
                    .style("top", 0 + "px");
            });

        console.log(data); // Log the loaded data
    } catch (error) {
        console.error("Error loading data:", error);
    }
};

main();
