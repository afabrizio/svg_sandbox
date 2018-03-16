import React from 'react';
import dataset1 from './data/dataset1.json';
import dataset2 from './data/dataset2.json';
import dataset3 from './data/dataset3.json';


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
            colors: [
                '#c2d0d6',
                '#b3c4cb',
                '#a4b8c1',
                '#95acb7',
                '#86a0ac',
                '#7694a2',
                '#678898',
                '#5d7b89',
                '#536d79',
                '#485f6a',
                '#3e525b',
                '#36474f',
                '#34444c',
                '#29373d',
                '#1f292e',
            ],
            container: undefined,
            data: undefined,
            height: undefined,
            layer: undefined,
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

    computeTotal(d, yKeys) {
        return yKeys.reduce( (accumulator, key) => accumulator += d[key], 0 )
    }

    initialize() {
        let self = this;

        // defines chart margins:
        this.state.margin = {
            top: 40,
            right: 40,
            bottom: 40,
            left: 50
        }

        // defines width and height of chart relative to margins:
        this.state.width = this.props.width - (this.state.margin.left + this.state.margin.right);
        this.state.height = this.props.height - (this.state.margin.top + this.state.margin.bottom);
        
        // sizes the SVG element:
        this.state.svg = d3Select('#interactiveArea')
            .attr('width', this.props.width)
            .attr('height', this.props.height);
    
        // defines the grouping container:
        this.state.container = this.state.svg
            .append('g')
            .attr('group', 'container')
            .attr('transform', 'translate(' + this.state.margin.left + ',' + this.state.margin.top + ')');

        this.state.legend = this.state.svg
            .append('g')
            .attr('group', 'legend')
            .append('rect')
            .attr('rect', 'legend')
            .attr('width', this.state.width)
            .attr('height', this.state.margin.top)
            .attr('transform', 'translate(' + this.state.margin.left + ', 0)')
            .attr('fill', 'none');
    }

    redraw(dataset) {
        let self = this;

        // transforms data:
        this.state.data = dataset.data.map( (row) => {
            row[dataset.xKey] = new Date(row[dataset.xKey]);
            return row
        });

        // computes the stacked data:
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
            .x( (d) => self.state.x(d.data[dataset.xKey]) )
            .y( (d) => self.state.y(d[1]) );
        
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
                    (d) => self.computeTotal(d, dataset.yKeys)
                )
            ])
            .range([
                this.state.height,
                0
            ]);
        this.state.z = scaleOrdinal(this.selectColors(this.state.colors, Math.floor(this.state.colors.length / dataset.yKeys.length)));

        // defines axis generator functions:
        this.state.xAxis = axisBottom(this.state.x);
        this.state.yAxis = axisLeft(this.state.y)
            .ticks(
                Math.max(4, Math.floor(this.props.height/50))
            );

        // adds axis to SVG:
        this.state.container.append('g')
            .attr('group', 'xAxis')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0, ' + this.state.height + ')')
            .call(this.state.xAxis); // generates elements that make up the axis
        this.state.container.append('g')
            .attr('group', 'yAxis')            
            .attr('class', 'y axis')
            .attr('transform', 'translate(-1, 0)')            
            .call(this.state.yAxis);

        // generate each stacked layer:
        this.state.layer = this.state.container
            .selectAll('.layer')
            .data(this.state.stackedData.reverse()) // reversed layer order to prevent unwanted overlapping
            .enter()
                .append('g')
                .attr('group', 'layer')
                .attr('layer', (d) => d.key)
                .attr('class', 'layer');

        // appends the point circles and layer line traces:
        this.state.stackedData.forEach( (layer) => {
            // appends each layer
            d3Select('[layer="' + layer.key + '"]')
                .append('path')
                .attr('path', 'area')
                .style('fill', (d) => self.state.z(d.key) )
                .attr('d', self.state.area)
                .attr('opacity', 1);

            // appends each layer line
            d3Select('[layer="' + layer.key + '"]')
                .append('path')
                .attr('path', 'line')            
                .attr('d', self.state.line(layer))
                .attr('stroke', 'black')
                .attr('stroke-width', (self.state.stackedData.length - layer.index > 1) ? '1px' : '2px')
                .attr('opacity', (self.state.stackedData.length - layer.index > 1) ? 0.5 : 1)                
                .attr('fill', 'none');

            // appends circles for each data point:
            layer.forEach( (datapoint) => {
                d3Select('[layer="' + layer.key + '"]')
                    .append('circle')
                    .attr('circle', 'dataPoint')                        
                    .attr('r', (self.state.stackedData.length - layer.index > 1) ? 2 : 2)
                    .attr('cx', self.state.x(datapoint.data[dataset.xKey]))
                    .attr('cy', self.state.y(datapoint[1]))                
                    .attr('stroke', 'black')
                    .attr('stroke-width', '1px')
                    .attr('fill', 'white');
            });             
        });

        // appends the stack labels:
        this.state.layer.filter( (d) => d[d.length - 1][1] - d[d.length - 1][0] > 0.01 )
            .append('text')
            .attr('text', 'stackLabel')
            .attr('x', this.state.width - 6)
            .attr('y', (d) => self.state.y( (d[d.length - 1][0] + d[d.length - 1][1]) / 2) )
            .attr('dy', '.35em')
            .style('font', '10px sans-serif')
            .style('text-anchor', 'end')
            .text( (d) => d.key );

        // interactive focus elements:
        this.state.focus = this.state.container.append('g')
            .attr('group', 'focus')
            .style('display', 'none');

        this.state.focus.append('circle') 
            .attr('circle', 'focus')
            .style('fill', 'none') 
            .style('stroke', 'blue')
            .attr('r', 6);
        this.state.focus.append('line')
            .attr('line', 'xFocus')
            .style('stroke', 'white')
            .style('opacity', 0.5)            
            .attr('y1', 0)
            .attr('y2', this.state.height);
        this.state.focus.append('line')
            .attr('line', 'xFocus')
            .style('stroke', 'blue')
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.5)
            .attr('y1', 0)
            .attr('y2', this.state.height);
        this.state.focus.append('line')
            .attr('line', 'yFocus')        
            .style('stroke', 'white')
            .style('opacity', 0.5)
            .attr('x1', this.state.width)
            .attr('x2', this.state.width);
        this.state.focus.append('line')
            .attr('line', 'yFocus')        
            .style('stroke', 'blue')
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.5)
            .attr('x1', this.state.width)
            .attr('x2', this.state.width);
        this.state.focus.append('text')
            .attr('text', 'yFocus')
            .attr('font-size', '12px')
            .attr('stroke', 'white')
            .attr('stroke-width', 4)
            .attr('opacity', 0.5)
            .attr('dx', 8)
            .attr('dy', '-.3em');
        this.state.focus.append('text')
            .attr('text', 'yFocus')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .attr('dx', 8)
            .attr('dy', '-.3em');
        
        // captures mouse events and updates the focus elements:
        this.state.container
            .append('rect')
            .attr('rect', 'mouseCapture')
            .attr('width', this.state.width)
            .attr('height', this.state.height)
            .style('fill', 'none')
            .style('pointer-events', 'all')
            .on('mouseover', function() {
                self.state.focus.style('display', null);
            })
            .on('mouseout', function() {
                self.state.focus.style('display', 'none');
            }) 
            .on('mousemove', function() {
                let x0 = self.state.x.invert(d3Mouse(this)[0]);
                let bisectDate = bisector( (d) => d[dataset.xKey] ).left;
                let i = bisectDate(dataset.data, x0, 1);
                let d0 = dataset.data[i-1];
                let d1 = dataset.data[i];
                let d = (x0 - d0[dataset.xKey] > d1[dataset.xKey] - x0) ? d1 : d0;

                self.state.focus.select('[circle="focus"]')
                    .attr('transform', 'translate(' + self.state.x(d[dataset.xKey]) + ',' + self.state.y(self.computeTotal(d, dataset.yKeys)) + ')');

                self.state.focus.selectAll('[line="xFocus"]')
                    .attr('transform', 'translate(' + self.state.x(d[dataset.xKey]) + ',' + self.state.y(self.computeTotal(d, dataset.yKeys)) + ')')
                    .attr('y2', self.state.height - self.state.y(self.computeTotal(d, dataset.yKeys)));
              
                self.state.focus.selectAll('[line="yFocus"]')
                    .attr('transform', 'translate(' + self.state.width * -1 + ',' + self.state.y(self.computeTotal(d, dataset.yKeys)) + ')')
                    .attr('x2', self.state.width * 2);

                self.state.focus.selectAll('[text="yFocus"]')
                    .attr("transform", 'translate(' + self.state.x(d[dataset.xKey]) + ',' + self.state.y(self.computeTotal(d, dataset.yKeys)) + ')')
                    .text(self.computeTotal(d, dataset.yKeys));
            });
    }

    render() {
        return (
            <div name="interactiveArea">
                <svg id="interactiveArea" width={this.props.width} style={{border: 'solid 1px black', margin: '10px' }}></svg>
            </div>
        );
    }

    selectColors(colors, divisor) {
        let selectedColors = [];
        for (let dividend = 0; dividend < colors.length; dividend++) {
            if (dividend % divisor === 0) {
                selectedColors.push(colors[dividend]);
            }
        }
        return selectedColors;
    }
}
