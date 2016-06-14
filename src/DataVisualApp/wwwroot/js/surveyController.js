(function () {
    'use strict';

    var controllerId = 'surveyController';

    angular.module('SurveyApp').controller(controllerId, ['$scope', 'surveyFactory', surveyController]);

    function createDateString(d) {
        if (angular.isDate(d)) {
            var day = d.getDate();
            var month = d.getMonth() + 1;
            var year = d.getFullYear();
            return year + "-" + month + "-" + day;
        } else {
            return null;
        }
    }

    function surveyController($scope, surveyFactory) {
        //get result by date
        var today = new Date();
        var lastTwoWeekDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);
        var lastMonth = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
        var lastQuarter = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 90);
        var lastYear = new Date(2015, 8, 1);

        function getWordArray(value)
        {
            function getFrequency(data) {
                var filterOut = /(\bcomments\b)|(\bfrom\b)|(\bhave\b)|(\bmuch\b)|(\bname\b)|(\bonly\b)|(\bstill\b)|(\bthat\b)|(\bthey\b)|(\bthis\b)|(\bvery\b)|(\bwent\b)|(\bwere\b)|(\bwhich\b)|(\bwith\b)|(\bwould\b)|(\byour\b)|(\b(\w{1,3})\b)|(\b[0-9]+\b)|(\bbeing\b)|(\bshould\b)|(\babout\b)|(\bcould\b)|(\bbeen\b)|(\bthere\b)|(\bwoman\b)|(\bmother\b)|(\bwell\b)|(\bwhen\b)|(\btheir\b)|(\bfeel\b)|(\btold\b)|(\bdont\b)|(\bresponse\b)|(\bsomeone\b)|(\btook\b)|(\bwill\b)|(\baway\b)|(\bwhat\b)|(\bleft\b)|(\bnothing\b)|(\bcomment\b)|(\bdone\b)|(\beven\b)|(\bmade\b)|(\bthen\b)|(\bnone\b)|(\bsome\b)|(\bbefore\b)|(\bfelt\b)|(\btold\b)|(\banother\b)|(\bthan\b)|(\binto\b)/ig;
                var cleanWord = data.replace(filterOut, "");
                //temp filter
                //cleanWord = cleanWord.replace(/./g, "");
                if (cleanWord == null || cleanWord == "")
                {
                    return null;
                } else {
                    var pattern = /\w+/g;
                    var matchedWords = cleanWord.match(pattern);
                    var counts = matchedWords.reduce(function (stats, word) {
                        if (stats.hasOwnProperty(word)) {
                            stats[word] = stats[word] + 1;
                        } else {
                            stats[word] = 1;
                        }
                        return stats;
                    }, {});
                    return counts;
                }
            }
            function countMoreThanThree(x) {
                return x.weight > 2;
            }
            var frequency_list = getFrequency(value);
            if (frequency_list == null) {
                return null;
            } else {
                var wordArray = Object.keys(frequency_list).map(function (obj) {
                    var nObj = {};
                    nObj["text"] = obj;
                    nObj["weight"] = frequency_list[obj];
                    return nObj;
                });
                return wordArray.filter(countMoreThanThree);
            }
        }


        // item obj constructor
        function ITemp() {
            "use strict";
            this.SurveyType = '';
            this.OverallComp = 0;
            this.ProcessRating = 0;
            this.CommunicationComp = 0;
            this.CourtesyComp = 0;
            this.ResponsivenessComp = 0;
            this.q6Satisfy = 0;
            this.q7Satisfy = 0;
            this.q8Satisfy = 0;
            this.q9Satisfy = 0;
            this.q10Satisfy = 0;
            this.q11Satisfy = 0;
            this.q12Satisfy = 0;
            this.q13Satisfy = 0;
            this.q15Satisfy = 0;
            this.q16Satisfy = 0;
            this.q17Satisfy = 0;
            this.q18Satisfy = 0;
            this.q6VerySatisfy = 0;
            this.q7VerySatisfy = 0;
            this.q8VerySatisfy = 0;
            this.q9VerySatisfy = 0;
            this.q10VerySatisfy = 0;
            this.q11VerySatisfy = 0;
            this.q12VerySatisfy = 0;
            this.q13VerySatisfy = 0;
            this.q15VerySatisfy = 0;
            this.q16VerySatisfy = 0;
            this.q17VerySatisfy = 0;
            this.q18VerySatisfy = 0;
            this.Comment = '';
            this.RegionCode = 0;
            this.Count = 0;
        }
        function RegionAllTemp() {
            "use strict";
            this.Livanta = '';
            this.Kepro = '';
        }
        // survey obj constructor
        function STemp() {
            "use strict";
            this.SurveyType = '';
            this.RegionAll = new RegionAllTemp();
            this.Region1 = new ITemp();
            this.Region2 = new ITemp();
            this.Region3 = new ITemp();
            this.Region4 = new ITemp();
            this.Region5 = new ITemp();
            this.InterviewDate = '';
        }
        // outcome survey obj constructor
        function SurveyOutcome(appeals, complaints) {
            "use strict";
            this.appeals = appeals;
            this.complaints = complaints;
            this.startDate = '';
            this.endDate = '';
        }

        function createSurveyResultFromData(d) {
            var appeals = new STemp();
            appeals['SurveyType'] = 'APPEALS';
            appeals.InterviewDate = d[d.length - 1]['InterviewDate'];
            var complaints = new STemp();
            complaints['SurveyType'] = 'COMPLAINTS';
            complaints.InterviewDate = d[d.length - 1]['InterviewDate'];
            if (d.length >= 1) {
                for (var i = 0; i < d.length; i++) {
                    if (d[i]['SurveyType'] === 'APPEALS') {
                        calRegion(appeals, d[i]);
                    } else if (d[i]['SurveyType'] === 'COMPLAINTS') {
                        calRegion(complaints, d[i]);
                    }
                }
                averageEachRegion(appeals);
                averageEachRegion(complaints);
            }
            return new SurveyOutcome(appeals, complaints);
        }

        $scope.choosenResult = {};
        $scope.loading = true;
        $scope.showTrend = false;
        $scope.showRegionAll = true;
        $scope.showRegion1 = false;
        $scope.showRegion2 = false;
        $scope.showRegion3 = false;
        $scope.showRegion4 = false;
        $scope.showRegion5 = false;
        $scope.showDetailCourtesy = {};
        $scope.showDetailResponsiveness = {};
        $scope.showDetailCommunication = {};
        var regionArray = ['all', 'r1', 'r2', 'r3', 'r4', 'r5'];
        for (var i = 0; i < regionArray.length; i++) {
            $scope.showDetailCourtesy[regionArray[i]] = false;
            $scope.showDetailResponsiveness[regionArray[i]] = false;
            $scope.showDetailCommunication[regionArray[i]] = false;
        }
        $scope.surveyType = ["APPEALS", "COMPLAINTS"];

        // Set result to view
        $scope.setResult = function (result) {
            if ($scope.showTrend) {
                $scope.showTrend = false;
            }
            switch (result) {
                case 'lastTwoWeek':
                    if ($scope.lastTwoWeekResults != null) {
                        $scope.choosenResult = $scope.lastTwoWeekResults;
                    } else {
                        $scope.loading = true;
                        // get last two weeks
                        surveyFactory.getResultByDate(createDateString(lastTwoWeekDate), createDateString(today)).success(function (data) {
                            $scope.lastTwoWeekResults = createSurveyResultFromData(data);
                            $scope.lastTwoWeekResults.startDate = lastTwoWeekDate;
                            $scope.lastTwoWeekResults.endDate = today;
                            $scope.choosenResult = $scope.lastTwoWeekResults;
                            $scope.loading = false;
                        }).error(function (error) {
                            //log the error
                            console.log(error);
                        });
                    }
                    break;
                case 'lastMonth':
                    if ($scope.lastMonthResults != null) {
                        $scope.choosenResult = $scope.lastMonthResults;
                    } else {
                        $scope.loading = true;
                        // get last month
                        surveyFactory.getResultByDate(createDateString(lastMonth), createDateString(today)).success(function (data) {
                            $scope.lastMonthResults = createSurveyResultFromData(data);
                            $scope.lastMonthResults.startDate = lastMonth;
                            $scope.lastMonthResults.endDate = today;
                            $scope.choosenResult = $scope.lastMonthResults;
                            $scope.loading = false;
                        }).error(function (error) {
                            //log the error
                            console.log(error);
                        });
                    }
                    break;
                case 'lastQuarter':
                    if ($scope.lastQuarterResults != null) {
                        $scope.choosenResult = $scope.lastQuarterResults;
                    } else {
                        $scope.loading = true;
                        // get last quarter
                        surveyFactory.getResultByDate(createDateString(lastQuarter), createDateString(today)).success(function (data) {
                            $scope.lastQuarterResults = createSurveyResultFromData(data);
                            $scope.lastQuarterResults.startDate = lastQuarter;
                            $scope.lastQuarterResults.endDate = today;
                            $scope.choosenResult = $scope.lastQuarterResults;
                            $scope.loading = false;
                        }).error(function (error) {
                            //log the error
                            console.log(error);
                        });
                    }
                    break;
                case 'allTime':
                    if ($scope.cumulativeResults != null) {
                        $scope.choosenResult = $scope.cumulativeResults;
                    } else {
                        $scope.loading = true;
                        //get all result
                        surveyFactory.getResult().success(function (data) {
                            $scope.cumulativeResults = createSurveyResultFromData(data);
                            $scope.cumulativeResults.startDate = lastYear;
                            $scope.cumulativeResults.endDate = today;
                            $scope.choosenResult = $scope.cumulativeResults;
                            $scope.loading = false;
                        }).error(function (error) {
                            //log the error
                            console.log(error);
                        });
                    }
                    break;
                default:
                    break;
            }
        };

        function TrendData()
        {
            this.date = null;
            this.score = 0;
            this.count = 0;
        }

        // Show cumulative section
        $scope.showTrendSection = function (result) {
            if ($scope.trendData == null || $scope.trendData == undefined)
            {
                $scope.loading = true;
                //get all result
                surveyFactory.getTrendData().success(function (data) {
                    $scope.trendData = data;
                    $scope.loading = false;
                }).error(function (error) {
                    //log the error
                    console.log(error);
                });
            }
            $scope.showTrend = true;
        };

        // Show region
        $scope.setRegion = function (region) {
            if ($scope.showTrend) {
                $scope.showTrend = false;
            }
            switch (region) {
                case 'rall':
                    $scope.showRegion1 = false;
                    $scope.showRegion2 = false;
                    $scope.showRegion3 = false;
                    $scope.showRegion4 = false;
                    $scope.showRegion5 = false;
                    $scope.showRegionAll = true;
                    break;
                case 'r1':
                    $scope.showRegionAll = false;
                    $scope.showRegion2 = false;
                    $scope.showRegion3 = false;
                    $scope.showRegion4 = false;
                    $scope.showRegion5 = false;
                    $scope.showRegion1 = true;
                    break;
                case 'r2':
                    $scope.showRegion1 = false;
                    $scope.showRegionAll = false;
                    $scope.showRegion3 = false;
                    $scope.showRegion4 = false;
                    $scope.showRegion5 = false;
                    $scope.showRegion2 = true;
                    break;
                case 'r3':
                    $scope.showRegion1 = false;
                    $scope.showRegion2 = false;
                    $scope.showRegionAll = false;
                    $scope.showRegion4 = false;
                    $scope.showRegion5 = false;
                    $scope.showRegion3 = true;
                    break;
                case 'r4':
                    $scope.showRegion1 = false;
                    $scope.showRegion2 = false;
                    $scope.showRegion3 = false;
                    $scope.showRegionAll = false;
                    $scope.showRegion5 = false;
                    $scope.showRegion4 = true;
                    break;
                case 'r5':
                    $scope.showRegion1 = false;
                    $scope.showRegion2 = false;
                    $scope.showRegion3 = false;
                    $scope.showRegion4 = false;
                    $scope.showRegionAll = false;
                    $scope.showRegion5 = true;
                    break;
            }
        };

        // Show communication detail
        $scope.showDetail = function (detail, regionid) {
            switch (detail) {
                case 'Communication':
                    switch (regionid) {
                        case 'all':
                            $scope.showDetailCourtesy['all'] = false;
                            $scope.showDetailResponsiveness['all'] = false;
                            $scope.showDetailCommunication['all'] = !$scope.showDetailCommunication['all'];
                            break;
                        case 'r1':
                            $scope.showDetailCourtesy['r1'] = false;
                            $scope.showDetailResponsiveness['r1'] = false;
                            $scope.showDetailCommunication['r1'] = !$scope.showDetailCommunication['r1'];
                            break;
                        case 'r2':
                            $scope.showDetailCourtesy['r2'] = false;
                            $scope.showDetailResponsiveness['r2'] = false;
                            $scope.showDetailCommunication['r2'] = !$scope.showDetailCommunication['r2'];
                            break;
                        case 'r3':
                            $scope.showDetailCourtesy['r3'] = false;
                            $scope.showDetailResponsiveness['r3'] = false;
                            $scope.showDetailCommunication['r3'] = !$scope.showDetailCommunication['r3'];
                            break;
                        case 'r4':
                            $scope.showDetailCourtesy['r4'] = false;
                            $scope.showDetailResponsiveness['r4'] = false;
                            $scope.showDetailCommunication['r4'] = !$scope.showDetailCommunication['r4'];
                            break;
                        case 'r5':
                            $scope.showDetailCourtesy['r5'] = false;
                            $scope.showDetailResponsiveness['r5'] = false;
                            $scope.showDetailCommunication['r5'] = !$scope.showDetailCommunication['r5'];
                            break;
                        default:
                            break;
                    }
                    break;
                case 'Courtesy':
                    switch (regionid) {
                        case 'all':
                            $scope.showDetailCommunication['all'] = false;
                            $scope.showDetailResponsiveness['all'] = false;
                            $scope.showDetailCourtesy['all'] = !$scope.showDetailCourtesy['all'];
                            break;
                        case 'r1':
                            $scope.showDetailCommunication['r1'] = false;
                            $scope.showDetailResponsiveness['r1'] = false;
                            $scope.showDetailCourtesy['r1'] = !$scope.showDetailCourtesy['r1'];
                            break;
                        case 'r2':
                            $scope.showDetailCommunication['r2'] = false;
                            $scope.showDetailResponsiveness['r2'] = false;
                            $scope.showDetailCourtesy['r2'] = !$scope.showDetailCourtesy['r2'];
                            break;
                        case 'r3':
                            $scope.showDetailCommunication['r3'] = false;
                            $scope.showDetailResponsiveness['r3'] = false;
                            $scope.showDetailCourtesy['r3'] = !$scope.showDetailCourtesy['r3'];
                            break;
                        case 'r4':
                            $scope.showDetailCommunication['r4'] = false;
                            $scope.showDetailResponsiveness['r4'] = false;
                            $scope.showDetailCourtesy['r4'] = !$scope.showDetailCourtesy['r4'];
                            break;
                        case 'r5':
                            $scope.showDetailCommunication['r5'] = false;
                            $scope.showDetailResponsiveness['r5'] = false;
                            $scope.showDetailCourtesy['r5'] = !$scope.showDetailCourtesy['r5'];
                            break;
                        default:
                            break;
                    }
                    break;
                case 'Responsiveness':
                    switch (regionid) {
                        case 'all':
                            $scope.showDetailCommunication['all'] = false;
                            $scope.showDetailCourtesy['all'] = false;
                            $scope.showDetailResponsiveness['all'] = !$scope.showDetailResponsiveness['all'];
                            break;
                        case 'r1':
                            $scope.showDetailCommunication['r1'] = false;
                            $scope.showDetailCourtesy['r1'] = false;
                            $scope.showDetailResponsiveness['r1'] = !$scope.showDetailResponsiveness['r1'];
                            break;
                        case 'r2':
                            $scope.showDetailCommunication['r2'] = false;
                            $scope.showDetailCourtesy['r2'] = false;
                            $scope.showDetailResponsiveness['r2'] = !$scope.showDetailResponsiveness['r2'];
                            break;
                        case 'r3':
                            $scope.showDetailCommunication['r3'] = false;
                            $scope.showDetailCourtesy['r3'] = false;
                            $scope.showDetailResponsiveness['r3'] = !$scope.showDetailResponsiveness['r3'];
                            break;
                        case 'r4':
                            $scope.showDetailCommunication['r4'] = false;
                            $scope.showDetailCourtesy['r4'] = false;
                            $scope.showDetailResponsiveness['r4'] = !$scope.showDetailResponsiveness['r4'];
                            break;
                        case 'r5':
                            $scope.showDetailCommunication['r5'] = false;
                            $scope.showDetailCourtesy['r5'] = false;
                            $scope.showDetailResponsiveness['r5'] = !$scope.showDetailResponsiveness['r5'];
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
        }

        function calData(result, item) {
            result['OverallComp'] += item['OverallComp'];
            result['ProcessRating'] += item['ProcessRating'];
            result['CommunicationComp'] += item['CommunicationComp'];
            result['CourtesyComp'] += item['CourtesyComp'];
            result['ResponsivenessComp'] += item['ResponsivenessComp'];
            result['Comment'] += item['Comment'];
            if (item['q6Comp'] === 1) {
                result['q6VerySatisfy'] += 1;
            }else if (item['q6Comp'] === 2) {
                result['q6Satisfy'] += 1;
            }
            if (item['q7Comp'] === 1) {
                result['q7VerySatisfy'] += 1;
            }else if (item['q7Comp'] === 2) {
                result['q7Satisfy'] += 1;
            }
            if (item['q8Comp'] === 1) {
                result['q8VerySatisfy'] += 1;
            } else if (item['q8Comp'] === 2) {
                result['q8Satisfy'] += 1;
            }
            if (item['q9Comp'] === 1) {
                result['q9VerySatisfy'] += 1;
            }else if (item['q9Comp'] === 2) {
                result['q9Satisfy'] += 1;
            }
            if (item['q10Comp'] === 1) {
                result['q10VerySatisfy'] += 1;
            }else if (item['q10Comp'] === 2) {
                result['q10Satisfy'] += 1;
            }
            if (item['q11Comp'] === 1) {
                result['q11VerySatisfy'] += 1;
            } else if (item['q11Comp'] === 2) {
                result['q11Satisfy'] += 1;
            }
            if (item['q12Comp'] === 1) {
                result['q12VerySatisfy'] += 1;
            } else if (item['q12Comp'] === 2) {
                result['q12Satisfy'] += 1;
            }
            if (item['q13Comp'] === 1) {
                result['q13VerySatisfy'] += 1;
            } else if (item['q13Comp'] === 2) {
                result['q13Satisfy'] += 1;
            }
            if (item['q15Comp'] === 1) {
                result['q15VerySatisfy'] += 1;
            } else if (item['q15Comp'] === 2) {
                result['q15Satisfy'] += 1;
            }
            if (item['q16Comp'] === 1) {
                result['q16VerySatisfy'] += 1;
            } else if (item['q16Comp'] === 2) {
                result['q16Satisfy'] += 1;
            }
            if (item['q17Comp'] === 1) {
                result['q17VerySatisfy'] += 1;
            } else if (item['q17Comp'] === 2) {
                result['q17Satisfy'] += 1;
            }
            if (item['q18Comp'] === 1) {
                result['q18VerySatisfy'] += 1;
            } else if (item['q18Comp'] === 2) {
                result['q18Satisfy'] += 1;
            }
            result['Count'] += 1;
            result['RegionCode'] = item['RegionCode'];
            result['SurveyType'] = item['SurveyType'];
            result['InterviewDate'] = item['InterviewDate'];
        }

        function getAverage(result, n) {
            var itemToCal = [ 'ProcessRating', 'q6VerySatisfy', 'q7VerySatisfy', 'q8VerySatisfy', 'q9VerySatisfy', 'q10VerySatisfy', 'q11VerySatisfy', 'q12VerySatisfy', 'q13VerySatisfy', 'q15VerySatisfy', 'q16VerySatisfy', 'q17VerySatisfy', 'q18VerySatisfy', 'q6Satisfy', 'q7Satisfy', 'q8Satisfy', 'q9Satisfy', 'q10Satisfy', 'q11Satisfy', 'q12Satisfy', 'q13Satisfy', 'q15Satisfy', 'q16Satisfy', 'q17Satisfy', 'q18Satisfy'];
            for (var i = 0; i < itemToCal.length; i++) {
                result[itemToCal[i]] = Math.round10(result[itemToCal[i]] / n, -2);
            }
            result['CommunicationComp'] = Math.round10((result['q7VerySatisfy'] + result['q7Satisfy'] + result['q8VerySatisfy'] + result['q8Satisfy'] + result['q9VerySatisfy'] + result['q9Satisfy']) / 3, -2);
            result['CourtesyComp'] = Math.round10((result['q6VerySatisfy'] + result['q6Satisfy'] + result['q10VerySatisfy'] + result['q10Satisfy']) / 2, -2);
            result['ResponsivenessComp'] = Math.round10((result['q11VerySatisfy'] + result['q11Satisfy'] + result['q12VerySatisfy'] + result['q12Satisfy']) / 2, -2);
            result['OverallComp'] = Math.round10((result['CommunicationComp'] + result['CourtesyComp'] + result['ResponsivenessComp']) / 3, -2);
        }

        function calRegionAll(rs, type, region1, region2, region3, region4, region5) {
            var item = new ITemp();
            var scoreToCal = ['q6VerySatisfy', 'q7VerySatisfy', 'q8VerySatisfy', 'q9VerySatisfy', 'q10VerySatisfy', 'q11VerySatisfy', 'q12VerySatisfy', 'q13VerySatisfy', 'q15VerySatisfy', 'q16VerySatisfy', 'q17VerySatisfy', 'q18VerySatisfy', 'q6Satisfy', 'q7Satisfy', 'q8Satisfy', 'q9Satisfy', 'q10Satisfy', 'q11Satisfy', 'q12Satisfy', 'q13Satisfy', 'q15Satisfy', 'q16Satisfy', 'q17Satisfy', 'q18Satisfy'];
            if (type === 'Li') {
                if (region1 == true && region5 == true) {
                    item['Count'] = rs.Region1['Count'] + rs.Region5['Count'];
                    item['OverallComp'] = Math.round10((rs.Region1['OverallComp'] * rs.Region1['Count'] + rs.Region5['OverallComp'] * rs.Region5['Count']) / item['Count'], -2);
                    item['ProcessRating'] = Math.round10((rs.Region1['ProcessRating'] * rs.Region1['Count'] + rs.Region5['ProcessRating'] * rs.Region5['Count']) / item['Count'], -2);
                    item['CommunicationComp'] = Math.round10((rs.Region1['CommunicationComp'] * rs.Region1['Count'] + rs.Region5['CommunicationComp'] * rs.Region5['Count']) / item['Count'], -2);
                    item['CourtesyComp'] = Math.round10((rs.Region1['CourtesyComp'] * rs.Region1['Count'] + rs.Region5['CourtesyComp'] * rs.Region5['Count']) / item['Count'], -2);
                    item['ResponsivenessComp'] = Math.round10((rs.Region1['ResponsivenessComp'] * rs.Region1['Count'] + rs.Region5['ResponsivenessComp'] * rs.Region5['Count']) / item['Count'], -2);
                    for (var i = 0; i < scoreToCal.length; i++) {
                        item[scoreToCal[i]] = Math.round10((rs.Region1[scoreToCal[i]] * rs.Region1['Count'] + rs.Region5[scoreToCal[i]] * rs.Region5['Count']) / item['Count'], -2);
                    }
                    item['Comment'] = getWordArray(rs.Region1['Comment'] + " " + rs.Region5['Comment']);
                } else if (region1 == true && region5 == false)
                {
                    item['Count'] = rs.Region1['Count'];
                    item['OverallComp'] = Math.round10(rs.Region1['OverallComp'], -2);
                    item['ProcessRating'] = Math.round10(rs.Region1['ProcessRating'], -2);
                    item['CommunicationComp'] = Math.round10(rs.Region1['CommunicationComp'], -2);
                    item['CourtesyComp'] = Math.round10(rs.Region1['CourtesyComp'], -2);
                    item['ResponsivenessComp'] = Math.round10(rs.Region1['ResponsivenessComp'], -2);
                    for (var i = 0; i < scoreToCal.length; i++) {
                        item[scoreToCal[i]] = Math.round10(rs.Region1[scoreToCal[i]], -2);
                    }
                    item['Comment'] = getWordArray(rs.Region1['Comment']);
                } else if(region5==true && region1 == false)
                {
                    item['Count'] = rs.Region5['Count'];
                    item['OverallComp'] = Math.round10(rs.Region5['OverallComp'], -2);
                    item['ProcessRating'] = Math.round10(rs.Region5['ProcessRating'], -2);
                    item['CommunicationComp'] = Math.round10(rs.Region5['CommunicationComp'], -2);
                    item['CourtesyComp'] = Math.round10(rs.Region5['CourtesyComp'], -2);
                    item['ResponsivenessComp'] = Math.round10(rs.Region5['ResponsivenessComp'], -2);
                    for (var i = 0; i < scoreToCal.length; i++) {
                        item[scoreToCal[i]] = Math.round10(rs.Region5[scoreToCal[i]], -2);
                    }
                    item['Comment'] = getWordArray(rs.Region5['Comment']);
                }
            } else if (type === 'Ke') {
                if (region2 == true && region3 == true && region4 == true)
                {
                    item['Count'] = rs.Region2['Count'] + rs.Region3['Count'] + rs.Region4['Count'];
                    item['OverallComp'] = Math.round10((rs.Region2['OverallComp'] * rs.Region2['Count'] + rs.Region3['OverallComp'] * rs.Region3['Count'] + rs.Region4['OverallComp'] * rs.Region4['Count']) / item['Count'], -2);
                    item['ProcessRating'] = Math.round10((rs.Region2['ProcessRating'] * rs.Region2['Count'] + rs.Region3['ProcessRating'] * rs.Region3['Count'] + rs.Region4['ProcessRating'] * rs.Region4['Count']) / item['Count'], -2);
                    item['CommunicationComp'] = Math.round10((rs.Region2['CommunicationComp'] * rs.Region2['Count'] + rs.Region3['CommunicationComp'] * rs.Region3['Count'] + rs.Region4['CommunicationComp'] * rs.Region4['Count']) / item['Count'], -2);
                    item['CourtesyComp'] = Math.round10((rs.Region2['CourtesyComp'] * rs.Region2['Count'] + rs.Region3['CourtesyComp'] * rs.Region3['Count'] + rs.Region4['CourtesyComp'] * rs.Region4['Count']) / item['Count'], -2);
                    item['ResponsivenessComp'] = Math.round10((rs.Region2['ResponsivenessComp'] * rs.Region2['Count'] + rs.Region3['ResponsivenessComp'] * rs.Region3['Count'] + rs.Region4['ResponsivenessComp'] * rs.Region4['Count']) / item['Count'], -2);
                    for (var i = 0; i < scoreToCal.length; i++) {
                        item[scoreToCal[i]] = Math.round10((rs.Region2[scoreToCal[i]] * rs.Region2['Count'] + rs.Region3[scoreToCal[i]] * rs.Region3['Count'] + rs.Region4[scoreToCal[i]] * rs.Region4['Count']) / item['Count'], -2);
                    }
                    item['Comment'] = getWordArray(rs.Region2['Comment'] + " " + rs.Region3['Comment'] + " " + rs.Region4['Comment']);
                }else if(region2==false && region3==true && region4==true)
                {
                    item['Count'] = rs.Region3['Count'] + rs.Region4['Count'];
                    item['OverallComp'] = Math.round10((rs.Region3['OverallComp'] * rs.Region3['Count'] + rs.Region4['OverallComp'] * rs.Region4['Count']) / item['Count'], -2);
                    item['ProcessRating'] = Math.round10((rs.Region3['ProcessRating'] * rs.Region3['Count'] + rs.Region4['ProcessRating'] * rs.Region4['Count']) / item['Count'], -2);
                    item['CommunicationComp'] = Math.round10((rs.Region3['CommunicationComp'] * rs.Region3['Count'] + rs.Region4['CommunicationComp'] * rs.Region4['Count']) / item['Count'], -2);
                    item['CourtesyComp'] = Math.round10((rs.Region3['CourtesyComp'] * rs.Region3['Count'] + rs.Region4['CourtesyComp'] * rs.Region4['Count']) / item['Count'], -2);
                    item['ResponsivenessComp'] = Math.round10((rs.Region3['ResponsivenessComp'] * rs.Region3['Count'] + rs.Region4['ResponsivenessComp'] * rs.Region4['Count']) / item['Count'], -2);
                    for (var i = 0; i < scoreToCal.length; i++) {
                        item[scoreToCal[i]] = Math.round10((rs.Region3[scoreToCal[i]] * rs.Region3['Count'] + rs.Region4[scoreToCal[i]] * rs.Region4['Count']) / item['Count'], -2);
                    }
                    item['Comment'] = getWordArray(rs.Region3['Comment'] + " " + rs.Region4['Comment']);
                }else if(region2==false && region3==false && region4==true)
                {
                    item['Count'] = rs.Region4['Count'];
                    item['OverallComp'] = Math.round10(rs.Region4['OverallComp'], -2);
                    item['ProcessRating'] = Math.round10(rs.Region4['ProcessRating'], -2);
                    item['CommunicationComp'] = Math.round10(rs.Region4['CommunicationComp'], -2);
                    item['CourtesyComp'] = Math.round10(rs.Region4['CourtesyComp'], -2);
                    item['ResponsivenessComp'] = Math.round10(rs.Region4['ResponsivenessComp'], -2);
                    for (var i = 0; i < scoreToCal.length; i++) {
                        item[scoreToCal[i]] = Math.round10(rs.Region4[scoreToCal[i]], -2);
                    }
                    item['Comment'] = getWordArray(rs.Region4['Comment']);
                }else if(region2==true && region3==false && region4==true)
                {
                    item['Count'] = rs.Region2['Count']+ rs.Region4['Count'];
                    item['OverallComp'] = Math.round10((rs.Region2['OverallComp'] * rs.Region2['Count']+ rs.Region4['OverallComp'] * rs.Region4['Count']) / item['Count'], -2);
                    item['ProcessRating'] = Math.round10((rs.Region2['ProcessRating'] * rs.Region2['Count']+ rs.Region4['ProcessRating'] * rs.Region4['Count']) / item['Count'], -2);
                    item['CommunicationComp'] = Math.round10((rs.Region2['CommunicationComp'] * rs.Region2['Count'] + rs.Region4['CommunicationComp'] * rs.Region4['Count']) / item['Count'], -2);
                    item['CourtesyComp'] = Math.round10((rs.Region2['CourtesyComp'] * rs.Region2['Count']+ rs.Region4['CourtesyComp'] * rs.Region4['Count']) / item['Count'], -2);
                    item['ResponsivenessComp'] = Math.round10((rs.Region2['ResponsivenessComp'] * rs.Region2['Count'] + rs.Region4['ResponsivenessComp'] * rs.Region4['Count']) / item['Count'], -2);
                    for (var i = 0; i < scoreToCal.length; i++) {
                        item[scoreToCal[i]] = Math.round10((rs.Region2[scoreToCal[i]] * rs.Region2['Count'] + rs.Region4[scoreToCal[i]] * rs.Region4['Count']) / item['Count'], -2);
                    }
                    item['Comment'] = getWordArray(rs.Region2['Comment'] + " " + rs.Region4['Comment']);
                }else if(region2==true && region3==true && region4==false)
                {
                    item['Count'] = rs.Region2['Count'] + rs.Region3['Count'];
                    item['OverallComp'] = Math.round10((rs.Region2['OverallComp'] * rs.Region2['Count'] + rs.Region3['OverallComp'] * rs.Region3['Count']) / item['Count'], -2);
                    item['ProcessRating'] = Math.round10((rs.Region2['ProcessRating'] * rs.Region2['Count'] + rs.Region3['ProcessRating'] * rs.Region3['Count']) / item['Count'], -2);
                    item['CommunicationComp'] = Math.round10((rs.Region2['CommunicationComp'] * rs.Region2['Count'] + rs.Region3['CommunicationComp'] * rs.Region3['Count']) / item['Count'], -2);
                    item['CourtesyComp'] = Math.round10((rs.Region2['CourtesyComp'] * rs.Region2['Count'] + rs.Region3['CourtesyComp'] * rs.Region3['Count']) / item['Count'], -2);
                    item['ResponsivenessComp'] = Math.round10((rs.Region2['ResponsivenessComp'] * rs.Region2['Count'] + rs.Region3['ResponsivenessComp'] * rs.Region3['Count']) / item['Count'], -2);
                    for (var i = 0; i < scoreToCal.length; i++) {
                        item[scoreToCal[i]] = Math.round10((rs.Region2[scoreToCal[i]] * rs.Region2['Count'] + rs.Region3[scoreToCal[i]] * rs.Region3['Count']) / item['Count'], -2);
                    }
                    item['Comment'] = getWordArray(rs.Region2['Comment'] + " " + rs.Region3['Comment']);
                }else if(region2==true && region3 == false && region4==false)
                {
                    item['Count'] = rs.Region2['Count'];
                    item['OverallComp'] = Math.round10(rs.Region2['OverallComp'], -2);
                    item['ProcessRating'] = Math.round10(rs.Region2['ProcessRating'], -2);
                    item['CommunicationComp'] = Math.round10(rs.Region2['CommunicationComp'], -2);
                    item['CourtesyComp'] = Math.round10(rs.Region2['CourtesyComp'], -2);
                    item['ResponsivenessComp'] = Math.round10(rs.Region2['ResponsivenessComp'], -2);
                    for (var i = 0; i < scoreToCal.length; i++) {
                        item[scoreToCal[i]] = Math.round10(rs.Region2[scoreToCal[i]], -2);
                    }
                    item['Comment'] = getWordArray(rs.Region2['Comment']);
                }else if(region2==false && region3==true & region4==false)
                {
                    item['Count'] = rs.Region3['Count'];
                    item['OverallComp'] = Math.round10(rs.Region3['OverallComp'], -2);
                    item['ProcessRating'] = Math.round10(rs.Region3['ProcessRating'], -2);
                    item['CommunicationComp'] = Math.round10(rs.Region3['CommunicationComp'], -2);
                    item['CourtesyComp'] = Math.round10(rs.Region3['CourtesyComp'], -2);
                    item['ResponsivenessComp'] = Math.round10(rs.Region3['ResponsivenessComp'], -2);
                    for (var i = 0; i < scoreToCal.length; i++) {
                        item[scoreToCal[i]] = Math.round10(rs.Region3[scoreToCal[i]], -2);
                    }
                    item['Comment'] = getWordArray(rs.Region3['Comment']);
                }
            }
            return item;
        }

        function averageEachRegion(result) {
            for (var i = 1; i < 6; i++) {
                if (result['Region' + i]['Count'] > 0) {
                    getAverage(result['Region' + i], result['Region' + i]['Count']);
                }
            }
            // calculate region all
            //Livanta
            if (result.Region1['Count'] != 0 && result.Region5['Count'] != 0 ) {
                //getAverage(result.RegionAll, result.RegionAll['Count']);
                result.RegionAll.Livanta =  calRegionAll(result, 'Li', true, false,false,false,true);
            } else if(result.Region1['Count'] != 0) {
                result.RegionAll.Livanta = calRegionAll(result, 'Li', true, false, false, false, false);
            } else if (result.Region5['Count'] != 0)
            {
                result.RegionAll.Livanta = calRegionAll(result, 'Li', false, false, false, false, true);
            }
            //Kepro
            if (result.Region2['Count'] != 0 && result.Region3['Count'] !=0 && result.Region4['Count'] != 0)
            {
                result.RegionAll.Kepro = calRegionAll(result, 'Ke', false,true,true,true,false);
            } else if (result.Region2['Count'] == 0 && result.Region3['Count'] != 0 && result.Region4['Count'] != 0) {
                result.RegionAll.Kepro = calRegionAll(result, 'Ke', false, false, true, true, false);
            } else if (result.Region2['Count'] != 0 && result.Region3['Count'] != 0 && result.Region4['Count'] == 0) {
                result.RegionAll.Kepro = calRegionAll(result, 'Ke', false, true, true, false, false);
            } else if (result.Region2['Count'] != 0 && result.Region3['Count'] == 0 && result.Region4['Count'] != 0) {
                result.RegionAll.Kepro = calRegionAll(result, 'Ke', false, true, false, true, false);
            } else if (result.Region2['Count'] == 0 && result.Region3['Count'] == 0 && result.Region4['Count'] != 0) {
                result.RegionAll.Kepro = calRegionAll(result, 'Ke', false, false, false, true, false);
            } else if (result.Region2['Count'] != 0 && result.Region3['Count'] == 0 && result.Region4['Count'] == 0) {
                result.RegionAll.Kepro = calRegionAll(result, 'Ke', false, true, false, false, false);
            } else if (result.Region2['Count'] == 0 && result.Region3['Count'] != 0 && result.Region4['Count'] == 0) {
                result.RegionAll.Kepro = calRegionAll(result, 'Ke', false, false, true, false, false);
            }
            // calcuate all regions comment
            for (var i = 1; i < 6; i++)
            {
                result['Region' + i]['Comment'] = getWordArray(result['Region' + i]['Comment']);
            }

        }

        function calRegion(result, item) {
            switch (item['RegionCode']) {
                case 1:
                    calData(result.Region1, item);
                    break;
                case 2:
                    calData(result.Region2, item);
                    break;
                case 3:
                    calData(result.Region3, item);
                    break;
                case 4:
                    calData(result.Region4, item);
                    break;
                case 5:
                    calData(result.Region5, item);
                    break;
                default:
                    break;
            }
        }
        $scope.keproColors = ["#1B5E20", "#388E3C", "#76FF03", "#00C853", "#4CAF50", "#00E676", "#69F0AE"];
        $scope.livantaColors = ["#1A237E", "#01579B", "#0288D1", "#0091EA", "#00B0FF", "#40C4FF", "#B3E5FC"];
        //get last two weeks data by default
        $scope.setResult('lastMonth');
    }
})();

(function () {
    /**
     * Decimal adjustment of a number.
     *
     * @param {String}  type  The type of adjustment.
     * @param {Number}  value The number.
     * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
     * @returns {Number} The adjusted value.
     */
    function decimalAdjust(type, value, exp) {
        // If the exp is undefined or zero...
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        // If the value is not a number or the exp is not an integer...
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        // Shift
        value = value.toString().split('e');
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

    // Decimal round
    if (!Math.round10) {
        Math.round10 = function (value, exp) {
            return decimalAdjust('round', value, exp);
        };
    }
    // Decimal floor
    if (!Math.floor10) {
        Math.floor10 = function (value, exp) {
            return decimalAdjust('floor', value, exp);
        };
    }
    // Decimal ceil
    if (!Math.ceil10) {
        Math.ceil10 = function (value, exp) {
            return decimalAdjust('ceil', value, exp);
        };
    }
})();