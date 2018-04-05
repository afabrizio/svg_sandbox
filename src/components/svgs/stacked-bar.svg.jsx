import React from 'react';
import $ from 'jquery';
import * as d3 from 'd3';

import yKeys from '../data/alerts/yKeys.json';
import csvString from '../data/nessus.csv';


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
            svg: undefined,
            width: undefined,
        };
    }

    componentDidMount() {
        this.state.dataset = d3.csvParse(csvString);
        this.initializeChart();
        this.rerenderChart();
        console.log(this.state)
    }
  
    componentWillUnmount() { }

    initializeChart() {
        let self = this;

        if (this.state.svg) {
            this.state.svg.selectAll('*').remove();
        }

        // defines chart margins:
        this.state.margin = {
            top: 50,
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
    
        // generates the axis group:
        this.state.axis = this.state.svg
            .append('g')
            .attr('group', 'axis')
            .attr('transform', 'translate(' + this.state.margin.left + ',' + this.state.margin.top + ')');

        // generates the dataset group:
        this.state.data = this.state.svg
            .append('g')
            .attr('group', 'data')
            .attr('transform', 'translate(' + this.state.margin.left + ',' + this.state.margin.top + ')');

        // generates the legend group:
        this.state.legend = this.state.svg
            .append('g')
            .attr('group', 'legend')
            .attr('transform', 'translate(' + this.state.margin.left + ', 0)');
    }

    rerenderChart(complete, alerts) {
        let self = this;

        if (!this.state.dataset) return;
        
        // remove old elements:
        // this.state.data.selectAll('*').remove();

        // assembles a nested dataset:
        this.state.nestedDataset = d3.nest()
            .key( (d) => d['Risk'] )
            .rollup( (v) => {
                return {
                    count: v.length,
                    hosts: d3.nest()
                        .key( (d) => d['Host'] )
                        .entries(v)
                }
            })
            .entries(self.state.dataset);

        this.state.stackedData = (d3.stack()
            .keys(self.state.nestedDataset.map( (riskLevel) => riskLevel.key ))
            .value( (d) => d.value.count)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone)
        )(self.state.nestedDataset);


        // // defines axis translator functions (value => pixel location):
        // this.state.x = d3.scaleOrdinal()
        //     .domain([minDate, maxDate])
        //     .range([0, this.state.width]);
        // this.state.y = scaleLinear()
        //     .domain([
        //         0,
        //         d3Max(
        //             this.state.dataset.data,
        //             (d) => self.computeY(d, this.state.dataset.yKeys)
        //         )
        //     ])
        //     .range([this.state.height, 0]);

        // // defines axis generator functions:
        // let numDays = Math.max(1, (maxDate - minDate) / (1000*60*60*24) );
        // let maxTicks = this.state.width / 50;
        // this.state.xAxis = axisBottom(this.state.x)
        //     .tickFormat(d3TimeFormat('%b %d'))
        //     .ticks(
        //         d3TimeDay.every( 
        //             (numDays <= maxTicks) ? 1 : Math.ceil(numDays / maxTicks)
        //         )
        //     );
        // this.state.yAxis = axisLeft(this.state.y)
        //     .ticks(
        //         Math.max(4, Math.floor(this.state.height / 50))
        //     );

        // // adds axis to SVG:
        // let axis = this.state.container.append('g')
        //     .attr('group', 'axis');
        // axis.append('g')
        //     .attr('group', 'xAxis')
        //     .attr('class', 'x axis')
        //     .attr('transform', 'translate(0, ' + this.state.height + ')')
        //     .call(this.state.xAxis) // generates elements that make up the axis
        //     .selectAll('text')
        //         .style('text-anchor', 'end')
        //         .attr('dx', '-.8em')
        //         .attr('dy', '.15em')
        //         .attr('transform', 'rotate(-65)');
        // axis.append('g')
        //     .attr('group', 'yAxis')            
        //     .attr('class', 'y axis')
        //     .attr('transform', 'translate(-1, 0)')            
        //     .call(this.state.yAxis);

        // // creates layer containers:
        // this.state.layers = this.state.container
        //     .append('g')
        //     .attr('group', 'layers')
        //         .selectAll('g')
        //         .data(this.state.stackedData.reverse())
        //         .enter()
        //             .append('g')
        //             .attr('group', 'layer')
        //             .attr('layer', (d) => d.key );

        // // creates legend:
        // if (complete) {
        //     this.renderChartLegend(this.state.dataset);
        // }
        
        // // builds stacked-area chart:
        // switch (this.state.chartType) {
        //     case 'area':
        //         d3Select('[rect="areaBtn"]').attr('opacity', 0);                
        //         d3Select('[rect="barBtn"]').attr('opacity', 0.75);
        //         this.state.layers // area paths
        //             .append('path')
        //             .attr('path', (d) => d.key )
        //             .style('fill', (d) => self.state.dataset.yKeys[self.state.dataset.yKeys.findIndex( (key) => key.label === d.key) ].color )                
        //             .attr('d', self.state.area);
        //         this.state.layers // line paths
        //             .append('path')
        //             .attr('path', 'line')            
        //             .attr('d', (d) => self.state.line(d))
        //             .attr('stroke', 'black')
        //             .attr('stroke-width', (d) => (self.state.stackedData.length - d.index > 1) ? '1px' : '2px')
        //             .attr('opacity', (d) => (self.state.stackedData.length - d.index > 1) ? 0.5 : 1)              
        //             .attr('fill', 'none');
        //         this.state.layers // datapoint indicator circles
        //             .selectAll('circle')
        //             .data( (d) => d )
        //             .enter()
        //                 .append('circle')
        //                 .attr('circle', 'dataPoint')
        //                 .attr('r', 2)
        //                 .attr('cx', (d) => self.state.x(d.data[self.state.dataset.xKey]))
        //                 .attr('cy', (d) => self.state.y(d[1]))                
        //                 .attr('stroke', 'black')
        //                 .attr('stroke-width', '1px')
        //                 .attr('fill', 'white');
        //         break;
        //     case 'bar':
        //         d3Select('[rect="barBtn"]').attr('opacity', 0);
        //         d3Select('[rect="areaBtn"]').attr('opacity', 0.75);                
        //         this.state.layers
        //             .append('g')
        //             .attr('group', 'bars')
        //             .attr('fill', (d) => self.state.dataset.yKeys[self.state.dataset.yKeys.findIndex( (key) => key.label === d.key) ].color )
        //             .selectAll('rect')
        //             .data( (d) => d )
        //                 .enter().append('rect')
        //                 .attr('x', (d) => self.state.x(d.data[self.state.dataset.xKey]) - (barWidth/2) )
        //                 .attr('y', (d) => self.state.y(d[1]) )
        //                 .attr('height', (d) => self.state.y(d[0]) - self.state.y(d[1]) )
        //                 .attr('width', barWidth)
        //                 .attr('stroke', 'black')
        //                 .attr('stroke-width', 0);
        //         break;
        //     default:
        // }

        // // interactive focus elements:
        // this.state.focus = this.state.container.append('g')
        //     .attr('group', 'focus')
        //     .style('display', 'none');

        // this.state.focus.append('circle') 
        //     .attr('circle', 'focus')
        //     .style('fill', 'none') 
        //     .style('stroke', 'black')
        //     .attr('r', 6);
        // this.state.focus.append('line')
        //     .attr('line', 'xFocus')
        //     .style('stroke', 'white')
        //     .style('opacity', 0.5)            
        //     .attr('y1', 0)
        //     .attr('y2', this.state.height);
        // this.state.focus.append('line')
        //     .attr('line', 'xFocus')
        //     .style('stroke', 'black')
        //     .style('stroke-dasharray', '3,3')
        //     .style('opacity', 0.5)
        //     .attr('y1', 0)
        //     .attr('y2', this.state.height);
        // this.state.focus.append('line')
        //     .attr('line', 'yFocus')        
        //     .style('stroke', 'white')
        //     .style('opacity', 0.5)
        //     .attr('x1', this.state.width)
        //     .attr('x2', this.state.width);
        // this.state.focus.append('line')
        //     .attr('line', 'yFocus')        
        //     .style('stroke', 'black')
        //     .style('stroke-dasharray', '3,3')
        //     .style('opacity', 0.5)
        //     .attr('x1', this.state.width)
        //     .attr('x2', this.state.width);
        // this.state.focus.append('text')
        //     .attr('text', 'yFocus')
        //     .attr('font-size', '12px')
        //     .attr('stroke', 'white')
        //     .attr('stroke-width', 4)
        //     .attr('opacity', 0.5)
        //     .attr('dx', 8)
        //     .attr('dy', '-.3em');
        // this.state.focus.append('text')
        //     .attr('text', 'yFocus')
        //     .attr('font-size', '12px')
        //     .attr('font-weight', 'bold')
        //     .attr('dx', 8)
        //     .attr('dy', '-.3em');
        
        // // captures mouse events and updates the focus elements:
        // this.state.container
        //     .append('rect')
        //     .attr('rect', 'mouseCapture')
        //     .attr('width', this.state.width)
        //     .attr('height', this.state.height)
        //     .style('fill', 'none')
        //     .style('pointer-events', 'all')
        //     .on('mouseover', function() {
        //         self.state.focus.style('display', null);
        //     })
        //     // .on('mouseout', function() {
        //     //     self.state.focus.style('display', 'none');
        //     // }) 
        //     .on('mousemove', function() {
        //         let x0 = self.state.x.invert(d3Mouse(this)[0]);
        //         let bisectDate = bisector( (d) => d[self.state.dataset.xKey] ).left;
        //         let i = bisectDate(self.state.dataset.data, x0, 1);
        //         let d0 = self.state.dataset.data[i-1];
        //         let d1 = self.state.dataset.data[i];
        //         let d = (x0 - d0[self.state.dataset.xKey] > d1[self.state.dataset.xKey] - x0) ? d1 : d0;
        //         self.state.selectedDate = (x0 - d0[self.state.dataset.xKey] > d1[self.state.dataset.xKey] - x0) ? i : i-1;
        //         self.state.filters.xIndex = (x0 - d0[self.state.dataset.xKey] > d1[self.state.dataset.xKey] - x0) ? i : i-1;
        //         self.setState({});

        //         self.state.focus.select('[circle="focus"]')
        //             .attr('transform', 'translate(' + self.state.x(d[self.state.dataset.xKey]) + ',' + self.state.y(self.computeY(d, self.state.dataset.yKeys)) + ')');

        //         self.state.focus.selectAll('[line="xFocus"]')
        //             .attr('transform', 'translate(' + self.state.x(d[self.state.dataset.xKey]) + ',' + self.state.y(self.computeY(d, self.state.dataset.yKeys)) + ')')
        //             .attr('y2', self.state.height - self.state.y(self.computeY(d, self.state.dataset.yKeys)));
              
        //         self.state.focus.selectAll('[line="yFocus"]')
        //             .attr('transform', 'translate(' + self.state.width * -1 + ',' + self.state.y(self.computeY(d, self.state.dataset.yKeys)) + ')')
        //             .attr('x2', self.state.width * 2);

        //         self.state.focus.selectAll('[text="yFocus"]')
        //             .attr("transform", 'translate(' + self.state.x(d[self.state.dataset.xKey]) + ',' + self.state.y(self.computeY(d, self.state.dataset.yKeys)) + ')')
        //             .text(self.computeY(d, self.state.dataset.yKeys));
        //     });
        // console.log(this.state)
    }

    renderChartLegend(dataset) {
        let self = this;

        // removes old legend elements:
        this.state.legend.selectAll('*').remove();

        // appends legend elements:
        this.state.stackedData.forEach( (layer => {
            let position = {
                start: layer.index * (self.state.width / self.state.stackedData.length),
                offset: (self.state.width / self.state.stackedData.length) / 2,
                spacing: 12
            };
            let key = this.state.legend
                .append('g')
                .attr('group', 'mapping')
                .attr('key', layer.key)
                .attr('visibile', true)
                .style('cursor', 'pointer');
            key.append('circle')
                .attr('circle', layer.key)
                .attr('r', 6)
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
                .attr('dy', (self.state.margin.top / 2) + 4)
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
                self.setState({});
            });
        }));
    }

    render() {
        return (
            <div name="stackedBar">               
                <svg svg="stackedBar" width={this.props.width}></svg>
            </div>
        );
    }
}
