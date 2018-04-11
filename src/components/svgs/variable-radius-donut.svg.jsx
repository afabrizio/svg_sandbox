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
            top: 10,
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
        this.state.tooltip
            .append('circle')
            .attr('r', this.state.radius - 4)
            .attr('cx', (this.state.width / 2) + this.state.margin.left) 
            .attr('cy', (this.state.height / 2) + this.state.margin.top)
            .style('fill', '#fff')
            .style('opacity', 0.75);
        this.state.tooltip
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', 'translate(' + ((this.state.width / 2) + this.state.margin.left) + ',' + ((this.state.height / 2) + this.state.margin.top) + ')');

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
            .select('text')
            .text(self.state.dataset.count + ' Vulnerabilities')

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
            .attr('dy', (d) => -self.state.radialScale(d) )
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
                        .select('text')
                        .text(d.data.key);
                })
                .on('mouseleave', function(d) {
                    d3.select(this)
                        .select('text')
                            .style('font-size', null);
                    self.state.tooltip
                        .select('circle')
                        .style('fill', '#fff');
                    self.state.tooltip
                        .select('text')
                        .text(self.state.dataset.count + ' Vulnerabilities');
                })
                .on('click', function(d) {
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
            .attr('d', (d) => self.state.arc(d) );
        arcs
            .select('text')
            .attr('transform', (d) => 'translate(' + self.state.arc.centroid(d) + ')' )
            .text( (d) => {
                let percentage = (d.value / self.state.dataset.count) * 100;
                return (percentage >= 5) ? d.value : '';
            } );
        // removals:
        arcs
            .exit()
            .remove();

        /* ===< EVENT CAPTURE >=== */
        console.log(this.state)
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
}