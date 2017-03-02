using System.Web.Http;
using System.Web.Http.Cors;
using Microsoft.WindowsAzure.Storage.Table;

namespace SpaceSpiders.Services.Controllers.api
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class ScoreConfigController : BaseApiController
    {
        public object Get()
        {
            TableOperation operation = TableOperation.Retrieve<ScoreConfig>("config", "score");
            ScoreConfig score = _table.Execute(operation).Result as ScoreConfig;
            return new { hitScore = score.HitScore, missScore = score.MissScore };
        }

        public void Post([FromBody]ScoreConfig score)
        {
            TableOperation operation = TableOperation.InsertOrMerge(score);
            _table.Execute(operation);
        }
    }

    public class ScoreConfig:TableEntity
    {
        public ScoreConfig()
        {
            this.PartitionKey = "config";
            this.RowKey = "score";
        }
        public int? HitScore { get; set; }
        public int? MissScore { get; set; }
    }
}
