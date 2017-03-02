using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using Microsoft.WindowsAzure.Storage.Table;
using SpaceSpiders.Services.Controllers.api;

namespace SpaceSpiders.Services.Controllers.Api
{
    [EnableCors(origins: "*", headers: "*", methods:"*")]
    public class GameStatusController : BaseApiController
    {
        public string Get(string id)
        {

            TableOperation operation = TableOperation.Retrieve<GameStatus>("status", id);
            GameStatus currentStatus = _table.Execute(operation).Result as GameStatus;

            if (currentStatus == null) throw new HttpResponseException(HttpStatusCode.NotFound);

            return currentStatus.Status;
        }

        public HttpResponseMessage Post(string id, [FromBody] string status)
        {
            //if (!_games.ContainsKey(id)) return new HttpResponseMessage(HttpStatusCode.NotFound);

            TableOperation operation = TableOperation.Retrieve<GameStatus>("status", id);
            GameStatus currentStatus = _table.Execute(operation).Result as GameStatus;

            if(currentStatus == null) return new HttpResponseMessage(HttpStatusCode.NotFound);

            currentStatus.Status = status;
            operation = TableOperation.InsertOrMerge(currentStatus);
            _table.Execute(operation);

            return new HttpResponseMessage(HttpStatusCode.OK);
        }

        public string Put([FromBody]string status)
        {
            string id = Guid.NewGuid().ToString();
            TableOperation operation = TableOperation.Insert(new GameStatus() {RowKey = id, Status = status});
            _table.Execute(operation);

            return id;
        }

        public HttpResponseMessage Delete(string id)
        {
            TableOperation operation = TableOperation.Retrieve<GameStatus>("status", id);
            GameStatus currentStatus = _table.Execute(operation).Result as GameStatus;

            if (currentStatus == null) return new HttpResponseMessage(HttpStatusCode.NotFound);

            operation = TableOperation.Delete(currentStatus);
            _table.Execute(operation);
            return new HttpResponseMessage(HttpStatusCode.OK);
        }
    }

    public class GameStatus : TableEntity
    {
        public GameStatus()
        {
            this.PartitionKey = "status";
        }
        public string Status { get; set; }
    }
}