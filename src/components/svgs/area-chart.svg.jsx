import React from 'react';
import dataset1 from './data/dataset1.json';
import dataset2 from './data/dataset2.json';

import './styles/charts.scss';

import {
    area as d3Area,
    axisBottom,
    axisLeft,
    bisector,
    event as d3Event,
    line as d3Line,
    max as d3Max,
    min as d3Min,
    mouse as d3Mouse,
    scaleLinear,
    scaleOrdinal,
    scaleTime,
    select as d3Select,
    stack as d3Stack,
    stackOrderNone,
    stackOffsetNone,
} from 'd3';

export class InteractiveAreaChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            area: undefined,
            container: undefined,
            data: undefined,
            height: undefined,
            layer: undefined,
            line: undefined,
            margin: undefined,
            stackedData: undefined,
            svg: undefined,
            width: undefined,
            x: undefined,
            xAxis: undefined,
            y: undefined,
            yAxis: undefined,
            z: undefined,
        }
    }

    componentDidMount() {
        this.initialize();
        this.redraw(dataset1);
        // setTimeout( () => {
        //     this.redraw(dataset2);      
        // }, 2000)
        console.log(this.state)
    }
  
    componentWillUnmount() { }

    initialize() {

        let self = this;

        // defines chart margins:
        this.state.margin = {
            top: 20,
            right: 20,
            bottom: 40,
            left: 50
        }

        // defines width and height of chart relative to margins:
        this.state.width = this.props.width - (this.state.margin.left + this.state.margin.right);
        this.state.height = (this.props.width / 2) - (this.state.margin.top + this.state.margin.bottom);
        
        // sizes the SVG element:
        this.state.svg = d3Select('#interactiveArea')
            .attr('width', this.props.width)
            .attr('height', this.props.width / 2);

        this.state.mousemove = function() {
            let x0 = self.state.x.invert(d3Mouse(this)[0]);
            console.log(x0)
        }

        // defines the grouping container:
        this.state.container = this.state.svg
            .append('g')
            .attr('transform', 'translate(' + this.state.margin.left + ',' + this.state.margin.top + ')')
            .on('mousemove', this.state.mousemove);
    }

    redraw(dataset) {
        let self = this;

        // transforms data:
        this.state.data = dataset.data.map( (row) => {
            row[dataset.xKey] = new Date(row[dataset.xKey]);
            return row
        });

        // store the stacked data:
        this.state.stackedData = (d3Stack()
            .keys(dataset.yKeys)
            .order(stackOrderNone)
            .offset(stackOffsetNone)
        )(dataset.data)

        // defines area transform function:
        this.state.area = d3Area()
            .x( (d, i) => this.state.x(d.data[dataset.xKey]) )
            .y0( (d) => this.state.y(d[0]) )
            .y1( (d) => this.state.y(d[1]) );

        // defines the line transform function:
        this.state.line = d3Line()
            .x( (d) => this.state.x(d[dataset.xKey]) )
            .y( (d) => this.state.y(dataset.yKeys.reduce( (accumulator, key) => accumulator += d[key], 0) ) );
        
        // remove old elements:
        this.state.container.selectAll('*').remove();

        // defines axis translator functions (value => pixel location):
        this.state.x = scaleTime()
            .domain([
                d3Min(this.state.data, (d) => d[dataset.xKey]),
                d3Max(this.state.data, (d) => d[dataset.xKey])
            ])
            .range([
                0,
                this.state.width
            ]);
        this.state.y = scaleLinear()
            .domain([
                0,
                d3Max(
                    this.state.data,
                    (d) => dataset.yKeys.reduce( (accumulator, key) => accumulator += d[key], 0 )
                )
            ])
            .range([
                this.state.height,
                0
            ]);
        this.state.z = scaleOrdinal(['red', 'steelblue', 'black']);

        // defines axis generator functions:
        this.state.xAxis = axisBottom(this.state.x);
        this.state.yAxis = axisLeft(this.state.y);

        // adds axis to SVG:
        this.state.container.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0, ' + this.state.height + ')')
            .call(this.state.xAxis); // generates elements that make up the axis
        this.state.container.append('g')
            .attr('class', 'y axis')
            .call(this.state.yAxis);

        // generate each stacked layer:
        this.state.layer = this.state.container
            .selectAll('.layer')
            .data( this.state.stackedData )
            .enter()
                .append('g')
                .attr('layer', (d) => d.key)
                .attr('class', 'layer');

        // appends the area path:
        this.state.layer
            .append('path')
                .attr('class', 'area')
                .style('fill', (d) => self.state.z(d.key) )
                .attr('d', this.state.area)
                .attr('opacity', '0.3')

        // appends the line path:
        this.state.layer.append('path')
            .datum(this.state.data)
            .attr('class', 'line')
            .attr('d', this.state.line)
            .attr('stroke', 'steelblue')
            .attr('stroke-width', '2px')
            .attr('fill', 'none');

        // appends the points:
        this.state.stackedData.forEach( (layer) => {
            layer.forEach( (datapoint) => {
                d3Select('[layer="' + layer.key + '"]')
                    .append('circle')
                        .attr('r', (self.state.stackedData.length - layer.index > 1) ? 2 : 4)
                        .attr('cx', self.state.x(datapoint.data.date))
                        .attr('cy', self.state.y(datapoint[1]))                
                        .attr('stroke', 'black')
                        .attr('stroke-width', '1px')
                        .attr('fill', 'white')
                        .on('mouseover', function(d, i, x) {
                            self.state.container.append('circle')
                                .attr('r', this.r.baseVal.value + 2)
                                .attr('cx', this.cx.baseVal.value)
                                .attr('cy', this.cy.baseVal.value)
                                .attr('hovered', 'true')
                                .attr('fill', 'none')
                                .attr('stroke', 'black')
                                .attr('stroke-width', '1px')
                        })
                        .on('mouseout', function(d, i) {
                            d3Select('[hovered="true"]').remove();
                        });
            });
        })
        
        // appends the stack labels:
        this.state.layer.filter( (d) => d[d.length - 1][1] - d[d.length - 1][0] > 0.01 )
            .append('text')
                .attr('x', this.state.width - 6)
                .attr('y', (d) => self.state.y( (d[d.length - 1][0] + d[d.length - 1][1]) / 2) )
                .attr('dy', '.35em')
                .style('font', '10px sans-serif')
                .style('text-anchor', 'end')
                .text( (d) => d.key );
    }

    render() {
        return (
            <div name="interactiveArea">
                <svg id="interactiveArea" width={this.props.width} style={{border: 'solid 1px black', margin: '10px' }}></svg>
            </div>
        );
    }
}