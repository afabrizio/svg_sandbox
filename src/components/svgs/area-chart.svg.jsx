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
    timeFormat as d3TimeFormat
} from 'd3';

export class InteractiveAreaChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            area: undefined,
            container: undefined,
            data: undefined,
            focus: undefined,
            height: undefined,
            layer: undefined,
            legend: undefined,
            line: undefined,
            margin: undefined,
            stackedData: undefined,
            svg: undefined,
            width: undefined,
            x: undefined,
            xAxis: undefined,
            y: undefined,
            yAxis: undefined,
            metadata: undefined
        }
    }

    componentDidMount() {
        this.initializeChart();
        this.rerenderChart(true, dataset1);
        // setTimeout( () => {
        //     this.initializeChart();
        //     this.rerenderChart(true, dataset2);      
        // }, 2000)
    }
  
    componentWillUnmount() { }

    computeY(d, yKeys) {
        return yKeys
            .filter( (key) => key.visible )
            .map( (key) => key.label )
            .reduce( (accumulator, key) => accumulator += d[key], 0 );
    }

    initializeChart() {
        let self = this;

        if (this.state.svg) {
            this.state.svg.selectAll('*').remove();
        }

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

        // generates the legend group:
        this.state.legend = this.state.svg
            .append('g')
            .attr('group', 'legend')
            .attr('transform', 'translate(' + this.state.margin.left + ', 0)')
    }

    rerenderChart(complete, dataset) {
        let self = this;

        // converts date strings to date objects
        this.state.data = dataset.data.map( (row) => {
            row[dataset.xKey] = new Date(row[dataset.xKey]);
            return row
        });

        // computes the stacked data:
        this.state.stackedData = (d3Stack()
            .keys(dataset.yKeys.filter( (key) => key.visible ).map( (key) => key.label ))
            .order(stackOrderNone)
            .offset(stackOffsetNone)
        )(dataset.data)

        // remove old elements:
        this.state.container.selectAll('*').remove();

        // defines axis translator functions (value => pixel location):
        this.state.x = scaleTime()
            .domain([
                d3Min(this.state.data, (d) => d[dataset.xKey]),
                d3Max(this.state.data, (d) => d[dataset.xKey])
            ])
            .range([0, this.state.width]);
        this.state.y = scaleLinear()
            .domain([
                0,
                d3Max(
                    this.state.data,
                    (d) => self.computeY(d, dataset.yKeys)
                )
            ])
            .range([this.state.height, 0]);

        // defines area transform function:
        this.state.area = d3Area()
            .x( (d, i) => this.state.x(d.data[dataset.xKey]) )
            .y0( (d) => self.state.y(d[0]) )
            .y1( (d) => self.state.y(d[1]) );

        // defines the line transform function:
        this.state.line = d3Line()
            .x( (d) => self.state.x(d.data[dataset.xKey]) )
            .y( (d) => self.state.y(d[1]) );

        // defines axis generator functions:
        this.state.xAxis = axisBottom(this.state.x)
            .tickFormat(d3TimeFormat('%b %d'))
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
        
        if (complete) {
            this.renderChartLegend(dataset)
        }

        // appends the point circles and layer line traces:
        this.state.stackedData.forEach( (layer) => {
            // appends each layer
            d3Select('[layer="' + layer.key + '"]')
                .append('path')
                .attr('path', 'area')
                .style('fill', (d) => dataset.yKeys[dataset.yKeys.findIndex( (key) => key.label === layer.key) ].color )
                .attr('d', self.state.area)
                .attr('opacity', .75);

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
            // .on('mouseout', function() {
            //     self.state.focus.style('display', 'none');
            // }) 
            .on('mousemove', function() {
                let x0 = self.state.x.invert(d3Mouse(this)[0]);
                let bisectDate = bisector( (d) => d[dataset.xKey] ).left;
                let i = bisectDate(dataset.data, x0, 1);
                let d0 = dataset.data[i-1];
                let d1 = dataset.data[i];
                let d = (x0 - d0[dataset.xKey] > d1[dataset.xKey] - x0) ? d1 : d0;
                self.state.metadata = (x0 - d0[dataset.xKey] > d1[dataset.xKey] - x0) ? i : i-1;
                self.setState({});

                self.state.focus.select('[circle="focus"]')
                    .attr('transform', 'translate(' + self.state.x(d[dataset.xKey]) + ',' + self.state.y(self.computeY(d, dataset.yKeys)) + ')');

                self.state.focus.selectAll('[line="xFocus"]')
                    .attr('transform', 'translate(' + self.state.x(d[dataset.xKey]) + ',' + self.state.y(self.computeY(d, dataset.yKeys)) + ')')
                    .attr('y2', self.state.height - self.state.y(self.computeY(d, dataset.yKeys)));
              
                self.state.focus.selectAll('[line="yFocus"]')
                    .attr('transform', 'translate(' + self.state.width * -1 + ',' + self.state.y(self.computeY(d, dataset.yKeys)) + ')')
                    .attr('x2', self.state.width * 2);

                self.state.focus.selectAll('[text="yFocus"]')
                    .attr("transform", 'translate(' + self.state.x(d[dataset.xKey]) + ',' + self.state.y(self.computeY(d, dataset.yKeys)) + ')')
                    .text(self.computeY(d, dataset.yKeys));
            });
        console.log(this.state)
    }

    renderChartLegend(dataset) {
        let self = this;

        // removes old legend elements:
        this.state.legend.selectAll('*').remove();

        // appends new legend elements:
        this.state.stackedData.forEach( (layer => {
            let position = {
                start: layer.index * (self.state.width / self.state.stackedData.length),
                offset: (self.state.width / self.state.stackedData.length) / 2,
                spacing: 10
            };
            let key = this.state.legend
                .append('g')
                .attr('group', 'mapping')
                .attr('key', layer.key)
                .attr('visibile', true)
                .style('cursor', 'pointer');
            key.append('circle')
                .attr('circle', layer.key)
                .attr('r', 5)
                .attr('cx', position.start + position.offset)
                .attr('cy', self.state.margin.top / 2)                
                .attr('stroke', 'black')
                .attr('stroke-width', '1px')
                .attr('opacity', .75)
                .attr('fill', dataset.yKeys[layer.index].color);
            key.append('text')
                .attr('text', 'key')
                .attr('font-size', 10)
                .attr('dx', position.start + position.offset + position.spacing)
                .attr('dy', (self.state.margin.top / 2) + 3)
                .text(layer.key);
            key.on('click', function() {
                let key = d3Select(this);
                let toggle = d3Select(this).select('[circle="' + layer.key + '"]');
                let i = dataset.yKeys.findIndex( (key) => key.label === layer.key);
                switch (key.attr('visibile')) {
                    case 'true':
                        key.attr('visibile', false);
                        toggle.attr('fill', 'white');
                        dataset.yKeys[i].visible = false;
                        break;
                    default:
                        key.attr('visibile', true);
                        toggle.attr('fill', dataset.yKeys[i].color);
                        dataset.yKeys[i].visible = true;
                }
                self.rerenderChart(false, dataset);
                               
            });
        }));
    }

    render() {
        return (
            <div name="interactiveArea">
                <svg id="interactiveArea" width={this.props.width} style={{ border: 'solid 1px black' }}></svg>
                <div style={{ width: 800, border: 'solid 1px steelblue' }}>
                    {dataset1.data.map( (row, i) => (
                        <div className={i === this.state.metadata ? 'active' : ''} key={i}>
                            <div>
                                <b>High</b>:&nbsp;{row.High}
                            </div>
                            <div>
                                <b>Medium</b>:&nbsp;{row.Medium}
                            </div>
                            <div>
                                <b>Low</b>:&nbsp;{row.Low}
                            </div>
                            <div>
                                <b>Info</b>:&nbsp;{row.Info}                                
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}
