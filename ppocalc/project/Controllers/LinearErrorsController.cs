
using CalcAPI.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace CalcAPI.Controllers
{
    
    public class ErrorController : ApiController
    {


        
        [HttpPost]
        [AcceptVerbs("POST")]
        public dynamic Calculate([FromBody]Model model)
        {
            double e = 0;
            double f = 0;
            double en = 0;

            for (var i = model.linear ? 0 : 1 ; i < model.demands.Length; i++)
            {
                e += Math.Abs(model.demands[i] - model.result[i]);
                en += model.demands[i] - model.result[i];
                f += model.demands[i];
            }



            return new Results {
                Mad = e / model.demands.Length,
                Mapd = e / f * 100,
                E = e,
                Bias = en / model.demands.Length,
                Ts = en / (e / model.demands.Length)
        };
        }
    }
}
