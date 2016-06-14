using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;
using System.Net.Mail;
using System.Net;
using DataVisualApp.Models;
using Microsoft.Extensions.OptionsModel;

namespace DataVisualApp.Services
{
    // This class is used by the application to send Email and SMS
    // when you turn on two-factor authentication in ASP.NET Identity.
    // For more details see this link http://go.microsoft.com/fwlink/?LinkID=532713
    public class AuthMessageSender : IEmailSender, ISmsSender
    {
        //private readonly IApplicationEnvironment _appEnv;
        private readonly IOptions<SmtpOptions> _smtpOptions;

        public AuthMessageSender(IOptions<SmtpOptions> smtpOptions)
        {
            _smtpOptions = smtpOptions;
        }

        public async Task SendEmailAsync(string email, string subject, string message)
        {
            try
            {

                var _email = _smtpOptions.Value.FromAddress;
                var _epass = _smtpOptions.Value.Password;
                var _dispName = _smtpOptions.Value.UserName;
                var _enableSsl = _smtpOptions.Value.EnableSsl;
                var _port = _smtpOptions.Value.Port;
                var _host = _smtpOptions.Value.Host;
                var _useDefaultCredentials = _smtpOptions.Value.DefaultCredentials;
                //var _deliveryMethod = _smtpOptions.Value.DeliverMethod;

                MailMessage myMessage = new MailMessage();
                myMessage.To.Add(email);
                myMessage.From = new MailAddress(_email, _dispName);
                myMessage.Subject = subject;
                myMessage.Body = message;
                myMessage.IsBodyHtml = true;
                using (SmtpClient smtp = new SmtpClient())
                {
                    smtp.EnableSsl = _enableSsl;
                    smtp.Host = _host;
                    smtp.Port = _port;
                    smtp.UseDefaultCredentials = _useDefaultCredentials;
                    smtp.Credentials = new NetworkCredential(_email, _epass);
                    smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
                    smtp.SendCompleted += (s, e) => { smtp.Dispose(); };
                    await smtp.SendMailAsync(myMessage);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public Task SendSmsAsync(string number, string message)
        {
            // Plug in your SMS service here to send a text message.
            return Task.FromResult(0);
        }
    }
}
