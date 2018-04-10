import React from 'react';
import * as d3 from 'd3';

import '../stylesheets/stacked-bar.scss';



export class StackedBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = { 
            axis: undefined,
            data: undefined,
            dataset: undefined,
            height: undefined,
            legend: undefined,
            margin: undefined,
            stackedDataset: undefined,
            svg: undefined,
            width: undefined,
            x: undefined,
            xAxis: undefined,
            y: undefined,
            yAxis: undefined,
            yKeys: [
                {
                    "label": "None",
                    "color": "#357ABD",
                    "zIndex": 0,
                    "visible": false
                },
                {
                    "label": "Low",
                    "color": "#4CAE4C",
                    "zIndex": 1,
                    "visible": false
                },
                {
                    "label": "Medium",
                    "color": "#FDC431",
                    "zIndex": 2,
                    "visible": true        
                },
                {
                    "label": "High",
                    "color": "#EE9336",
                    "zIndex": 3,
                    "visible": true        
                },
                {
                    "label": "Critical",
                    "color": "#D43F3A",
                    "zIndex": 4,
                    "visible": true        
                }
            ],
        };
    }

    componentDidMount() {
        this.initializeChart();        
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dataset) {
            this.rerenderChart(true, nextProps.dataset);
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
            top: 100,
            right: 50,
            bottom: 50,
            left: 50
        }
        // defines width and height of chart relative to margins:
        this.state.width = this.props.width - (this.state.margin.left + this.state.margin.right);
        this.state.height = this.props.height - (this.state.margin.top + this.state.margin.bottom);
        // sizes the SVG element:
        this.state.svg = d3.select('svg[svg="stackedBar"]')
            .attr('width', this.props.width)
            .attr('height', this.props.height);
    
        /* ===< AXIS >=== */
        this.state.axis = this.state.svg
            .append('g')
            .attr('group', 'axis')
            .attr('transform', 'translate(' + this.state.margin.left + ',' + this.state.margin.top + ')');

        /* ===< DATA >=== */
        // generates the data group:
        this.state.data = this.state.svg
            .append('g')
            .attr('group', 'data')
            .attr('transform', 'translate(' + this.state.margin.left + ',' + this.state.margin.top + ')');
        // generates the [data -> layers] group
        this.state.layers = this.state.data
            .append('g')
            .attr('group', 'layers');

        /* ===< LEGEND >=== */
        this.state.legend = this.state.svg
            .append('g')
            .attr('group', 'legend')
            .attr('transform', 'translate(' + this.state.margin.left + ', 0)');
    }

    rerenderChart(complete, dataset) {
        let self = this;
        
        /* ===< DATASET MANIPULATION >+++ */
        if (!dataset) {
            return;
        } else {
            this.state.dataset = dataset;
        }
        // assembles a nested dataset:
        let nestedDataset = this.state.dataset.map( (collection) => {
            return {
                x: collection.x,
                y: d3.nest()
                    .key( (d) => d['Risk'] )
                    .rollup( (v) => {
                        return {
                            count: v.length,
                            description: d3.nest()
                                .key( (d) => d['Name'] )
                                .rollup( (v) => {
                                    return {
                                        count: v.length,
                                        hosts: d3.nest()
                                            .key( (d) => d['Host'] )
                                            .entries(v)
                                    };
                                })
                                .entries(v)
                        };
                    })
                    .object(collection.y),
            }
        } );
        // assembles a stacked dataset from the nested dataset:
        this.state.stackedDataset = (d3.stack()
            .keys(self.state.yKeys.filter( (key) => key.visible ).map( (key) => key.label ))
            .value( (d, key) => (d.y[key] ? d.y[key].count : 0) )
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone)
        )(nestedDataset);

        /* ===< AXIS >=== */        
        // defines axis translator functions (value => pixel location):
        this.state.x = d3.scaleBand()
            .domain(self.state.dataset.map( (collection) => collection.x ))
            .range([0, this.state.width])
            .padding(.5);
        this.state.y = d3.scaleLinear()
            .domain([
                0,
                d3.max(this.state.stackedDataset, (d) => d[0][1])
            ])
            .range([this.state.height, 0]);
        // defines axis generator functions:
        this.state.xAxis = d3.axisBottom(this.state.x);
        this.state.yAxis = d3.axisLeft(this.state.y)
            .ticks(
                Math.max(4, Math.floor(this.state.height / 50))
            );
        // removes old axis
        this.state.axis.selectAll('*').remove();
        this.state.axis
            .append('g')
            .attr('group', 'xAxis')
            .attr('transform', 'translate(0, ' + this.state.height + ')')
            .call(this.state.xAxis) // generates elements that make up the axis
            .selectAll('text')
                .style('text-anchor', 'end')
                .attr('dx', '-.8em')
                .attr('dy', '.15em')
                .attr('transform', 'rotate(-65)');
        this.state.axis
            .append('g')
            .attr('group', 'yAxis')            
            .call(this.state.yAxis);

        /* ===< LEGEND >=== */
        if (complete) this.renderChartLegend();
        
        /* ===< STACKED BARS >=== */
        let layers = self.state.layers
            .selectAll('g')
            .data(this.state.stackedDataset, (d) => d.key ); // layers are matched based on the key property
        // adds bar groups that are new to the dataset:
        layers.enter()
            .append('g')
            .attr('group', 'layer')
            .attr('layer', (d) => d.key )
            .attr('fill', (d) => {
                let i = self.state.yKeys.findIndex( (key) => key.label === d.key);  
                return self.state.yKeys[i].color;      
            })
            .selectAll('rect')
            .data( (d) => d )
            .enter()
            .append('rect')
                .attr('rect', 'bar')
                .attr('x', (d) => self.state.x(d.data.x) )
                .attr('y', (d) => self.state.y(d[1]) )
                .attr('height', (d) => self.state.y(d[0]) - self.state.y(d[1]) )
                .attr('width', self.state.x.bandwidth())
                .attr('stroke', 'black')
                .attr('stroke-width', 0)
                .on('mouseenter', function(d) {
                    d3.select(this)
                        .attr('stroke-width', 1);
                })
                .on('mouseleave', function(d) {
                    d3.select(this)
                        .attr('stroke-width', 0);
                })
                .on('click', function(d, i) {
                    let yKey = this.parentNode.getAttribute('layer');
                    let yKeyIndex = self.state.yKeys.findIndex( (key) => key.label === yKey);
                    let color = self.state.yKeys[yKeyIndex].color;
                    
                    // (re)defines a dynamically colored pattern for the selected bar segment:
                    d3.select('#diagonalStripePattern').remove();
                    let pattern = self.state.svg
                        .select('defs')
                        .append('pattern')
                            .attr('id', 'diagonalStripePattern')
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
                        .attr('fill', color)
                        .style('opacity', 0.9);
                    // updated DOM with new selection:
                    d3.selectAll('[rect="bar"]')
                        .style('fill', null);
                    d3.select(this)
                        .style('fill', 'url(#diagonalStripePattern)');
                    // propagates sub-dataset to parent component:
                    self.props.commandCenter({donut: d.data.y[yKey]});               
                });
        // updates bar groups with the new values:
        layers
            .selectAll('rect')
            .data( (d) => d )
            .attr('x', (d) => self.state.x(d.data.x) )
            .attr('y', (d) => self.state.y(d[1]) )
            .attr('height', (d) => self.state.y(d[0]) - self.state.y(d[1]) )
            .attr('width', self.state.x.bandwidth())
        // removes any bar groups that are no longer visible in the dataset:
        layers
            .exit()
            .remove();
        
        /* ===< BAR TOTALS >=== */
        let totals = self.state.stackedDataset[self.state.stackedDataset.length-1].map( (collection) => {
            return {
                xLabel: collection.data.x,
                total: collection[1]
            }
        })
        let labels = self.state.data
            .selectAll('text')
            .data(totals);
        labels
            .enter()
            .append('text')
                .attr('x', (d) => self.state.x(d.xLabel) + self.state.x.bandwidth()/2)
                .attr('y', (d) => self.state.y(d.total) - 4)
                .attr('fill', 'black')
                .attr('text-anchor', 'middle')
                .text( (d) => d.total );
        labels
            .attr('x', (d) => self.state.x(d.xLabel) + self.state.x.bandwidth()/2)
            .attr('y', (d) => self.state.y(d.total) - 4)
            .attr('fill', 'black')
            .attr('text-anchor', 'middle')
            .text( (d) => d.total );
        labels 
            .exit()
            .remove();

        
        /* ===< EVENT CAPTURE >=== */
        // console.log(this.state)
    }

    renderChartLegend() {
        let self = this;

        // appends a group element for each legend key:
        let keys = this.state.legend
            .selectAll('[group="key"]')
            .data(self.state.stackedDataset)
            .enter()
            .append('g')
                .attr('group', 'key')
                .attr('key', (d) => d.key )
                .style('cursor', 'pointer');

        // appends the colored circle key identifier:
        keys.append('circle')
            .attr('circle', (d) => d.key )
            .attr('r', 6)
            .attr('cx', (d) => {
                let position = {
                    start: d.index * (self.state.width / self.state.stackedDataset.length),
                    offset: (self.state.width / self.state.stackedDataset.length) / 2,
                    spacing: 12
                };
                return position.start + position.offset;
            })
            .attr('cy', self.state.margin.top / 2)                
            .attr('stroke', 'black')
            .attr('stroke-width', '1px')
            .attr('opacity', .75)
            .attr('fill', (d) => {
                let i = self.state.yKeys.findIndex( (key) => key.label === d.key);  
                let color = self.state.yKeys[i].visible ? self.state.yKeys[i].color : 'white';      
                return color;
            });
        // appends the text label for each key:
        keys.append('text')
            .attr('text', 'key')
            .attr('font-size', 10)
            .attr('dx', (d) => {
                let position = {
                    start: d.index * (self.state.width / self.state.stackedDataset.length),
                    offset: (self.state.width / self.state.stackedDataset.length) / 2,
                    spacing: 12
                };
                return position.start + position.offset + position.spacing;
            })
            .attr('dy', (self.state.margin.top / 2) + 4)
            .text( (d) => d.key );
        // adds event listeners to each key and binds a handler function:
        keys.on('click', function(d) {
            let i = self.state.yKeys.findIndex( (key) => key.label === d.key);
            self.state.yKeys[i].visible = !self.state.yKeys[i].visible;
            d3.select(this)
                .select('circle')
                .attr('fill', self.state.yKeys[i].visible ? self.state.yKeys[i].color : 'white')         
            self.rerenderChart(false, self.state.dataset);
        });
    }

    render() {
        return (
            <div name="stackedBar">               
                <svg svg="stackedBar" width={this.props.width} xmlns="http://www.w3.org/2000/svg" version="1.1">
                    <defs></defs>
                </svg>
            </div>
        );
    }
}

/* subchart is a combo of these!:
  1. https://bl.ocks.org/mbhall88/b2504f8f3e384de4ff2b9dfa60f325e2
  2. http://bl.ocks.org/mccannf/3994129 (variable radius)
  3. https://bl.ocks.org/mbostock/5682158 (animation)
  4. http://bl.ocks.org/NPashaP/9994181 (3D)
*/