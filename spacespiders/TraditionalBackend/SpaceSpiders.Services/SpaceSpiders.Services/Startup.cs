using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(SpaceSpiders.Services.Startup))]
namespace SpaceSpiders.Services
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {        }
    }
}
