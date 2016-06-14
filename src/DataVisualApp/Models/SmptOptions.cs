﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataVisualApp.Models
{
    public class SmtpOptions
    {
        public string UserName { get; set; }
        public string Password { get; set; }
        public string FromName { get; set; }
        public string FromAddress { get; set; }
        public string DeliverMethod { get; set; }
        public string Host { get; set; }
        public int Port { get; set; }
        public bool DefaultCredentials { get; set; }
        public bool EnableSsl { get; set; }
    }
}
