using DataVisualApp.Models;
using DataVisualApp.ViewModels;
using Microsoft.AspNet.Authorization;
using Microsoft.AspNet.Hosting;
using Microsoft.AspNet.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using static System.Diagnostics.Contracts.Contract;

namespace DataVisualApp.Controllers
{
    [Authorize(Roles = "Admin,Elevated,Livanta,Kepro,Member")]
    [Route("api/DataVisualApp")]
    [RequireHttps]
    public class SurveyResultController : Controller
    {
        internal static readonly IEnumerable<string> StringEscapes = new[] { "an", "as", "at", "by", "comments", "for", "from", "have", "he", "if", "it", "much", "name", "no", "of", "on", "only", "she", "still", "that", "The", "they", "this", "to", "very", "was", "went", "were", "which", "with", "would", "you" };

        private readonly IAuthorizationService _authz;
        private readonly IHostingEnvironment _hostingEnvironment;
        internal static readonly int NORESPONSE = 0;

        public SurveyResultController(IAuthorizationService authz, IHostingEnvironment hostingEnvironment)
        {
            _authz = authz;
            _hostingEnvironment = hostingEnvironment;
        }

        [FromServices]
        public IRepository<SurveyResult, int> _repository { get; set; }

        [HttpGet]
        public IActionResult GetAll()
        {
            //Return SurveyViewModel
            var res = _repository.Get();
            if (res != default(IEnumerable<SurveyResult>))
            {
                var result = (from r in res
                              where r.q1 == 1 && r.q5 == 1 && r.OverallComp.HasValue
                              select new SurveyViewModel
                              {
                                  key = r.key,
                                  SurveyType = r.SurveyType,
                                  RegionCode = r.RegionCode,
                                  InterviewDate = r.InterviewDate,
                                  q6Comp = r.q6.HasValue ? r.q6.Value : NORESPONSE,
                                  q7Comp = r.q7.HasValue ? r.q7.Value : NORESPONSE,
                                  q8Comp = r.q8.HasValue ? r.q8.Value : NORESPONSE,
                                  q9Comp = r.q9.HasValue ? r.q9.Value : NORESPONSE,
                                  q10Comp = r.q10.HasValue ? r.q10.Value : NORESPONSE,
                                  q11Comp = r.q11.HasValue ? r.q11.Value : NORESPONSE,
                                  q12Comp = r.q12.HasValue ? r.q12.Value : NORESPONSE,
                                  q13Comp = r.q13.HasValue ? r.q13.Value : NORESPONSE,
                                  q15Comp = r.q15.HasValue ? r.q15.Value : NORESPONSE,
                                  q16Comp = r.q16.HasValue ? r.q16.Value : NORESPONSE,
                                  q17Comp = r.q17.HasValue ? r.q17.Value : NORESPONSE,
                                  q18Comp = r.q18.HasValue ? r.q18.Value : NORESPONSE,
                                  ProcessRating = r.q19.HasValue ? r.q19.Value : NORESPONSE,
                                  OverallComp = r.OverallComp.Value,
                                  CommunicationComp = r.CommunicationComp.HasValue ? r.CommunicationComp.Value : NORESPONSE,
                                  CourtesyComp = r.CourtesyComp.HasValue ? r.CourtesyComp.Value : NORESPONSE,
                                  ResponsivenessComp = r.ResponsivenessComp.HasValue ? r.ResponsivenessComp.Value : NORESPONSE,
                                  Comment = " " + r.q20,
                                  LoadDate = r.LoadDate
                              }).ToList();

                return new JsonResult(result);
            }
            else
            {
                return HttpBadRequest();
            }
        }

        [HttpGet("[action]", Name = "GetTrendData")]
        public IActionResult GetTrendData()
        {
            // Create data structure for trend data
            // 1. Get all data
            var res = _repository.Get().ToList();
            // 2. Project to result by half month
            var countList = new int[10];
            for (var i = 0; i < countList.Length; i++)
            {
                if (i < 5)
                {
                    countList[i] = res.Count(r => r.RegionCode == (i + 1) && r.SurveyType == "APPEALS");
                }
                else
                {
                    countList[i] = res.Count(r => r.RegionCode == (i - 4) && r.SurveyType == "COMPLAINTS");
                }
            }
            var trendData = new Dictionary<string, Dictionary<int, List<SurveyTrendViewModel>>>();
            trendData.Add("APPEALS", new Dictionary<int, List<SurveyTrendViewModel>>());
            trendData.Add("COMPLAINTS", new Dictionary<int, List<SurveyTrendViewModel>>());
            var regions = new List<int> { 1, 2, 3, 4, 5 };
            var newDate = res.First().InterviewDate;
            var oldestInterviewDate = res.Last().InterviewDate;
            var oldDate = newDate.AddMonths(-1);
            foreach (var re in regions)
            {
                trendData["APPEALS"].Add(re, new List<SurveyTrendViewModel>());
                trendData["COMPLAINTS"].Add(re, new List<SurveyTrendViewModel>());
            }
            while (oldDate >= oldestInterviewDate)
            {
                foreach (int region in regions)
                {
                    var appTempData = GetTrendDataByDate(oldDate, newDate, res, "APPEALS", region);
                    var comTempData = GetTrendDataByDate(oldDate, newDate, res, "COMPLAINTS", region);

                    if (appTempData != null)
                    {
                        trendData["APPEALS"][region].Add(appTempData);
                    }
                    if (comTempData != null)
                    {
                        trendData["COMPLAINTS"][region].Add(comTempData);
                    }
                }

                newDate = oldDate;
                if ((oldDate - oldestInterviewDate).Days < 30 && oldDate != oldestInterviewDate)
                {
                    oldDate = oldestInterviewDate;
                }
                else if (oldDate == oldestInterviewDate)
                {
                    break;
                }
                else
                {
                    oldDate = newDate.AddMonths(-1);
                }
            }

            return new JsonResult(new { countList = countList, trendData = trendData });
        }

        private SurveyTrendViewModel GetTrendDataByDate(DateTime oldDate, DateTime newDate, List<SurveyResult> res, string sType, int region)
        {
            //var res = _repository.Get(oldDate, newDate);
            if (res != default(List<SurveyResult>))
            {
                var scoreList = (from r in res
                                 where r.InterviewDate > oldDate && r.InterviewDate <= newDate && r.OverallComp.HasValue && r.SurveyType == sType && r.RegionCode == region
                                 select r.OverallComp.Value
                             ).ToList();
                if (scoreList.Count != 0)
                {
                    var item = new SurveyTrendViewModel()
                    {
                        date = newDate,
                        score = scoreList.Sum(),
                        count = scoreList.Count()
                    };
                    return item;
                }
                else
                {
                    //var item = new SurveyTrendViewModel()
                    //{
                    //    date = newDate,
                    //    score = 0
                    //};
                    return null;
                }
            }
            return null;
        }

        [HttpGet("{startDate:datetime}/{endDate:datetime}", Name = "GetByTimeRange")]
        public IActionResult GetByTimeRange(DateTime startDate, DateTime endDate)
        {
            Requires(startDate != default(DateTime) && endDate != default(DateTime));
            try
            {
                var res = _repository.Get(startDate, endDate).ToList();
                if (res != default(List<SurveyResult>))
                {
                    var result = (from r in res
                                  select new SurveyViewModel
                                  {
                                      key = r.key,
                                      SurveyType = r.SurveyType,
                                      RegionCode = r.RegionCode,
                                      InterviewDate = r.InterviewDate,
                                      q6Comp = r.q6.HasValue ? r.q6.Value : NORESPONSE,
                                      q7Comp = r.q7.HasValue ? r.q7.Value : NORESPONSE,
                                      q8Comp = r.q8.HasValue ? r.q8.Value : NORESPONSE,
                                      q9Comp = r.q9.HasValue ? r.q9.Value : NORESPONSE,
                                      q10Comp = r.q10.HasValue ? r.q10.Value : NORESPONSE,
                                      q11Comp = r.q11.HasValue ? r.q11.Value : NORESPONSE,
                                      q12Comp = r.q12.HasValue ? r.q12.Value : NORESPONSE,
                                      q13Comp = r.q13.HasValue ? r.q13.Value : NORESPONSE,
                                      q15Comp = r.q15.HasValue ? r.q15.Value : NORESPONSE,
                                      q16Comp = r.q16.HasValue ? r.q16.Value : NORESPONSE,
                                      q17Comp = r.q17.HasValue ? r.q17.Value : NORESPONSE,
                                      q18Comp = r.q18.HasValue ? r.q18.Value : NORESPONSE,
                                      ProcessRating = r.q19.HasValue ? r.q19.Value : NORESPONSE,
                                      OverallComp = r.OverallComp.Value,
                                      CommunicationComp = r.CommunicationComp.HasValue ? r.CommunicationComp.Value : NORESPONSE,
                                      CourtesyComp = r.CourtesyComp.HasValue ? r.CourtesyComp.Value : NORESPONSE,
                                      ResponsivenessComp = r.ResponsivenessComp.HasValue ? r.ResponsivenessComp.Value : NORESPONSE,
                                      Comment = " " + r.q20,
                                      //Comment = "Test comment",
                                      LoadDate = r.LoadDate
                                  }).ToList();

                    return new JsonResult(result);
                }
                else
                {
                    return HttpBadRequest();
                }
            }
            catch (ArgumentNullException)
            {
                return HttpBadRequest();
            }
            catch (ArgumentOutOfRangeException)
            {
                return HttpNotFound();
            }
            catch
            {
                return new HttpStatusCodeResult(503);
            }
        }

        [HttpGet("{id:int}", Name = "GetSurveyResult")]
        public IActionResult GetById(int id)
        {
            Requires(id != 0);

            try
            {
                return new ObjectResult(_repository.Get(id));
            }
            catch (ArgumentNullException)
            {
                return HttpBadRequest();
            }
            catch (ArgumentOutOfRangeException)
            {
                return HttpNotFound();
            }
            catch
            {
                return new HttpStatusCodeResult(503);
            }
        }

        #region FileDownload

        [HttpGet("[action]", Name = "DownloadLivanta1Data")]
        [Authorize(Roles = "Admin,Elevated,Livanta")]
        public FileResult DownloadLivanta1Data()
        {
            var filename = "BFCC-QIO Satisfaction Survey Data_Area 1-Livanta";
            return DownloadData(filename);
        }
        [HttpGet("[action]", Name = "DownloadLivanta5Data")]
        [Authorize(Roles = "Admin,Elevated,Livanta")]
        public FileResult DownloadLivanta5Data()
        {
            var filename = "BFCC-QIO Satisfaction Survey Data_Area 5-Livanta";
            return DownloadData(filename);
        }
        [HttpGet("[action]", Name = "DownloadKepro2Data")]
        [Authorize(Roles = "Admin,Elevated,Kepro")]
        public FileResult DownloadKepro2Data()
        {
            var filename = "BFCC-QIO Satisfaction Survey Data_Area 2-Kepro";
            return DownloadData(filename);
        }
        [HttpGet("[action]", Name = "DownloadKepro3Data")]
        [Authorize(Roles = "Admin,Elevated,Kepro")]
        public FileResult DownloadKepro3Data()
        {
            var filename = "BFCC-QIO Satisfaction Survey Data_Area 3-Kepro";
            return DownloadData(filename);
        }
        [HttpGet("[action]", Name = "DownloadKepro4Data")]
        [Authorize(Roles = "Admin,Elevated,Kepro")]
        public FileResult DownloadKepro4Data()
        {
            var filename = "BFCC-QIO Satisfaction Survey Data_Area 4-Kepro";
            return DownloadData(filename);
        }
        [HttpGet("[action]", Name = "DownloadDataDic")]
        [Authorize(Roles = "Admin,Elevated,Kepro,Livanta")]
        public FileResult DownloadDataDic()
        {
            var filename = "BFCC-QIO Satiisfaction Survey Data Dictionary";
            return DownloadData(filename);
        }

        [HttpGet("[action]", Name = "DownloadScoring")]
        [Authorize(Roles = "Admin,Elevated,Kepro,Livanta")]
        public FileResult DownloadScoring()
        {
            var filename = "10th_SOW_Survey_Scoring_Methodology_FINAL";
            return DownloadData(filename);
        }

        [HttpGet("[action]", Name = "DownloadAllData")]
        [Authorize(Roles = "Admin,Elevated")]
        public FileResult DownloadAllData()
        {
            var filename = "BFCC-QIO Satisfaction Survey Data_All";
            return DownloadData(filename);
        }

        #endregion FileDownload

        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ValidateAntiForgeryToken]
        public IActionResult Create([FromBody] SurveyResult item)
        {
            Requires(item != default(SurveyResult));

            try
            {
                //_repository.Add(item);
                //return CreatedAtRoute("GetSurveyResult", new { controller = "SurveyResult", id = item.key }, item);
                return new NoContentResult();
            }
            catch (ArgumentException)
            {
                return HttpBadRequest();
            }
            catch
            {
                return new HttpStatusCodeResult(503);
            }
        }

        [HttpPut("{id:guid}")]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "Admin")]
        public IActionResult Update(int id, [FromBody] SurveyResult item)
        {
            Requires(id != 0);
            Requires(item != default(SurveyResult));

            try
            {
                //_repository.Update(id, item);
                return new NoContentResult();
            }
            catch (ArgumentOutOfRangeException)
            {
                return HttpNotFound();
            }
            catch (ArgumentException)
            {
                return HttpBadRequest();
            }
            catch
            {
                return new HttpStatusCodeResult(503);
            }
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        [ValidateAntiForgeryToken]
        public IActionResult Delete(int id)
        {
            Requires(id != 0);

            try
            {
                //_repository.Remove(id);
                return new NoContentResult();
            }
            catch (ArgumentNullException)
            {
                return HttpBadRequest();
            }
            catch (ArgumentOutOfRangeException)
            {
                return HttpNotFound();
            }
            catch
            {
                return new HttpStatusCodeResult(503);
            }
        }

        #region Helpers

        private FileResult DownloadData(string filename)
        {
            var excelList = new List<String>() {
                            "BFCC-QIO Satisfaction Survey Data_Area 1-Livanta",
                            "BFCC-QIO Satisfaction Survey Data_Area 2-Kepro",
                            "BFCC-QIO Satisfaction Survey Data_Area 3-Kepro",
                            "BFCC-QIO Satisfaction Survey Data_Area 4-Kepro",
                            "BFCC-QIO Satisfaction Survey Data_Area 5-Livanta",
                            "BFCC-QIO Satisfaction Survey Data_All",
                            "BFCC-QIO Satiisfaction Survey Data Dictionary"
                           };
            var wordFile = "10th_SOW_Survey_Scoring_Methodology_FINAL";
            if(filename.Equals(wordFile))
            {
                return File("Datafiles/" + filename + ".doc", "application/msword", filename+".doc");
            }
            else if (excelList.Contains(filename))
            {
                return File("Datafiles/" + filename + ".xls", "application/vnd.ms-excel", filename + ".xls");
            }else
            {
                return default(FileResult);
            }
            
        }

        #endregion Helpers
    }
}