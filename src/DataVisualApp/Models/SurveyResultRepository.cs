using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;

namespace DataVisualApp.Models
{
    public class SurveyResultRepository : IRepository<SurveyResult, int>
    {
        //private readonly ApplicationDbContext _Context = new ApplicationDbContext();

        public readonly ApplicationDbContext _context;

        public SurveyResultRepository(ApplicationDbContext diContext)
        {
            _context = diContext;
        }

        public void Add(SurveyResult obj)
        {
            //Contract.Requires<ArgumentNullException>(obj != default(SurveyResult));
            //Contract.Requires<ArgumentNullException>(obj.key != Guid.Empty);
            //Requires<ArgumentException>(!Exists(obj.key));
            if (obj == default(SurveyResult) || obj.key == 0)
            {
                throw new ArgumentNullException();
            }
            if (Exists(obj.key))
            {
                throw new ArgumentException();
            }
            obj.LoadDate = DateTime.UtcNow;
            _context.SurveyResult.Add(obj);
            _context.SaveChanges();
        }

        [Pure]
        public bool Exists(int id)
        {
            if (id == 0)
            {
                throw new ArgumentNullException();
            }

            return _context.SurveyResult?.FirstOrDefault(r => r.key == id) != default(SurveyResult);
        }

        [Pure]
        public IEnumerable<SurveyResult> Get()
        {
            Contract.Ensures(Contract.Result<IEnumerable<SurveyResult>>() != default(IEnumerable<SurveyResult>));

            return _context.SurveyResult.Where(r=>r.q1==1&&r.q5==1&&r.OverallComp.HasValue).OrderByDescending(r => r.InterviewDate);
        }

        [Pure]
        public SurveyResult Get(int id)
        {
            Contract.Requires<ArgumentNullException>(id != 0);
            Contract.Requires<ArgumentOutOfRangeException>(Exists(id));
            Contract.Ensures(Contract.Result<SurveyResult>() != default(SurveyResult));

            return _context.SurveyResult.FirstOrDefault(r => r.key == id);
        }

        [Pure]
        public IEnumerable<SurveyResult> Get(DateTime startDate, DateTime endDate)
        {
            if (startDate != default(DateTime) && endDate != default(DateTime))
            {
                return _context.SurveyResult.Where(r => r.InterviewDate.Date >= startDate.Date && r.InterviewDate.Date <= endDate.Date && r.q1 == 1 && r.q5 == 1 && r.OverallComp.HasValue).OrderByDescending(s => s.InterviewDate);
            }
            else
            {
                return null;
            }
        }

        public void Remove(int id)
        {
            Contract.Requires<ArgumentNullException>(id != 0);
            Contract.Requires<ArgumentOutOfRangeException>(Exists(id));

            //_context.SurveyResult.Remove(_context.SurveyResult.FirstOrDefault(r => r.key == id));
            //_context.SaveChanges();
        }

        public SurveyResult Update(int id, SurveyResult obj)
        {
            Contract.Requires<ArgumentNullException>(id != 0);
            Contract.Requires<ArgumentNullException>(obj != default(SurveyResult));
            Contract.Requires<ArgumentException>(id == obj.key);
            Contract.Requires<ArgumentOutOfRangeException>(Exists(id));
            Contract.Ensures(Contract.Result<SurveyResult>() != default(SurveyResult));

            //var sel = _context.SurveyResult.FirstOrDefault(r => r.key == id);
            //_context.SurveyResult.Remove(sel);

            //obj.LoadDate = DateTime.UtcNow;
            //_context.SurveyResult.Add(obj);
            //_context.SaveChanges();
            return obj;
        }
    }
}