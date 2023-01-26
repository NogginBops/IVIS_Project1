const index = d3.local();
const evenColor = "rgb(36, 23, 41)"
const oddColor = "rgb(16, 3, 21)"
const highlightColor = "rgb(66, 53, 71)"

const peopleList = d3.select("#peoplelist").append("ul")

const peopleTooltip = peopleList.append("div")
peopleTooltip.style("opacity", 0)
peopleTooltip.attr("class", "tooltip")
peopleTooltip.append("h4").attr("id", "alias")
peopleTooltip.append("p").attr("id", "keywords")

const groupList = d3.select("#grouplist").append("ul")

console.log("test print")

//peopleList.append("div").style("opacity", 0)

// write your d3 code here.. 
d3.csv("Project1_data_cleaned.csv").then(function (csv) {
    console.log(csv)
    console.log(peopleList)

    set = peopleList.selectAll("li").data(csv).enter().append("li")
        .each(function (d, i) { index.set(this, i) })
    set.text(d => d['Alias'])
    
    set.filter(function (d, i) { return i % 2 === 0; })
        .style("background", evenColor)
        set.filter(function (d, i) { return i % 2 === 1; })
        .style("background", oddColor)

    set.on('mouseover', function (event, data)  {
        d3.select(this).transition()
        .duration(30).style("background", highlightColor)
        
        // FIXME: Add tooltip.
        peopleTooltip.style("opacity", 1)
        peopleTooltip.select("#alias").text(data.Alias)
        peopleTooltip.select("#keywords").text(data.Keywords)
        peopleTooltip.style("left", (event.pageX + 15) + "px")
        peopleTooltip.style("top", (event.pageY + 15) + "px")
    })

    set.on('mousemove', function (event, data) {
        peopleTooltip.style("left", (event.pageX + 15) + "px")
        peopleTooltip.style("top", (event.pageY + 15) + "px")
    })

    set.on('mouseout', function (data, event, i)  {
        isOdd = index.get(this) % 2 === 1;
        d3.select(this).transition()
        .duration(100).style("background", isOdd ? oddColor : evenColor)

        peopleTooltip.style("opacity", 0)
    })

    set.on('click', function (event, data) {
        groupList.append('li').text(data.Alias)
    })
})

/*d3.json("test.json").then(function (json) { 
    console.log(json) 

    const div = d3.select("body").append("div")

    for (const prop in json) {
        if (Object.hasOwnProperty.call(json, prop)) {
            const element = json[prop];
            
            const header = div.append("h1").text(prop)//.style("opacity: 0.5")
            header.style("opacity", 0.0)
            const par = div.append("p").text(element)//.style("opacity: 0.5")
            par.style("opacity", 0.0)

            header.transition().duration(500).ease(d3.easeLinear).style("opacity", 1)
            par.transition().delay(250).duration(600).ease(d3.easeLinear).style("opacity", 1)
        }
    }
    })*/