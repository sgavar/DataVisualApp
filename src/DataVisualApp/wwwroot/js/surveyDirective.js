(function () {
    'use strict';
    // <d3-circle />
    angular.module("SurveyApp")
        .directive("d3Circle", function ($parse, $window) {
            var link = function (scope, el, attrs) {
                var surveyType = attrs.surveytype;
                var width = parseInt(d3.select(el[0]).style("width"));
                if (width < 239) {
                    width = 239
                }
                var height = attrs.height;
                var ele = d3.select(el[0]).append("svg").attr({ width: width, height: height });

                scope.$watch('result', function (newVal, oldVal) {
                    // Clear the elements inside of the directive
                    ele.selectAll('*').remove();

                    // if result is undefined, exit
                    if (!newVal) {
                        return;
                    }
                    //var exp = $parse(attrs.result);
                    var percentage = scope.result;
                    var center = "translate(" + (width / 2 - 15) + "," + height / 2 + ")";
                    var textCenter = "translate(" + width * 0.33 + "," + height * 0.57 + ")";

                    function arcTween(transition, newAngle) {
                        transition.attrTween("d", function (d) {
                            var interpolate = d3.interpolate(d.endAngle, newAngle);
                            return function (t) {
                                d.endAngle = interpolate(t);
                                return arc(d);
                            };
                        });
                    }
                    // Draw path
                    switch (surveyType) {
                        case "Li":
                            // Define path
                            var arc = d3.svg.arc().innerRadius(45).outerRadius(60).startAngle(0);
                            var background = ele.append("path").attr("transform", center).datum({ endAngle: 2 * Math.PI }).style("fill", "#ddd").attr("d", arc);
                            var foreground = ele.append("path").attr("transform", center).datum({ endAngle: 0 }).style("fill", "#337AB7").attr("d", arc).transition().duration(750).call(arcTween, percentage * 2 * Math.PI);

                            ele.append("text").attr("d", 0).attr("transform", textCenter).text("" + parseInt(percentage *100) + "%").style("font-size", "28px");
                            break;
                        case "Ke":
                            // Define path
                            var arc = d3.svg.arc().innerRadius(45).outerRadius(60).startAngle(0);
                            var background = ele.append("path").attr("transform", center).datum({ endAngle: 2 * Math.PI }).style("fill", "#ddd").attr("d", arc);
                            var foreground = ele.append("path").attr("transform", center).datum({ endAngle: 0 }).style("fill", "#5CB85C").attr("d", arc).transition().duration(750).call(arcTween, percentage * 2 * Math.PI);

                            ele.append("text").attr("d", 0).attr("transform", textCenter).text("" + parseInt(percentage *100) + "%").style("font-size", "28px");
                            break;
                        default:
                            break;
                    }
                });
            };

            return {
                restrict: "E",
                scope: {
                    result: '@'
                },
                link: link
            };
        });

    // <d3-line />
    angular.module("SurveyApp")
        .directive("d3Line", function ($parse, $window) {
            var link = function (scope, el, attrs) {
                var ele = d3.select(el[0]);
                scope.$watch('data', function (value) {
                    // Clear the elements inside of the directive
                    ele.selectAll('*').remove();
                    // if result is undefined, exit
                    if (!value) {
                        return;
                    }
                    if(scope.section == 'appeals')
                    {
                        var data = value.trendData.APPEALS;
                        var countList = value.countList.slice(0, 5);
                    } else if (scope.section == 'complaints')
                    {
                        var data = value.trendData.COMPLAINTS;
                        var countList = value.countList.slice(5, 10);
                    }
                    function type(d) {
                        d.date = formatDate.parse(d.date);
                        d.close = d.score;
                        d.count = d.count;
                        return d;
                    }
                    //resize();
                    //d3.select(window).on("resize", resize);

                    //function resize() {
                      //  svg.attr("width", function (d) { return parseInt(ele.style('width'), 10) + margin.left + margin.right; });
                    //}
                    var formatDate = d3.time.format("%Y-%m-%dT%H:%M:%S");
                    var margin = { top: 20, right: 20, bottom: 100, left: 50 },
                        width = 508 - margin.left - margin.right,
                        height = 450 - margin.top - margin.bottom;
                    var x = d3.time.scale()
                        .range([0, width]);

                    var y = d3.scale.linear()
                        .range([height, 0]);


                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left");

                    var line = d3.svg.line()
                        .interpolate("monotone")
                        .x(function (d) { return x(formatDate.parse(d.date)); })
                        .y(function (d) { return y(d.score); });

                    var svg = ele.append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                      .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                        .attr("class", "d3-line");

                    if (scope.stype == 'all') {
                        var nestLi = d3.nest().key(function (d) { return d.date; })
                            .rollup(function (g) {
                                var avarage = d3.sum(g, function (d) { return d.score }) / d3.sum(g, function (d) { return d.count });
                                return {
                                    date: g[0].date,
                                    score: avarage
                                };
                            });
                        //var nestKe = d3.nest().key(function (d) { return d.date; })
                        //    .rollup(function (g) {
                        //        var avarage = d3.sum(g, function (d) { return d.score }) / d3.sum(g, function (d) { return d.count });
                        //        return {
                        //            date: g[0].date,
                        //            score: avarage
                        //        };
                        //    });
                        //console.log(data[1].concat(data[5]));
                        var livanta = d3.values(nestLi.map(data[1].concat(data[5])));
                        var kepro = d3.values(nestLi.map(data[2].concat(data[3],data[4])));
                        var minDate = d3.min(livanta, function (d) { return formatDate.parse(d.date); });
                        var maxDate = d3.max(livanta, function (d) { return formatDate.parse(d.date); });
                        var minY = d3.min(livanta, function (d) { return d.score });
                        if (minDate > d3.min(kepro, function (d) { return formatDate.parse(d.date); }))
                        {
                            minDate = d3.min(kepro, function (d) { return formatDate.parse(d.date); });
                        }
                        if (maxDate < d3.max(kepro, function (d) { return formatDate.parse(d.date); }))
                        {
                            maxDate = d3.max(kepro, function (d) { return formatDate.parse(d.date); });
                        }
                        if (minY > d3.min(kepro, function (d) { return d.score }))
                        {
                            minY = d3.min(kepro, function (d) { return d.score });
                        }

                        minY -= 10;
                        x.domain([minDate, maxDate]);
                        y.domain([30, 100]);

                        var xScale = d3.time.scale().domain([minDate, maxDate]).range([0,width]);

                        var xAxis = d3.svg.axis()
                            .scale(xScale).orient("bottom").ticks(d3.time.day,6).tickFormat(d3.time.format('%b %d'));


                        svg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0," + height + ")")
                            .call(xAxis)
                            .selectAll("text").attr("y", 15).attr("x", -10).attr("dy", ".35em").style("text-anchor", "start");

                        svg.append("g")
                            .attr("class", "y axis")
                            .call(yAxis)
                            .append("text")
                            .attr("y", 6)
                            .attr("dy", ".71em")
                            .attr("transform", "translate(-50,150), rotate(-90)")
                            .text("Percentage (%)");
                        // Draw li data
                        if ((countList[0] + countList[4]) >= 30) {
                            var licount = "Livanta (N = " + (countList[0] + countList[4]) + ")";
                            svg.append("path")
                            .attr("d", line(livanta))
                            .attr("class", "line").attr("data-legend", licount).attr("data-legend-pos", 0);
                        }
                        // Draw ke data
                        if ((countList[1] + countList[2] + countList[3]) >= 30)
                        {
                            var kecount = "Kepro (N = " + (countList[1] + countList[2] + countList[3]) + ")";
                            svg.append("path")
                                .attr("d", line(kepro)).style("stroke", "#5CB85C")
                                .attr("class", "line").attr("data-legend", kecount).attr("data-legend-pos", 0);
                        }
                        var legend = svg.append("g").attr("class", "legend").attr("transform", "translate(160,390)").style("font-size", "12px").call(d3.legend);
                        // Reusable bisect to find points before/after line
                        var div = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
                        // tip
                        var tipDateFormat = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;
                        var tipFormatDate = d3.time.format("%m/%d/%Y");
                        var tip = d3.tip().attr('class', 'd3-tip').offset([-15, 0])
                                    .html(function (d) {
                                        return "<strong>Score: " + (parseInt(d.score)) + "%<br/>Date: " + tipFormatDate(tipDateFormat(d.date)) + "</strong>";
                                    });
                        svg.call(tip);

                        svg.selectAll("dot").data(livanta).enter()
                        .append("circle").attr("r", 3).attr('fill', 'white').attr('stroke', 'steelblue').attr('stroke-width', 1)
                        .attr("cx", function (d) { return x(formatDate.parse(d.date)); })
                        .attr("cy", function (d) { return y(d.score); })
                            .on("mouseover", tip.show)
                            .on("mouseout", tip.hide);
                        if ((countList[1] + countList[2] + countList[3]) >= 30) {
                            svg.selectAll("dot").data(kepro).enter()
                                .append("circle").attr("r", 3).attr('fill', 'white').attr('stroke', 'steelblue').attr('stroke-width', 1)
                                .attr("cx", function (d) { return x(formatDate.parse(d.date)); })
                                .attr("cy", function (d) { return y(d.score); })
                                    .on("mouseover", tip.show)
                                   .on("mouseout", tip.hide);
                        }

                    } else if (scope.stype == 'region') {
                        for (var i = 1; i < 6; i++)
                        {
                            data[i] = data[i].map(function (d) { return { date: d.date, score: d.score / d.count }; });
                        }
                        var minDate = d3.min(data[1], function (d) { return formatDate.parse(d.date); });
                        var maxDate = d3.max(data[1], function (d) { return formatDate.parse(d.date); });
                        var minY = d3.min(data[1], function (d) { return d.score});
                        for (var i = 2; i < 6; i++) {
                            var mDate = d3.min(data[i], function (d) { return formatDate.parse(d.date); });
                            if (mDate < minDate) {
                                minDate = mDate;
                            }
                            var xDate = d3.max(data[i], function (d) { return formatDate.parse(d.date); });
                            if (xDate > maxDate) {
                                maxDate = xDate;
                            }
                            var mY = d3.min(data[i], function (d) { return d.score });
                            if (mY < minY) {
                                minY = mY;
                            }
                        }

                        minY -= 10;
                        x.domain([minDate, maxDate]);
                        y.domain([30, 100]);

                        var xScale = d3.time.scale().domain([minDate, maxDate]).range([0, width]);

                        var xAxis = d3.svg.axis()
                            .scale(xScale).orient("bottom").ticks(d3.time.day, 6).tickFormat(d3.time.format('%b %d'));

                        svg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0," + height + ")")
                            .call(xAxis)
                            .selectAll("text").attr("y", 15).attr("x", -10).attr("dy", ".35em").style("text-anchor", "start");

                        svg.append("g")
                            .attr("class", "y axis")
                            .call(yAxis)
                            .append("text")
                            .attr("y", 6)
                            .attr("dy", ".71em")
                            .attr("transform", "translate(-50,150), rotate(-90)")
                            .text("Percentage (%)");

                        var r1count = "Area 1 (N = " + countList[0] + ")";
                        var r2count = "Area 2 (N = " + countList[1] + ")";
                        var r3count = "Area 3 (N = " + countList[2] + ")";
                        var r4count = "Area 4 (N = " + countList[3] + ")";
                        var r5count = "Area 5 (N = " + countList[4] + ")";

                        // Draw r1 data
                        if (countList[0] >= 30) {
                            svg.append("path")
                            .attr("d", line(data[1]))
                            .attr("class", "line").attr("data-legend", r1count).attr("data-legend-pos", 0);
                        }
                        // Draw r2 data
                        if (countList[1] >= 30) {
                            svg.append("path")
                                .attr("d", line(data[2])).style("stroke", "#5CB85C")
                                .attr("class", "line").attr("data-legend", r2count).attr("data-legend-pos", 0);
                        }
                        // Draw r3 data
                        if (countList[2] >= 30)
                        {
                            svg.append("path")
                                .attr("d", line(data[3])).style("stroke", "#ff7f0e")
                                .attr("class", "line").attr("data-legend", r3count).attr("data-legend-pos", 0);
                        }
                        // Draw r4 data
                        if (countList[3] >= 30)
                        {
                            svg.append("path")
                                .attr("d", line(data[4])).style("stroke", "#d62728")
                                .attr("class", "line").attr("data-legend", r4count).attr("data-legend-pos", 0);
                        }
                        // Draw r5 data
                        if (countList[4] >= 30)
                        {
                            svg.append("path")
                                .attr("d", line(data[5])).style("stroke", "#8c564b")
                                .attr("class", "line").attr("data-legend", r5count).attr("data-legend-pos", 0);
                        }
                        // Add legend
                        var relegend = svg.append("g").attr("class", "legend").attr("transform", "translate(160,370)").style("font-size", "12px").call(d3.legend);

                        //svg.append("path").attr("d", line(region2)).attr("class", "line");
                        //// Add mouse over function

                        // Reusable bisect to find points before/after line

                        var div = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

                        // tip
                        var tipDateFormat = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;
                        var tipFormatDate = d3.time.format("%m/%d/%Y");
                        var tip = d3.tip().attr('class', 'd3-tip').offset([-15, 0])
                                    .html(function (d) {
                                        return "<strong>Score: " + (parseInt(d.score)) + "%<br/>Date: " + tipFormatDate(tipDateFormat(d.date)) + "</strong>";
                                    });
                        svg.call(tip);

                        for (var r = 1; r < 6; r++) {
                            if (countList[r - 1] >= 30) {
                                svg.selectAll("dot").data(data[r]).enter()
                                .append("circle").attr("r", 3).attr('fill', 'white').attr('stroke', 'steelblue').attr('stroke-width', 1)
                                .attr("cx", function (d) { return x(formatDate.parse(d.date)); })
                                .attr("cy", function (d) { return y(d.score); })
                                    .on("mouseover", tip.show)
                                    .on("mouseout", tip.hide);
                            }
                        }
                    }
                });
            };

            return {
                restrict: "E",
                scope: {
                    data: '=data',
                    stype: '=',
                    section: '='
                },
                link: link
            };
        });

    // <d3-word-cloud />
    /*angular.module("SurveyApp")
        .directive("d3WordCloud", function ($parse, $window, $timeout) {
            var link = function (scope, el, attrs) {
                var ele = d3.select(el[0]);
                scope.$watch('data', function (value) {
                    // Clear the elements inside of the directive
                    ele.selectAll('*').remove();
                    // if result is undefined, exit
                    if (!value) {
                        return;
                    } else {
                        var ws = Object.assign([], value);
                    }
                    
                    function calSize(d) {
                        if (d.weight > 50) {
                            return d.weight;
                        } else if (d.weight > 40) {
                            return d.weight + 3;
                        } else if (d.weight > 30) {
                            return d.weight + 5;
                        } else if (d.weight > 20) {
                            return d.weight + 6;
                        } else if (d.weight > 10) {
                            return d.weight + 8;
                        } else {
                            return d.weight + 10;
                        }
                    }

                    var color = d3.scale.category20();
                    //console.log(wordArray);
                    $timeout(function () {
                        var layout = d3.layout.cloud()
                                        .size([500, 500]).words(ws)
                                        .padding(2).rotate(function () { return 0; })
                                        .text(function (d) { return d.text; })
                                        .fontSize(function (d) { return calSize(d); })
                                        .timeInterval(50)
                                        .on("end", draw);
                        layout.start();
                    }, 3000);

                    function draw(w) {
                        d3.select(el[0])
                                .append("svg")
                                .attr("width", 500)
                                .attr("height", 500)
                                .attr("class", "wordcloud")
                                .append("g")
                                .attr("transform", "translate(200,250)")
                                .selectAll("text")
                                .data(w).enter()
                                .append("text")
                                .style("font-size", function (d) { return (calSize(d)-8) + "px"; })
                                .style("fill", function (d, i) { return color(i); })
                                .attr("transform", function (d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
                                .text(function (d) { return d.text; });
                    }
                });
            };
            return {
                restrict: "E",
                scope: {
                    data: '=data'
                },
                link: link
            };
    });*/

    // <survey-detail-score-li />
    angular.module("SurveyApp")
        .directive("surveyDetailScoreLi", function () {
            return {
                restrict: 'E',
                scope: {
                    verysatisfy: '@',
                    satisfy: '@'
                },
                templateUrl: '/ng-template/survey-detail-score-li.html'
            };
        });
    // <survey-detail-score-ke />
    angular.module("SurveyApp")
        .directive("surveyDetailScoreKe", function () {
            return {
                restrict: 'E',
                scope: {
                    verysatisfy: '@',
                    satisfy: '@'
                },
                templateUrl: '/ng-template/survey-detail-score-ke.html'
            };
        });
    // <region-li />
    angular.module("SurveyApp")
        .directive("regionLi", function () {
            return {
                restrict: 'E',
                scope: {
                    result: '=',
                    startdate: '=',
                    enddate: '=',
                    regionname: '=regionname',
                    regionid: '@'
                },
                templateUrl: '/ng-template/region-li.html'
            };
        });
    // <region-ke />
    angular.module("SurveyApp")
        .directive("regionKe", function () {
            return {
                restrict: 'E',
                scope: {
                    result: '=',
                    startdate: '=',
                    enddate: '=',
                    regionname: '=regionname',
                    regionid: '@'
                },
                templateUrl: '/ng-template/region-ke.html'
            };
        });
    // <region-all />
    angular.module("SurveyApp")
        .directive("regionAll", function () {
            return {
                restrict: 'E',
                scope: {
                    result: '=',
                    startdate: '=',
                    enddate: '=',
                    regionname: '=regionname',
                    regionid: '@'
                },
                templateUrl: '/ng-template/region-all.html'
            };
        });
})();

// d3 - legend function

(function () {
    d3.legend = function (g) {
        g.each(function () {
            var g = d3.select(this),
                items = {},
                svg = d3.select(g.property("nearestViewportElement")),
                legendPadding = g.attr("data-style-padding") || 5,
                lb = g.selectAll(".legend-box").data([true]),
                li = g.selectAll(".legend-items").data([true])

            lb.enter().append("rect").classed("legend-box", true)
            li.enter().append("g").classed("legend-items", true)

            svg.selectAll("[data-legend]").each(function () {
                var self = d3.select(this)
                items[self.attr("data-legend")] = {
                    pos: self.attr("data-legend-pos") || this.getBBox().y,
                    color: self.attr("data-legend-color") != undefined ? self.attr("data-legend-color") : self.style("fill") != 'none' ? self.style("fill") : self.style("stroke")
                }
            })

            items = d3.entries(items).sort(function (a, b) { return a.value.pos - b.value.pos })

            li.selectAll("text")
                .data(items, function (d) { return d.key })
                .call(function (d) { d.enter().append("text") })
                .call(function (d) { d.exit().remove() })
                .attr("y", function (d, i) { return i + "em" })
                .attr("x", "1em")
                .text(function (d) {; return d.key })

            li.selectAll("circle")
                .data(items, function (d) { return d.key })
                .call(function (d) { d.enter().append("circle") })
                .call(function (d) { d.exit().remove() })
                .attr("cy", function (d, i) { return i - 0.25 + "em" })
                .attr("cx", 0)
                .attr("r", "0.4em")
                .style("fill", function (d) { return d.value.color })

            // Reposition and resize the box
            /*var lbbox = li[0][0].getBBox()
            lb.attr("x", (lbbox.x - legendPadding))
                .attr("y", (lbbox.y - legendPadding))
                .attr("height", (lbbox.height + 2 * legendPadding))
                .attr("width", (lbbox.width + 2 * legendPadding))*/
        })
        return g
    }
})();