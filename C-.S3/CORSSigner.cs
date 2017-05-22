using System;
using System.Collections.Generic;
using System.Text;
using System.Security.Cryptography;
using System.IO;
using System.Web.UI;

namespace MiniAssessment
{
    public partial class signer : System.Web.UI.Page
    {
        private const string _clientPrivateKey = "S3_PRIVATE_KEY";
        private const string _expectedBucketName = "S3_BUCKET_NAME";
        private const int _expectedMaxSize = 15000000;
        private string _responseString;

        protected void Page_Load(object sender, EventArgs e)
        {
            if (Request.RequestType == "POST")
            {
                switch (Request.HttpMethod)
                {
                    case "OPTIONS":
                        handlePreflight();
                        break;
                    case "DELETE":
                        handleCorsRequest(); // only needed in a CORS environment 
                        //deleteObject(); 
                        break;
                    case "POST":
                        handleCorsRequest();
                        signRequest();
                        //verifyFileInS3();

                        Response.Flush();
                        break;
                }
            }
        }

        protected override void Render(HtmlTextWriter writer)
        {
            //Because this is a Page derived class, need to remove all normally rendered content.
            //Response.Write in other methods does an endrun around this
            writer.Write("");
        }

        private void handleCorsRequest()
        {
            // If you are relying on CORS, you will need to adjust the allowed domain here. 
            Response.AddHeader("Access-Control-Allow-Origin", "http://localhost:50315");
        }

        // Only needed in cross-origin setups 
        private void handlePreflight()
        {
            handleCorsRequest();
            Response.AddHeader("Access-Control-Allow-Methods", "POST");
            Response.AddHeader("Access-Control-Allow-Headers", "Content-Type");
        }

        private void signRequest()
        {
            Response.AddHeader("Content-Type", "application/json");


            var responseBody = stringFromStream(Request.InputStream);

            //no expectation of REST request so not implemented
            //var jsonContent = System.Web.Helpers.Json.Decode(responseBody);
            //if (!empty($contentAsObject["headers"])) { 
            //    signRestRequest($contentAsObject["headers"]); 
            //} 
            //else { 
            signPolicy(responseBody);
            //} 
        }

        private string stringFromStream(Stream stream)
        {
            var body = stream;
            var encoding = Request.ContentEncoding;
            var reader = new StreamReader(body, encoding);

            return reader.ReadToEnd();
        }

        private void signPolicy(string policyStr)
        {
            if (policyIsValid(policyStr))
            {
                var cleanPolicy = policyStr.Replace("\n", "").Replace("\r", "");

                //first incode to Base64
                var encodedPolicy = Convert.ToBase64String(bytesFromString(cleanPolicy));
                //then sign
                var signedPolicy = sign(encodedPolicy);
                //finally, encode again to Base64
                var signature = Convert.ToBase64String(signedPolicy);

                var response = new Dictionary<string, string>
                {
                    {"policy", encodedPolicy},
                    {"signature", signature}
                };

                string jsonResponse = System.Web.Helpers.Json.Encode(response);
                Response.Write(jsonResponse);
            }
            else
            {
                string[] invalidArray = {"invalid", "true"};
                Response.Write(System.Web.Helpers.Json.Encode(invalidArray));
            }
        }

        private byte[] sign(string stringToSign)
        {
            return Encode(stringToSign, bytesFromString(_clientPrivateKey));
        }

        private byte[] bytesFromString(string str)
        {
            var enc = new ASCIIEncoding();
            return enc.GetBytes(str);
        }

        private byte[] Encode(string input, byte[] key)
        {
            var myhmacsha1 = new HMACSHA1(key);
            var enc = new ASCIIEncoding();
            byte[] byteArray = enc.GetBytes(input);
            var returnValue = myhmacsha1.ComputeHash(byteArray);

            return returnValue;
        }

        private bool policyIsValid(string policy)
        {
            var jsonObj = System.Web.Helpers.Json.Decode(policy);
            var conditions = jsonObj["conditions"];

            string bucketName = null;
            string parsedMaxSize = null;

            for (var i = 0; i < conditions.Length; i++)
            {
                var condition = conditions[i];

                if (condition["bucket"] != null)
                {
                    bucketName = condition["bucket"];
                }
                //validation structure is not present in json. Not sure why not.
                //else if (condition.Length != null && condition[0] == "content-length-range")
                //{
                //    parsedMaxSize = condition[2];
                //}
            }

            return bucketName == _expectedBucketName;
        }

    }
}
