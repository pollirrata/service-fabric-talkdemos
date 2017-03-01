using System.Web.Http;
using System.Web.Http.Cors;
using Microsoft.Ajax.Utilities;

namespace SpaceSpiders.Services.Controllers.api
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class ColorConfigController : ApiController
    {
        private static string _spiderColor = "blue";
        private static string _beamColor = "red";

        public object Get()
        {
            return new {spiderColor = _spiderColor, beamColor = _beamColor};
        }

        public void Post([FromBody]ColorConfig colors )
        {
            if (!colors.Spider.IsNullOrWhiteSpace())
            {
                _spiderColor = colors.Spider;
            }
            if (!colors.Beam.IsNullOrWhiteSpace())
            {
                _beamColor = colors.Beam;
            }
        }
    }

    public class ColorConfig
    {
        public string Spider { get; set; }
        public string Beam { get; set; }
    }
}
