using System;
using System.Collections.Generic;
using System.Text;
using System.Security.Cryptography;
using System.IO;
using System.Web.UI;
using System.Web.Helpers;

namespace MiniAssessment
{
    public partial class signer : System.Web.UI.Page
    {
        private const string _clientPrivateKey = "AWS_SECRET_KEY";
        private const string _expectedBucketName = "AWS_BUCKET_NAME";
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

                        //there is code for this in the PHP project using the S3 SDK. It looks trivial, but this sample does not implement it
                        //deleteObject(); 
                        break;
                    case "POST":
                        handleCorsRequest();
                        signRequest();

                        //there is code for this in the PHP project using the S3 SDK. It looks trivial, but this sample does not implement it
                        //verifyFileInS3();

                        Response.Flush();
                        break;
                }
            }
        }

        protected override void Render(HtmlTextWriter writer)
        {
            //Because this is a Page class, need to remove all normally rendered content.
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

            var jsonContent = System.Web.Helpers.Json.Decode(responseBody);

            if (!string.IsNullOrEmpty(jsonContent["headers"]))
            {
                signRestRequest(jsonContent["headers"]);
            }
            else
            {
                signPolicy(responseBody);
            }
        }

        private void signRestRequest(string headersStr)
        {
            if (restRequestisValid(headersStr))
            {
                var signedPolicy = sign(headersStr);
                var signature = Convert.ToBase64String(signedPolicy);
                var response = new Dictionary<string, string>
                {
                    {"signature", signature}
                };
                var jsonResponse = Json.Encode(response);
                Response.Write(jsonResponse);
            }
            else
            {
                returnInvalid();
            }
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

                var jsonResponse = Json.Encode(response);
                Response.Write(jsonResponse);
            }
            else
            {
                returnInvalid();
            }
        }

        private byte[] sign(string stringToSign)
        {
            return Encode(stringToSign, bytesFromString(_clientPrivateKey));
        }

        private byte[] Encode(string input, byte[] key)
        {
            var myhmacsha1 = new HMACSHA1(key);
            var enc = new ASCIIEncoding();
            byte[] byteArray = enc.GetBytes(input);
            var returnValue = myhmacsha1.ComputeHash(byteArray);

            return returnValue;
        }

        private bool restRequestisValid(string headersStr)
        {
            var pattern = _expectedBucketName;

            var regMatch = new System.Text.RegularExpressions.Regex(pattern);

            return regMatch.IsMatch(headersStr);
        }

        private bool policyIsValid(string policy)
        {
            var jsonObj = Json.Decode(policy);
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
                //validation is not present in json. Not sure why not.
                //else if (condition.Length != null && condition[0] == "content-length-range")
                //{
                //    parsedMaxSize = condition[2];
                //}
            }

            return bucketName == _expectedBucketName;
        }

        private string stringFromStream(Stream stream)
        {
            var encoding = Request.ContentEncoding;
            var reader = new StreamReader(stream, encoding);

            return reader.ReadToEnd();
        }

        private byte[] bytesFromString(string str)
        {
            var enc = new ASCIIEncoding();
            return enc.GetBytes(str);
        }

        private void returnInvalid()
        {
            string[] invalidArray = { "invalid", "true" };
            Response.Write(Json.Encode(invalidArray));
        }
    }
}
