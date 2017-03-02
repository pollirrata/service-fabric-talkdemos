using System.Web.Http;
using System.Web.Http.Cors;
using Microsoft.WindowsAzure.Storage.Table;

namespace SpaceSpiders.Services.Controllers.api
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class ColorConfigController : BaseApiController
    {
        public object Get()
        {
            TableOperation operation = TableOperation.Retrieve<ColorConfig>("config", "color");
            ColorConfig colors = _table.Execute(operation).Result as ColorConfig;
            return new {spiderColor = colors.Spider, beamColor = colors.Beam};
        }

        public void Post([FromBody]ColorConfig colors )
        {
            TableOperation operation = TableOperation.InsertOrMerge(colors);
            _table.Execute(operation);  
        }
    }

    public class ColorConfig: TableEntity
    {
        public ColorConfig()
        {
            this.PartitionKey = "config";
            this.RowKey = "color";
        }
        public string Spider { get; set; }
        public string Beam { get; set; }
    }
}
