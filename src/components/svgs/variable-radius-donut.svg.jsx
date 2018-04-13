import React from 'react';
import $ from 'jquery';
import * as d3 from 'd3';

import scan_1 from '../data/nessus-1.csv';
import scan_2 from '../data/nessus-2.csv';
import scan_3 from '../data/nessus-3.csv';

import '../stylesheets/stacked-bar.scss';



export class VarRadiusDonut extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            arc: undefined,
            axis: undefined,
            color: d3.scaleOrdinal(d3.schemeCategory20c),
            data: undefined,
            dataset: undefined,
            height: undefined,
            margin: undefined,
            pie: undefined,
            piedDataset: undefined,
            radialLine: undefined,
            radialScale: undefined,
            svg: undefined,
            tooltip: undefined,
            width: undefined,
        };
    }

    componentDidMount() {
        this.initializeChart();        
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dataset) {
            this.rerenderChart(nextProps.dataset);
        }
    }
  
    componentWillUnmount() { }

    initializeChart() {
        let self = this;

        if (this.state.svg) {
            this.state.svg.selectAll('*').remove();
        }

        /* ===< SIZING >=== */
        this.state.margin = {
            top: 25,
            right: 10,
            bottom: 10,
            left: 10
        }
        this.state.color = d3.scaleOrdinal(d3.schemeCategory20c);
        // defines width and height of chart relative to margins:
        this.state.width = this.props.width - (this.state.margin.left + this.state.margin.right);
        this.state.height = this.props.height - (this.state.margin.top + this.state.margin.bottom);
        this.state.radius = Math.min(self.state.height, self.state.width) / 4;        
        // sizes the SVG element:
        this.state.svg = d3.select('svg[svg="varRadiusDonut"]')
            .attr('width', this.props.width)
            .attr('height', this.props.height);

        /* ===< RADIAL AXIS >=== */
        this.state.radialScale = d3.scaleLinear()
            .range([this.state.radius, 2*this.state.radius]);
        this.state.radialLine = d3.lineRadial()
            .radius( (d) => self.state.radialScale(d[1]) )
            .angle( (d) => -d[0] + Math.PI / 2 );
        this.state.axis = this.state.svg
            .append('g')
            .attr('group', 'radialAxis')
            .attr('transform', 'translate(' + ((this.state.width / 2) + this.state.margin.left) + ',' + ((this.state.height / 2) + this.state.margin.top) + ')');
        
        /* ===< TOOLTIP >=== */
        this.state.tooltip = this.state.svg
            .append('g')
            .attr('group', 'tooltip')
            .style('display', 'none');
        let tooltipRadius = this.state.radius - 4;
        let innerSquareSize = Math.round(2 * tooltipRadius * Math.sin(Math.PI / 4));
        this.state.tooltip
            .append('circle')
            .attr('r', tooltipRadius)
            .attr('cx', (this.state.width / 2) + this.state.margin.left) 
            .attr('cy', (this.state.height / 2) + this.state.margin.top)
            .style('fill', '#fff')
            .style('opacity', 0.75);
        this.state.tooltip
            .append('foreignObject')
            .attr('group', 'textContainer')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', innerSquareSize)
            .attr('height', innerSquareSize)
            .attr('transform', 'translate(' + ((this.state.width / 2) + this.state.margin.left - (innerSquareSize / 2)) + ',' + ((this.state.height / 2) + this.state.margin.top - (innerSquareSize / 2)) + ')')
            .style('text-align', 'center');

        /* ===< DATA >=== */
        // generates the data group:
        this.state.data = this.state.svg
            .append('g')
            .attr('group', 'data')
            .attr('transform', 'translate(' + ((this.state.width / 2) + this.state.margin.left) + ',' + ((this.state.height / 2) + this.state.margin.top) + ')');        
        
        this.state.arc = d3.arc()
            .startAngle( (d) => d.startAngle )
            .endAngle( (d) => d.endAngle )
            .innerRadius(self.state.radius)
            .outerRadius((d) => self.state.radialScale(d.data.value.hosts.length) );

        this.state.pie = d3.pie()
            .sort( (a, b) => b.value.count - a.value.count)
            .value( (d) => d.value.count );
    }

    rerenderChart(dataset) {
        let self = this;
        
        /* ===< DATASET MANIPULATION >=== */
        if (!dataset) {
            return;
        }
        this.state.dataset = dataset;
        this.state.tooltip
            .style('display', 'block');
            self.state.piedDataset = self.state.pie(dataset.description);
        this.state.tooltip
            .select('[group="textContainer"]')
                .html(`
                    <p>
                        <b>${self.state.dataset.count} Vulnerabilities</b>
                    </p>
                    </br>
                    <div>${self.state.dataset.xKey}</div>
                    <div>${self.state.dataset.yKey.key} Risk</div>
                `);

        /* ===< RADIAL AXIS >=== */
        this.state.radialScale
            .domain([0, d3.max(this.state.dataset.description, (d) => d.value.hosts.length )])
            .nice();
        let ticks = this.state.axis
            .selectAll('[group="tick"]')
            .data(this.state.radialScale.ticks(4));
        // new:
        let tick = ticks
            .enter()
            .append('g')
                .attr('group', 'tick');
        tick.append('circle')
            .attr('r', (d) => self.state.radialScale(d) )
            .style('stroke', 'black')
            .style('stroke-width', 1)
            .style('stroke-dasharray', '4, 2')
            .style('opacity', (d) => (d%1 === 0) ? .25 : 0 )
            .style('fill', 'none');
        tick.append('text')
            .attr('dx', 2)
            .attr('dy', (d) => -self.state.radialScale(d) - 2 )
            .style('text-anchor', 'start')
            .style('font-size', 8)
            .style('opacity', (d) => (d%1 === 0) ? 1 : 0)
            .text( (d) =>  d );
        // updates:
        ticks.select('circle')
            .attr('r', (d) => self.state.radialScale(d) )
            .style('opacity', (d) => (d%1 === 0) ? .25 : 0 );
        ticks.select('text')
            .attr('dy', (d) => -self.state.radialScale(d) - 2 )
            .style('opacity', (d) => (d%1 === 0) ? 1 : 0)
            .text( (d) =>  d );
        // removals:
        ticks
            .exit()
            .remove();

        /* ===< ARCS >=== */
        let arcs = self.state.data
            .selectAll('[group="arc"]')
            .data(self.state.piedDataset, (d) => d.data.key );
        // new:
        let arc = arcs
            .enter()
            .append('g')
                .attr('group', 'arc')
                .attr('key', (d) => d.data.key )
                .style('fill', (d) => self.state.color(d.data.key) )                
                .on('mouseenter', function(d) {
                    d3.select(this)
                        .select('text')
                        .style('font-size', 14);
                    self.state.tooltip
                        .select('circle')
                        .style('fill', self.state.color(d.data.key) );
                    self.state.tooltip
                        .select('[group="textContainer"]')
                        .html(`
                            <p><b>${d.data.key}</b></p>
                            <br>
                            <div>${d.data.value.count} occurences</div>
                            <div>${d.data.value.hosts.length} hosts affected</div>
                        `)
                })
                .on('mouseleave', function(d) {
                    d3.select(this)
                        .select('text')
                            .style('font-size', null);
                    self.state.tooltip
                        .select('circle')
                        .style('fill', '#fff');
                    self.state.tooltip
                        .select('[group="textContainer"]')
                        .html(`
                            <p>
                                <b>${self.state.dataset.count} Vulnerabilities</b>
                            </p>
                            </br>
                            <div>${self.state.dataset.xKey}</div>
                            <div>${self.state.dataset.yKey.key} Risk</div>
                        `);
                })
                .on('click', function(d) {
                    d.data.color = self.state.color(d.data.key);
                    d.data.yKey = self.state.dataset.yKey;
                    d.data.yKey.count = self.state.dataset.count;
                    d.data.xKey = self.state.dataset.xKey;
                    self.props.commandCenter({
                        table: d.data
                    });
                    // required update since click event fires mouseleave handler:
                    self.state.tooltip
                        .select('circle')
                        .style('fill', self.state.color(d.data.key) );
                    self.state.tooltip
                        .select('[group="textContainer"]')
                        .html(`
                            <p><b>${d.data.key}</b></p>
                            <br>
                            <div>${d.data.value.count} occurences</div>
                            <div>${d.data.value.hosts.length} hosts affected</div>
                        `)
                    // (re)defines a dynamically colored pattern for the selected bar segment:
                    self.state.svg
                        .select('#selectedPatternB')
                        .remove();
                    let pattern = self.state.svg
                        .select('defs')
                        .append('pattern')
                            .attr('id', 'selectedPatternB')
                            .attr('patternUnits', 'userSpaceOnUse')
                            .attr('width', 10)
                            .attr('height', 10);
                    pattern.append('image')
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr('width', 10)
                        .attr('height', 10)
                        .attr('xlink:href', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+CiAgPHJlY3Qgd2lkdGg9JzEwJyBoZWlnaHQ9JzEwJyBmaWxsPSd3aGl0ZScvPgogIDxwYXRoIGQ9J00tMSwxIGwyLC0yCiAgICAgICAgICAgTTAsMTAgbDEwLC0xMAogICAgICAgICAgIE05LDExIGwyLC0yJyBzdHJva2U9J2JsYWNrJyBzdHJva2Utd2lkdGg9JzEnLz4KPC9zdmc+Cg==');
                    pattern.append('rect')
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr('width', 10)
                        .attr('height', 10)
                        .attr('fill', self.state.color(d.data.key))
                        .style('opacity', 0.9);
                    // updated DOM with new selection:
                    self.state.svg
                        .selectAll('[path="slice"]')
                            .style('fill', null);
                    d3.select(this)
                        .select('path')
                            .style('fill', 'url(#selectedPatternB)');
                });
        arc
            .append('path')
            .attr('path', 'slice')
            .attr('d', (d) => self.state.arc(d) )
            .style('stroke', 'white')
            .style('opacity', 0.75);
        arc
            .append('text')
            .attr('transform', (d) => 'translate(' + self.state.arc.centroid(d) + ')' )
            .attr('dy', '.35em')
            .style('text-anchor', 'middle')
            .style('fill', 'black')
            .text( (d) => {
                let percentage = (d.value / self.state.dataset.count) * 100;
                return (percentage >= 5) ? d.value : '';
            } );
        // updates:
        arcs
            .select('path')
            /* NOTE: Must use select() instead of selectAll()
                Nesting selections has another subtle yet critical side-effect: it sets the parent node for each group.
                The parent node is a hidden property on selections that determines where to append entering elements.
                There is an important difference between select and selectAll:
                    - select preserves the existing grouping
                    - selectAll creates a new grouping.
                Calling select thus preserves the data, index and even the parent node of the original selection!
            */
            .transition()
            .duration(750)
            .attrTween('d', function(d) {
                let i = d3.interpolate(this._current, d);
                this._current = i(0);
                return (t) => self.state.arc(i(t)) ;
            });
        arcs
            .select('text')
            .transition()
            .duration(750)
            .attrTween('transform', function(d) {
                let i = d3.interpolate(this._current, d);
                this._current = i(0);
                return (t) => 'translate(' + self.state.arc.centroid(i(t)) + ')';
            })
            .text( (d) => {
                let percentage = (d.value / self.state.dataset.count) * 100;
                return (percentage >= 5) ? d.value : '';
            } );
        // removals:
        arcs
            .exit()
            .remove();

        // console.log(this.state)
    }

    render() {
        return (
            <div name="varRadiusDonut">               
                <svg svg="varRadiusDonut" width={this.props.width} xmlns="http://www.w3.org/2000/svg" version="1.1">
                    <defs></defs>
                </svg>
            </div>
        );
    }

    svgTextWrap(text, width) {
        text.each(function() {
            let text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }
}

/* Inspiration came from a combination of these examples:
  1. https://bl.ocks.org/mbhall88/b2504f8f3e384de4ff2b9dfa60f325e2
  2. http://bl.ocks.org/mccannf/3994129 (variable radius)
  3. https://bl.ocks.org/mbostock/5682158 (animations)
*/