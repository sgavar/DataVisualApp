using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using Microsoft.AspNet.Authorization;

namespace DataVisualApp.Controllers
{
    [RequireHttps]
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return RedirectToAction("BSRSurvey");
        }

        public IActionResult About()
        {
            ViewData["Message"] = "About BSR-Survey dashboard";

            return View();
        }

        //
        // Get: EmailSent
        public IActionResult EmailSent()
        {
            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Message"] = "Please use following methods to contact us.";

            return View();
        }

        public IActionResult Error()
        {
            return View();
        }

        [Authorize]
        public IActionResult BSRSurvey()
        {
            return View();
        }

        #region FileDownload

        [HttpGet]
        [Authorize(Roles = "Admin,Elevated,Livanta")]
        public IActionResult DownloadLivanta1Data()
        {
            return Redirect("/api/DatavisualApp/DownloadLivanta1Data");
        }
        [HttpGet]
        [Authorize(Roles = "Admin,Elevated,Livanta")]
        public IActionResult DownloadLivanta5Data()
        {
            return Redirect("/api/DatavisualApp/DownloadLivanta5Data");
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Elevated,Kepro")]
        public IActionResult DownloadKepro2Data()
        {
            return Redirect("/api/DatavisualApp/DownloadKepro2Data");
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Elevated,Kepro")]
        public IActionResult DownloadKepro3Data()
        {
            return Redirect("/api/DatavisualApp/DownloadKepro3Data");
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Elevated,Kepro")]
        public IActionResult DownloadKepro4Data()
        {
            return Redirect("/api/DatavisualApp/DownloadKepro4Data");
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Elevated,Kepro,Livanta")]
        public IActionResult DownloadDataDic()
        {
            return Redirect("/api/DatavisualApp/DownloadDataDic");
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Elevated,Kepro,Livanta")]
        public IActionResult DownloadScoring()
        {
            return Redirect("/api/DatavisualApp/DownloadScoring");
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Elevated")]
        public IActionResult DownloadAllData()
        {
            return Redirect("/api/DatavisualApp/DownloadAllData");
        }

        #endregion FileDownload
    }
}
