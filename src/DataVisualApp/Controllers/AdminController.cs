using DataVisualApp.Models;
using DataVisualApp.ViewModels.Admin;
using Microsoft.AspNet.Authorization;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Mvc;
using Microsoft.AspNet.Mvc.Rendering;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DataVisualApp.Controllers
{
    [Authorize(Roles = "Admin")]
    [RequireHttps]
    public class AdminController : Controller
    {
        #region Vars/Props

        private UserManager<ApplicationUser> _userManager;
        public ApplicationDbContext _context;
        public static List<AdminUserViewModel> usrList = new List<AdminUserViewModel>();
        public static List<SelectListItem> roleList = new List<SelectListItem>();
        public static string AdmUsrName { get; set; }
        public static string AdmUsrEmail { get; set; }
        public static string AdmUsrRole { get; set; }
        public static string AdmNameSrch { get; set; }
        public static string AdmRankSrch { get; set; }

        #endregion Vars/Props

        public AdminController(UserManager<ApplicationUser> userManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult> Index(AdminUserViewModel model, ManageMessageId? message = null)
        {
            ViewBag.StatusMessage =
                message == ManageMessageId.UserDeleted ? "User account has successfully been deleted."
                : message == ManageMessageId.UserUpdated ? "User account has been updated"
                : "";

            ViewBag.ErrorMessage =
                message == ManageMessageId.Error ? "An error has occurred"
                : "";

            await ShowUserDetails(model);
            return View();
        }

        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        public async Task<ActionResult> ShowUserDetails(AdminUserViewModel model)
        {
            usrList.Clear();
            IList<ApplicationUser> users = _userManager.Users.ToList();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                model.UserName = user.UserName;
                foreach (var role in roles)
                {
                    model.GroupName = role;
                    switch (role)
                    {
                        case "Admin":
                            model.GroupId = "1";
                            break;

                        case "Elevated":
                            model.GroupId = "2";
                            break;

                        case "Livanta":
                            model.GroupId = "3";
                            break;

                        case "Kepro":
                            model.GroupId = "4";
                            break;

                        case "Member":
                            model.GroupId = "5";
                            break;

                        case "Inactive":
                            model.GroupId = "6";
                            break;

                        default:
                            break;
                    }
                }
                model.UserId = user.Id;
                model.EmailConfirmed = user.EmailConfirmed;
                usrList.Add(new AdminUserViewModel() { UserName = model.UserName, GroupName = model.GroupName, UserId = model.UserId, GroupId = model.GroupId, EmailConfirmed = model.EmailConfirmed });
                model.GroupName = null;
            }
            return PartialView("ShowUserDetails");
        }

        [HttpGet]
        public ActionResult EditUser()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> EditUser(string id, AdminEditViewModel model)
        {
            try
            {
                //TODO: Add update logic here
                var user = await _userManager.FindByIdAsync(id);
                model.Email = user.Email;
                var roles = await _userManager.GetRolesAsync(user);
                model.UserName = user.UserName;
                foreach (var role in roles)
                {
                    model.GroupName = role;
                }
                AdmUsrName = model.UserName;
                AdmUsrEmail = model.Email;
                AdmUsrRole = model.GroupName;
                return RedirectToAction("EditUser");
            }
            catch
            {
                return View();
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> SaveUser(string id, AdminEditViewModel model)
        {
            try
            {
                AdmUsrRole = model.GroupName;
                AdmUsrName = model.UserName;
                var userid = _context.Users.Where(x => x.UserName == AdmUsrName).Select(x => x.Id).FirstOrDefault();
                var user = await _userManager.FindByIdAsync(userid);
                var userRoles = await _userManager.GetRolesAsync(user);
                foreach (var role in userRoles)
                {
                    await _userManager.RemoveFromRoleAsync(user, role);
                }

                await _userManager.AddToRoleAsync(user, AdmUsrRole);
                return RedirectToAction(nameof(AdminController.Index), new { Message = ManageMessageId.UserUpdated });
            }
            catch
            {
                return RedirectToAction(nameof(AdminController.Index), new { Message = ManageMessageId.Error });
            }
        }

        [HttpGet]
        public ActionResult DeleteUser()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> DeleteUser(string userid)
        {
            if (AdmUsrRole.Equals("Admin"))
            {
                return RedirectToAction(nameof(AdminController.Index));
            }
            userid = _context.Users.Where(x => x.UserName == AdmUsrName).Select(x => x.Id).FirstOrDefault();
            var user = await _userManager.FindByIdAsync(userid);
            var claims = await _userManager.GetClaimsAsync(user);
            var roles = await _userManager.GetRolesAsync(user);
            var logins = await _userManager.GetLoginsAsync(user);
            await _userManager.RemoveClaimsAsync(user, claims);
            await _userManager.RemoveFromRolesAsync(user, roles);
            foreach (var login in logins)
            {
                await _userManager.RemoveLoginAsync(user, login.LoginProvider, login.ProviderKey);
            }
            await _userManager.DeleteAsync(user);
            return RedirectToAction(nameof(AdminController.Index), new { Message = ManageMessageId.UserDeleted });
        }

        #region Helper

        public IEnumerable<SelectListItem> GetUserRoles(string usrrole)
        {
            //var roles = _context.Roles.OrderBy(x => x.Name).ToList();
            List<AdminRoleViewModel> rlList = new List<AdminRoleViewModel>();
            //rlList.Add(new AdminRoleViewModel() { Role = "Admin", RoleId = "1" });
            rlList.Add(new AdminRoleViewModel() { Role = "Elevated", RoleId = "2" });
            rlList.Add(new AdminRoleViewModel() { Role = "Livanta", RoleId = "3" });
            rlList.Add(new AdminRoleViewModel() { Role = "Kepro", RoleId = "4" });
            rlList.Add(new AdminRoleViewModel() { Role = "Member", RoleId = "5" });
            rlList.Add(new AdminRoleViewModel() { Role = "Inactive", RoleId = "6" });
            rlList = rlList.OrderBy(x => x.RoleId).ToList();

            List<SelectListItem> roleNames = new List<SelectListItem>();
            foreach (var role in rlList)
            {
                roleNames.Add(new SelectListItem()
                {
                    Text = role.Role,
                    Value = role.Role
                });
            }
            var selectedRoleName = roleNames.FirstOrDefault(d => d.Value == usrrole);
            if (selectedRoleName != default(SelectListItem))
            {
                selectedRoleName.Selected = true;
            }
            return roleNames;
        }

        public enum ManageMessageId
        {
            Error,
            UserDeleted,
            UserUpdated
        }

        #endregion Helper
    }
}