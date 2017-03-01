using System.Web.Http;
using System.Web.Http.Cors;

namespace SpaceHitScores.Services.Controllers.api
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class ScoreConfigController : ApiController
    {
        private static int _hitScore = 100;
        private static int _missScore = 50;

        public object Get()
        {
            return new { hitScore = 100, missScore = 50 };
        }

        public void Post([FromBody]ScoreConfig colors)
        {
            if (colors.HitScore.HasValue)
            {
                _hitScore = colors.HitScore.Value;
            }
            if (colors.MissScore.HasValue)
            {
                _missScore = colors.MissScore.Value;
            }
        }
    }

    public class ScoreConfig
    {
        public int? HitScore { get; set; }
        public int? MissScore { get; set; }
    }
}
