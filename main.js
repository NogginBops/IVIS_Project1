const peopleIndex = d3.local();
const groupIndex = d3.local();
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
const groupTooltip = groupList.append("div")
groupTooltip.style("opacity", 0)
groupTooltip.attr("class", "tooltip")
groupTooltip.append("h4").attr("id", "alias")
groupTooltip.append("p").attr("id", "keywords")

var currentGroup = []

d3.csv("Project1_data_cleaned.csv").then(function (csv) {
    console.log(csv)
    console.log(peopleList)

    csv.sort((a, b) => d3.ascending(a.Alias, b.Alias))

    {
        let data = csv[0]
        delete data.Timestamp
        keys = Object.keys(data).sort((a, b) => d3.ascending(a.Alias, b.Alias))

        // Remove sorting by keywords.
        let index = keys.indexOf("Keywords");
        if (index !== -1) keys.splice(index, 1)
    }

    const sort_selection = d3.select("#peoplesort")
    sort_selection
        .selectAll("option")
        .data(keys)
        .enter()
        .append("option")
        .attr("value", (_, i) => keys[i])
        .text(d => d)

    sort_selection.on('change', function (e) {
        console.log(e)
        console.log(this.selectedIndex)
        key = keys[this.selectedIndex]

        console.log(typeof key)
        console.log(key)
        console.log(csv[0][key])
        let isNumeric = key !== "Alias";
        sorted = csv.sort(function (a, b) { if (isNumeric) return d3.descending(+a[key], +b[key]); else return d3.ascending(a[key], b[key]); })
        console.log(sorted)

        set = populatePeopleList(peopleList, sorted)
    });

    initPeopleList(peopleList, csv);

    populateGroupList(groupList, currentGroup);

    spider(currentGroup, keys);

    populateKeywords(currentGroup);
})

function initPeopleList(peopleList, peopleData)
{
    set = populatePeopleList(peopleList, peopleData);

    set.on('mouseover', function (event, data)  {
        d3.select(this).transition()
        .duration(30).style("background", highlightColor)
        
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
        isOdd = peopleIndex.get(this) % 2 === 1;
        d3.select(this).transition()
        .duration(100).style("background", isOdd ? oddColor : evenColor)

        peopleTooltip.style("opacity", 0)
    })

    set.on('click', function (event, data) {
        if (currentGroup.includes(data) === false)
        {
            currentGroup.push(data);
            populateGroupList(groupList, currentGroup);

            populateKeywords(currentGroup);

            spider(currentGroup, keys);
        }
    })
}

function populatePeopleList(peopleList, peopleData)
{
    console.log(peopleData)
    data = peopleList.selectAll("li").data(peopleData)
    
    set = data.join('li').each(function (d, i) { peopleIndex.set(this, i) })
    
    set.text(d => d.Alias)

    set.filter(function (d, i) { return i % 2 === 0; })
        .style("background", evenColor)
    set.filter(function (d, i) { return i % 2 === 1; })
        .style("background", oddColor)

    return set
}

function populateGroupList(groupList, groupData)
{
    data = groupList.selectAll('li').data(groupData);

    set = data.join('li').each(function (d, i) { groupIndex.set(this, i) })

    set.text(d => d.Alias)

    set.filter(function (d, i) { return i % 2 === 0; })
        .style("background", evenColor)
    set.filter(function (d, i) { return i % 2 === 1; })
        .style("background", oddColor)

    set.on('mouseover', function (event, data)  {
        d3.select(this).transition()
        .duration(30).style("background", highlightColor)
        
        groupTooltip.style("opacity", 1)
        groupTooltip.select("#alias").text(data.Alias)
        groupTooltip.select("#keywords").text(data.Keywords)
        groupTooltip.style("left", (event.pageX + 15) + "px")
        groupTooltip.style("top", (event.pageY + 15) + "px")
    })

    set.on('mousemove', function (event, data) {
        console.log(groupTooltip.node().offsetWidth)
        groupTooltip.style("left", (event.pageX - 15 - groupTooltip.node().offsetWidth) + "px")
        groupTooltip.style("top", (event.pageY - 15) + "px")
    })

    set.on('mouseout', function (data, event, i)  {
        isOdd = peopleIndex.get(this) % 2 === 1;
        d3.select(this).transition()
        .duration(100).style("background", isOdd ? oddColor : evenColor)

        groupTooltip.style("opacity", 0)
    })

    set.on('click', function (event, data) {
        let index = currentGroup.indexOf(data)
        if (index !== -1)
        {
            currentGroup.splice(index, 1)
            populateGroupList(groupList, currentGroup);

            populateKeywords(currentGroup);
            spider(currentGroup, keys);
        }

        groupTooltip.style("opacity", 0)
    })

    return set
}

function spider(groupMembers, labels)
{
    data = []
    let sum = {}
    for (const label of labels) {
        if (label == "Alias") continue;
        sum[label] = 0;
    }

    for (const member of groupMembers) {
        for (const key in member) {
            if (Object.hasOwnProperty.call(member, key) && key != "Timestamp" && key != "Alias" && key != "Keywords") {
                const element = member[key];
                
                sum[key] = sum[key] + (+element)
            }
        }
    }

    function create_axis(name, values) {
        axes = []
        for (const key in values) {
            if (Object.hasOwnProperty.call(values, key)) {
                const element = values[key];
                
                axes.push({axis: key, value: element});
            }
        }
        return { className: name, axes: axes };
    }

    data.push(create_axis("Sum", sum))
    
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var margin = {top: 130, right: 100, bottom: 170, left: 100};
    
    var radarChartOptions = {
        w: 800 - margin.right - margin.left,
        h: 600 - margin.bottom - margin.top,
        margin: margin,
        maxValue: 10 * Math.max(currentGroup.length, 1),
        levels: 4,
        roundStrokes: false,
        color: color,
        wrapWidth: 100,
      };

    RadarChart("#plot", data, radarChartOptions);
}

function populateKeywords(groupMembers)
{
    console.log(groupMembers)

    keywords = {}
    for (const member of groupMembers) {
        console.log(member)
        for (keyword of member.Keywords.split(',')) {
            keyword = keyword.trim();
            if (keywords.hasOwnProperty(keyword)) keywords[keyword].count += 1;
            else keywords[keyword] = {count: 1, members: []};

            keywords[keyword].members.push(member)
        }
    }
    console.log(keywords)

    list = []
    for (const key in keywords) {
        if (Object.hasOwnProperty.call(keywords, key)) {
            const element = keywords[key];
            list.push({ keyword: key, count: element.count, members: element.members });
        }
    }
    console.log(list)

    list.sort((a, b) => d3.ascending(a.keyword, b.keyword)).sort((a, b) => d3.descending(a.count, b.count));

    set = d3.select("#keywordlist").selectAll('p').data(list).join('p');

    set.text(function (d, i) { console.log(d); return d.keyword + " x" + d.count; });

    set.on('mouseover', function (event, data)  {
        d3.select(this).transition()
            .duration(30).style("background", highlightColor)

        console.log(data)

        members = groupList.selectAll('li').filter(function (d) { return data.members.some((m) => d.Alias === m.Alias); });

        console.log(members)

        members.transition()
            .duration(30).style("background", highlightColor)
    })

    set.on('mouseout', function (event, data, i)  {
        d3.select(this).transition()
            .duration(100).style("background", 'rgb(35, 24, 29)')

        console.log(data)

        members = groupList.selectAll('li').filter(function (d) { return data.members.some((m) => d.Alias === m.Alias); });

        console.log(members)

        members.each(function (m) { 
            isOdd = peopleIndex.get(this) % 2 === 1;
            d3.select(this).transition()
            .duration(100).style("background", isOdd ? oddColor : evenColor)
         });
    })
}