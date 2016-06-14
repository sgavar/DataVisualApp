using System;
using System.ComponentModel.DataAnnotations;

namespace DataVisualApp.ViewModels
{
    public sealed class SurveyViewModel
    {
        public int key { get; set; }

        public string SurveyType { get; set; }

        public string SurveyIndicator { get; set; }

        public string StateCode { get; set; }

        [Range(1, 5)]
        [Required]
        public int RegionCode { get; set; }

        [DataType(DataType.Date)]
        public DateTime SampleDate { get; set; }

        public string SurveyOutcome { get; set; }

        [DataType(DataType.Date)]
        [Required]
        public DateTime InterviewDate { get; set; }

        public decimal q6Comp { get; set; }

        public decimal q7Comp { get; set; }

        public decimal q8Comp { get; set; }

        public decimal q9Comp { get; set; }

        public decimal q10Comp { get; set; }

        public decimal q11Comp { get; set; }

        public decimal q12Comp { get; set; }

        public decimal q13Comp { get; set; }

        public decimal q15Comp { get; set; }

        public decimal q16Comp { get; set; }

        public decimal q17Comp { get; set; }

        public decimal q18Comp { get; set; }

        [Range(1.0, 10.0)]
        public decimal ProcessRating { get; set; }

        [Range(1.0, 100.0)]
        public decimal OverallComp { get; set; }

        [Range(1.0, 100.0)]
        public decimal CommunicationComp { get; set; }

        [Range(1.0, 100.0)]
        public decimal CourtesyComp { get; set; }

        [Range(1.0, 100.0)]
        public decimal ResponsivenessComp { get; set; }

        public string Comment { get; set; }

        [DataType(DataType.Date)]
        public DateTime LoadDate { get; set; }


    }
}