using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace SpaceSpiders.Services.Controllers.Api
{
    public class GameStatusController : ApiController
    {
        private static readonly Dictionary<string, string> _games = new Dictionary<string, string>();

        public string Get(string id)
        {
            string game = string.Empty;
            _games.TryGetValue(id, out game);

            return game;
        }

        public HttpResponseMessage Post(string id, [FromBody] string status)
        {
            if (!_games.ContainsKey(id)) return new HttpResponseMessage(HttpStatusCode.NotFound);

            _games[id] = status;
            return new HttpResponseMessage(HttpStatusCode.OK);
        }

        public string Put([FromBody]string status)
        {
            string id = Guid.NewGuid().ToString();
            _games.Add(id, string.Empty);
            return id;
        }

        public HttpResponseMessage Delete(string id)
        {
            if (!_games.ContainsKey(id)) return new HttpResponseMessage(HttpStatusCode.NotFound);

            _games.Remove(id);
            return new HttpResponseMessage(HttpStatusCode.OK);
        }
    }
}