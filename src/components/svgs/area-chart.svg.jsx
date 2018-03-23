import React from 'react';
import $ from 'jquery';
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
    timeDay as d3TimeDay,
    timeFormat as d3TimeFormat
} from 'd3';

import '../stylesheets/charts.scss';
import '../stylesheets/alert.scss';

import alerts from '../data/alerts/alerts.json';
import { prepareData } from '../data/alerts/prepare.js';
import yKeys from '../data/alerts/yKeys.json';

import { Alert } from '../alert.component.jsx';

export class InteractiveAreaChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // chart
            area: undefined,
            container: undefined,
            dataset: undefined,
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
            // tabs
            filters: {
                xIndex: 0,
                yKey: undefined
            },
            selectedTab: 0,
            selectedDate: undefined,
            selectedAlert: -1,
        }
    }

    componentDidMount() {
        this.initializeChart();
        this.rerenderChart(true, alerts);
        let e = document.querySelector('[rect="mouseCapture"]').dispatchEvent(new Event('mousemove'))
    }
  
    componentWillUnmount() { }

    computeY(d, yKeys) {
        return yKeys
            .filter( (key) => key.visible )
            .map( (key) => key.label )
            .reduce( (accumulator, key) => accumulator += d[key].length, 0 );
    }

    filterAlerts(dataset, filters) {
        let filteredAlerts = [];

        if (filters.yKey === undefined || filters.yKey === 'TOTAL') {
            let yKeys = dataset.yKeys
            .filter( (key) => key.visible )
            .map( (key) => key.label );
            
            for (let key in dataset.data[filters.xIndex]) {
                if (yKeys.includes(key)) {
                    filteredAlerts = filteredAlerts.concat(dataset.data[filters.xIndex][key]);
                }
            }
            
            filteredAlerts = filteredAlerts.sort( (a, b) => new Date(a.timestamp) > new Date(b.timestamp) );
        } else {
            filteredAlerts = dataset.data[filters.xIndex][filters.yKey];
        }

        return filteredAlerts;
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
        this.state.svg = d3Select('svg[svg="stackedArea"]')
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

    rerenderChart(complete, alerts) {
        let self = this;
        if (complete) {
            this.state.dataset = prepareData(alerts, 'date', yKeys);
        }
        if (!this.state.dataset) return;
        
        // remove old elements:
        this.state.container.selectAll('*').remove();

        // computes the stacked data:
        this.state.stackedData = (d3Stack()
            .keys(this.state.dataset.yKeys.filter( (key) => key.visible ).map( (key) => key.label ))
            .value( (d, key) => d[key].length )
            .order(stackOrderNone)
            .offset(stackOffsetNone)
        )(this.state.dataset.data)

        // defines axis translator functions (value => pixel location):
        let minDate = d3Min(this.state.dataset.data, (d) => d[self.state.dataset.xKey] );
        let maxDate = d3Max(this.state.dataset.data, (d) => d[self.state.dataset.xKey] );
        this.state.x = scaleTime()
            .domain([minDate, maxDate])
            .range([0, this.state.width]);
        this.state.y = scaleLinear()
            .domain([
                0,
                d3Max(
                    this.state.dataset.data,
                    (d) => self.computeY(d, this.state.dataset.yKeys)
                )
            ])
            .range([this.state.height, 0]);

        // defines area transform function:
        this.state.area = d3Area()
            .x( (d) => this.state.x(d.data[self.state.dataset.xKey]) )
            .y0( (d) => self.state.y(d[0]) )
            .y1( (d) => self.state.y(d[1]) );

        // defines the line transform function:
        this.state.line = d3Line()
            .x( (d) => self.state.x(d.data[self.state.dataset.xKey]) )
            .y( (d) => self.state.y(d[1]) );

        // defines axis generator functions:
        let numDays = Math.max(1, (maxDate - minDate) / (1000*60*60*24) );
        let maxTicks = this.state.width / 50;
        this.state.xAxis = axisBottom(this.state.x)
            .tickFormat(d3TimeFormat('%b %d'))
            .ticks(
                d3TimeDay.every( 
                    (numDays <= maxTicks) ? 1 : Math.ceil(numDays / maxTicks)
                )
            );
        this.state.yAxis = axisLeft(this.state.y)
            .ticks(
                Math.max(4, Math.floor(this.state.height / 50))
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
            this.renderChartLegend(this.state.dataset)
        }

        // appends the point circles and layer line traces:
        this.state.stackedData.forEach( (layer) => {
            // appends each layer
            d3Select('[layer="' + layer.key + '"]')
                .append('path')
                .attr('path', 'area')
                .style('fill', (d) => self.state.dataset.yKeys[self.state.dataset.yKeys.findIndex( (key) => key.label === layer.key) ].color )
                .attr('d', self.state.area);

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
                    .attr('cx', self.state.x(datapoint.data[self.state.dataset.xKey]))
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
            .style('stroke', 'black')
            .attr('r', 6);
        this.state.focus.append('line')
            .attr('line', 'xFocus')
            .style('stroke', 'white')
            .style('opacity', 0.5)            
            .attr('y1', 0)
            .attr('y2', this.state.height);
        this.state.focus.append('line')
            .attr('line', 'xFocus')
            .style('stroke', 'black')
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
            .style('stroke', 'black')
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
                let bisectDate = bisector( (d) => d[self.state.dataset.xKey] ).left;
                let i = bisectDate(self.state.dataset.data, x0, 1);
                let d0 = self.state.dataset.data[i-1];
                let d1 = self.state.dataset.data[i];
                let d = (x0 - d0[self.state.dataset.xKey] > d1[self.state.dataset.xKey] - x0) ? d1 : d0;
                self.state.selectedDate = (x0 - d0[self.state.dataset.xKey] > d1[self.state.dataset.xKey] - x0) ? i : i-1;
                self.state.filters.xIndex = (x0 - d0[self.state.dataset.xKey] > d1[self.state.dataset.xKey] - x0) ? i : i-1;
                self.setState({});

                self.state.focus.select('[circle="focus"]')
                    .attr('transform', 'translate(' + self.state.x(d[self.state.dataset.xKey]) + ',' + self.state.y(self.computeY(d, self.state.dataset.yKeys)) + ')');

                self.state.focus.selectAll('[line="xFocus"]')
                    .attr('transform', 'translate(' + self.state.x(d[self.state.dataset.xKey]) + ',' + self.state.y(self.computeY(d, self.state.dataset.yKeys)) + ')')
                    .attr('y2', self.state.height - self.state.y(self.computeY(d, self.state.dataset.yKeys)));
              
                self.state.focus.selectAll('[line="yFocus"]')
                    .attr('transform', 'translate(' + self.state.width * -1 + ',' + self.state.y(self.computeY(d, self.state.dataset.yKeys)) + ')')
                    .attr('x2', self.state.width * 2);

                self.state.focus.selectAll('[text="yFocus"]')
                    .attr("transform", 'translate(' + self.state.x(d[self.state.dataset.xKey]) + ',' + self.state.y(self.computeY(d, self.state.dataset.yKeys)) + ')')
                    .text(self.computeY(d, self.state.dataset.yKeys));
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
            <div name="interactiveArea">
                <div className="graph">
                    <svg svg="stackedArea" width={this.props.width}></svg>
                </div>
                <div className="detail" style={{width: this.props.width}}>
                    {this.state.selectedDate !== undefined ?
                    <div>
                        <div className="tabs">
                            <span className="xValue">{this.state.dataset.data[this.state.selectedDate][this.state.dataset.xKey].toDateString('md')}</span>
                            <span tabIndex="0" tab="TOTAL" className="selected tab" onClick={() => this.selectTab('TOTAL')}>
                                <span className="count">{this.computeY(this.state.dataset.data[this.state.selectedDate], yKeys)}</span>
                                <span className="label">TOTAL</span>
                            </span>
                            {
                            yKeys.filter( (key) => key.visible ).map( (key, i) => (
                                <span key={i} tabIndex={i+1} tab={key.label} className="tab" onClick={() => this.selectTab(key.label)}>
                                    <span className="count">{this.state.dataset.data[this.state.selectedDate][key.label].length}</span>
                                    <span className="label" style={{backgroundColor: key.color}}>{key.label}</span>
                                </span>
                            ))
                            }
                            <span className="spacer"></span>                            
                        </div>
                        
                        <div className="tabContent">
                            <div className="horizontal-slider">
                                <button className="bumper x" onClick={() => this.scrollTo(this.state.selectedAlert - 1)} disabled={this.state.selectedAlert <= 0 ? true : false}>
                                    <span className="y">
                                        <i className="fa fa-chevron-left"></i>
                                    </span>
                                </button>
                                <ul className="alerts">{this.filterAlerts(this.state.dataset, this.state.filters).map( (alert, i) => (
                                    <li alert={i} key={i} className="alert" onClick={() => this.scrollTo(i)}>
                                        <Alert alert={alert} key={i} color={this.state.dataset.yKeys[this.state.dataset.yKeys.findIndex( (key) => key.label === alert.priority.label) || 0].color}/>
                                    </li>
                                ))}</ul>
                                <button className="bumper x" onClick={() => this.scrollTo(this.state.selectedAlert + 1)} disabled={(this.state.selectedAlert >= (alerts.length-1)) ? true : false}>
                                    <span className="y">
                                        <i className="fa fa-chevron-right"></i>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    :
                    null
                    }
                </div>
            </div>
        );
    }

    scrollTo(index) {        
        let requestedAlert = document.querySelector('[alert="' + index + '"]');
        
        if (requestedAlert) {
            // updates class values:
            for (let alert of document.getElementsByClassName('alert')) {
                alert.classList.remove('selected')
            }
            requestedAlert.classList.add('selected');
            // determines scroll positioning:
            let positioning;
            switch (true) {
                case (index < 1):
                    positioning = 'start';
                    break;
                case (index >= (alerts.length-1)):
                    positioning = 'end';
                    break;
                default:
                    positioning = 'center';
            }
            // initiates scroll animation and updates state:         
            requestedAlert.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: positioning
            });
            this.setState({
                selectedAlert: index
            });
        }
    }

    selectTab(yKey) {
        $('.tab')
            .removeClass('selected');
        $('[tab="' + yKey + '"]')
            .addClass('selected');
        this.state.filters.yKey = yKey;
        this.setState({});
    }
}
