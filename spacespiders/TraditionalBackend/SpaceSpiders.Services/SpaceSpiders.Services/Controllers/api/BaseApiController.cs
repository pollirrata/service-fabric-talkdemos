using System.Web.Http;
using Microsoft.Azure;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;

namespace SpaceSpiders.Services.Controllers.api
{
    public class BaseApiController:ApiController
    {
        protected CloudTable _table;

        public BaseApiController()
        {
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(
                CloudConfigurationManager.GetSetting("StorageConnectionString")
            );

            CloudTableClient tableClient = storageAccount.CreateCloudTableClient();
            _table = tableClient.GetTableReference("spacespiders");
            _table.CreateIfNotExists();
        }
    }
}