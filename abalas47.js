document.addEventListener("DOMContentLoaded", () => {
    function processText(text) {
        console.log("Input text:", text); 
        const vowel_input = "aeiouy";
        const consonant_input = "bcdfghjklmnpqrstvwxz";
        const punct_input = ".,!?:;";
        let vowel_counts = {};
        let consonant_counts = {};
        let punctuation_counts = {};
        text.toLowerCase().split("").forEach(char => {
            if (vowel_input.includes(char)) {
                vowel_counts[char] = (vowel_counts[char] || 0) + 1;
            } else if (consonant_input.includes(char)) {
                consonant_counts[char] = (consonant_counts[char] || 0) + 1;
            } else if (punct_input.includes(char)) {
                punctuation_counts[char] = (punctuation_counts[char] || 0) + 1;
            }
        });
        const data = {
            name: "root",
            children: [
                {
                    name: "vowel_input",
                    children: Object.keys(vowel_counts).map(char => ({
                        name: char,
                        value: vowel_counts[char]
                    }))
                },
                {
                    name: "consonant_input",
                    children: Object.keys(consonant_counts).map(char => ({
                        name: char,
                        value: consonant_counts[char]
                    }))
                },
                {
                    name: "punct_input",
                    children: Object.keys(punctuation_counts).map(char => ({
                        name: char,
                        value: punctuation_counts[char]
                    }))
                }
            ]
        };

        console.log("Processed data:", data);
        return data;
    }
    function drawTreemap(data) {
        console.log("Drawing treemap with data:", data);
        const treemap = d3.treemap()
            .size([580, 400]) 
            .padding(1);
        const root = d3.hierarchy(data)
            .sum(d => d.value);
        treemap(root);
        console.log("Treemap root:", root); 
        const svg = d3.select("#tmap_svg");
        svg.selectAll("*").remove(); 
        const cells = svg.selectAll("g")
            .data(root.leaves())
            .enter()
            .append("g")
            .attr("transform", d => `translate(${d.x0},${d.y0})`);
        console.log("Number of cells:", cells.size());
        const color = {
            vowel_input: "#FFDAB9",
            consonant_input: "#D3D3D3",
            punct_input: "#ADD8E6"
        };
        cells.append("rect")
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => {
                const parentName = d.parent.data.name;
                return color[parentName];
            })
            .attr("stroke", "black")
            .attr("stroke-width", 1);
        cells.append("text")
            .attr("x", 5)
            .attr("y", 15)
            .text(d => d.data.name)
            .attr("class", "treemap-text"); 
        console.log("Treemap rendered successfully"); 
        cells.on("click", function(event, d) {
            console.log("Clicked on character:", d.data.name); 
            const char_selected = d.data.name;
            const text = document.getElementById("input_val").value;
            const sankeyData = buildSankeyData(text, char_selected);
            drawSankey(sankeyData, char_selected);
        });
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background", "white")
            .style("border", "1px solid black")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("pointer-events", "none");
        cells.on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(`Character: ${d.data.name}<br>Count: ${d.data.value}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
            highlightSankey(d.data.name);
            highlightTreemap(d.data.name);
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 5) + "px")
                   .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(event, d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
            unhighlightSankey(d.data.name);
            unhighlightTreemap(d.data.name);
        });
    }
    function buildSankeyData(text, char_selected) {
        console.log("Building Sankey data for character:", char_selected); 
        const characters = text.toLowerCase().split("");
        const sankeyData = { nodes: [], links: [] };
        sankeyData.nodes.push({ name: `before_${char_selected}` });
        sankeyData.nodes.push({ name: char_selected });
        sankeyData.nodes.push({ name: `after_${char_selected}` });
        let beforeCounts = {};
        let afterCounts = {};
        for (let i = 0; i < characters.length; i++) {
            if (characters[i] === char_selected) {
                const prevChar = characters[i - 1];
                const nextChar = characters[i + 1];

                if (prevChar) beforeCounts[prevChar] = (beforeCounts[prevChar] || 0) + 1;
                if (nextChar) afterCounts[nextChar] = (afterCounts[nextChar] || 0) + 1;
            }
        }
        Object.keys(beforeCounts).forEach(char => {
            sankeyData.links.push({
                source: `before_${char_selected}`,
                target: char_selected,
                value: beforeCounts[char]
            });
        });

        Object.keys(afterCounts).forEach(char => {
            sankeyData.links.push({
                source: char_selected,
                target: `after_${char_selected}`,
                value: afterCounts[char]
            });
        });

        console.log("Sankey data:", sankeyData);
        return sankeyData;
    }

    
    function drawSankey(data, char_selected) {
        console.log("Drawing Sankey diagram for character:", char_selected); 
        console.log("Sankey data before layout:", data); 
        if (!data.nodes || !data.links) {
            console.error("Invalid Sankey data:", data);
            return;
        }
        const sankey = d3.sankey()
            .nodeWidth(15)
            .nodePadding(10)
            .size([580, 400]);
        const nodeMap = {};
        data.nodes.forEach((node, i) => {
            nodeMap[node.name] = i;
        });
        data.links.forEach(link => {
            link.source = nodeMap[link.source];
            link.target = nodeMap[link.target];
        });

        const { nodes, links } = sankey(data);

        const svg = d3.select("#sankey_svg");
        svg.selectAll("*").remove(); 
        const node = svg.append("g")
            .selectAll(".node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "node");
        node.append("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("fill", d => {
                if (d.name === char_selected) return "orange";
                return "gray";
            })
            .on("mouseover", function(event, d) {
                highlightTreemap(d.name);
                highlightSankey(d.name);
            })
            .on("mouseout", function(event, d) {
                unhighlightTreemap(d.name);
                unhighlightSankey(d.name);
            });
        node.append("text")
            .attr("x", d => (d.x0 + d.x1) / 2)
            .attr("y", d => d.y0 - 10)
            .attr("text-anchor", "middle")
            .text(d => d.name)
            .attr("class", "sankey-text"); 
        const link = svg.append("g")
            .selectAll(".link")
            .data(links)
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke-width", d => Math.max(1, d.width));
        document.getElementById("labelName").textContent = `Character flow for '${char_selected}'`;
        console.log("Sankey diagram rendered successfully"); 
    }

    function highlightSankey(char) {
        d3.select("#sankey_svg").selectAll(".node rect")
            .filter(d => d.name === char)
            .attr("stroke", "yellow")
            .attr("stroke-width", 3);

        d3.select("#sankey_svg").selectAll(".sankey-text")
            .filter(d => d.name === char)
            .style("font-weight", "bold")
            .style("fill", "yellow");
    }
    function unhighlightSankey(char) {
        d3.select("#sankey_svg").selectAll(".node rect")
            .filter(d => d.name === char)
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        d3.select("#sankey_svg").selectAll(".sankey-text")
            .filter(d => d.name === char)
            .style("font-weight", "normal")
            .style("fill", "black");
    }
    function highlightTreemap(char) {
        d3.select("#tmap_svg").selectAll("rect")
            .filter(d => d.data.name === char)
            .attr("stroke", "yellow")
            .attr("stroke-width", 3);

        d3.select("#tmap_svg").selectAll(".treemap-text")
            .filter(d => d.data.name === char)
            .style("font-weight", "bold")
            .style("fill", "yellow");
    }
    function unhighlightTreemap(char) {
        d3.select("#tmap_svg").selectAll("rect")
            .filter(d => d.data.name === char)
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        d3.select("#tmap_svg").selectAll(".treemap-text")
            .filter(d => d.data.name === char)
            .style("font-weight", "normal")
            .style("fill", "black");
    }
    document.querySelector("button").addEventListener("click", () => {
        const text = document.getElementById("input_val").value;
        const data = processText(text);
        drawTreemap(data);
    });
});














