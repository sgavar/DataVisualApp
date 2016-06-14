using System;
using System.Collections.Generic;

namespace DataVisualApp.Models
{
   public interface IRepository<T, in TKey>
        where T : IComparable, IComparable<T>, IEquatable<T>
        where TKey : IComparable, IComparable<TKey>, IEquatable<TKey>
    {
        void Add(T obj);
        bool Exists(TKey id);
        IEnumerable<T> Get();
        IEnumerable<T> Get(DateTime sd, DateTime ed);
        T Get(TKey id);
        void Remove(TKey id);
        T Update(TKey id, T obj);
    }
}
