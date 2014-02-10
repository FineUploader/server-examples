﻿using System;
using System.Net;
using System.Globalization;
using System.Collections.Generic;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Auth;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Shared.Protocol;

/**
 * C# Server-Side Example for Fine Uploader Azure.
 * Maintained by Widen Enterprises.
 *
 * This example:
 *  - Handles signature/SAS GET requests
 *  - Handles uploadSuccess POST requests
 *  - Configures CORS rules for your storage account
 */
namespace FineUploaderAzureServer
{
    class Program
    {
        const string STORAGE_ACCOUNT_NAME = "INSERT_AZURE_STORAGE_ACCOUNT_NAME_HERE";
        const string STORAGE_ACCOUNT_KEY = "INSERT_AZURE_STORAGE_ACCOUNT_KEY_HERE";
        static List<String> ALLOWED_CORS_ORIGINS = new List<String> {"INSERT_WEB_APPLICATION_URL_HERE"};
        static List<String> ALLOWED_CORS_HEADERS = new List<String> {"x-ms-meta-qqfilename", "Content-Type", "x-ms-blob-type", "x-ms-blob-content-type"};
        const CorsHttpMethods ALLOWED_CORS_METHODS = CorsHttpMethods.Delete | CorsHttpMethods.Put;
        const int ALLOWED_CORS_AGE_DAYS = 5;
        const string SIGNATURE_SERVER_ENDPOINT_ADDRESS = "http://*:8080/sas/";
        const string UPLOAD_SUCCESS_ENDPOINT_ADDRESS = "http://*:8080/success/";

        [STAThread]
        private static void Main(string[] args)
        {
            var accountAndKey = new StorageCredentials(STORAGE_ACCOUNT_NAME, STORAGE_ACCOUNT_KEY);
            var storageAccount = new CloudStorageAccount(accountAndKey, true);

            // Uncomment this line to set CORS configuration on your account
//            configureCors(storageAccount);

            // Uncomment this line to start your signature/uploadSuccess server
//            startServer(accountAndKey);
        }

        private static void startServer(StorageCredentials accountAndKey)
        {
            HttpListener listener = new HttpListener();
            listener.Prefixes.Add(SIGNATURE_SERVER_ENDPOINT_ADDRESS);
            listener.Prefixes.Add(UPLOAD_SUCCESS_ENDPOINT_ADDRESS);
            listener.Start();

            while (true)
            {
                HttpListenerContext context = listener.GetContext();
                HttpListenerRequest request = context.Request;
                HttpListenerResponse response = context.Response;

                if (request.HttpMethod == "GET")
                {
                    var blobUri = request.QueryString.Get("bloburi");
                    var verb = request.QueryString.Get("_method");

                    var sas = getSasForBlob(accountAndKey, blobUri, verb);

                    byte[] buffer = System.Text.Encoding.UTF8.GetBytes(sas);
                    response.ContentLength64 = buffer.Length;
                    System.IO.Stream output = response.OutputStream;
                    output.Write(buffer, 0, buffer.Length);
                    output.Close();
                }
                else if (request.HttpMethod == "POST")
                {
                    response.StatusCode = 200;
                    // TODO insert uploadSuccess handling logic here
                    response.Close();
                }
                else
                {
                    response.StatusCode = 405;
                }
            }
        }

        private static String getSasForBlob(StorageCredentials credentials, String blobUri, String verb)
        {
            CloudBlockBlob blob = new CloudBlockBlob(new Uri(blobUri), credentials);
            var permission = SharedAccessBlobPermissions.Write;

            if (verb == "DELETE")
            {
                permission = SharedAccessBlobPermissions.Delete;
            }

            var sas = blob.GetSharedAccessSignature(new SharedAccessBlobPolicy()
            {

                Permissions = permission,
                SharedAccessExpiryTime = DateTime.UtcNow.AddMinutes(15),
            });

            return string.Format(CultureInfo.InvariantCulture, "{0}{1}", blob.Uri, sas);
        }

        private static void configureCors(CloudStorageAccount storageAccount)
        {
            var blobClient = storageAccount.CreateCloudBlobClient();

            Console.WriteLine("Storage Account: " + storageAccount.BlobEndpoint);
            var newProperties = CurrentProperties(blobClient);

            newProperties.DefaultServiceVersion = "2013-08-15";
            blobClient.SetServiceProperties(newProperties);

            var addRule = true;
            if (addRule)
            {
                var ruleWideOpenWriter = new CorsRule()
                {
                    AllowedHeaders = ALLOWED_CORS_HEADERS,
                    AllowedOrigins = ALLOWED_CORS_ORIGINS,
                    AllowedMethods = ALLOWED_CORS_METHODS,
                    MaxAgeInSeconds = (int)TimeSpan.FromDays(ALLOWED_CORS_AGE_DAYS).TotalSeconds
                };
                newProperties.Cors.CorsRules.Clear();
                newProperties.Cors.CorsRules.Add(ruleWideOpenWriter);
                blobClient.SetServiceProperties(newProperties);

                Console.WriteLine("New Properties:");
                CurrentProperties(blobClient);

                Console.ReadLine();
            }
        }

        private static ServiceProperties CurrentProperties(CloudBlobClient blobClient)
        {
            var currentProperties = blobClient.GetServiceProperties();
            if (currentProperties != null)
            {
                if (currentProperties.Cors != null)
                {
                    Console.WriteLine("Cors.CorsRules.Count          : " + currentProperties.Cors.CorsRules.Count);
                    for (int index = 0; index < currentProperties.Cors.CorsRules.Count; index++)
                    {
                        var corsRule = currentProperties.Cors.CorsRules[index];
                        Console.WriteLine("corsRule[index]              : " + index);
                        foreach (var allowedHeader in corsRule.AllowedHeaders)
                        {
                            Console.WriteLine("corsRule.AllowedHeaders      : " + allowedHeader);
                        }
                        Console.WriteLine("corsRule.AllowedMethods      : " + corsRule.AllowedMethods);

                        foreach (var allowedOrigins in corsRule.AllowedOrigins)
                        {
                            Console.WriteLine("corsRule.AllowedOrigins      : " + allowedOrigins);
                        }
                        foreach (var exposedHeaders in corsRule.ExposedHeaders)
                        {
                            Console.WriteLine("corsRule.ExposedHeaders      : " + exposedHeaders);
                        }
                        Console.WriteLine("corsRule.MaxAgeInSeconds     : " + corsRule.MaxAgeInSeconds);
                    }
                }
                Console.WriteLine("DefaultServiceVersion         : " + currentProperties.DefaultServiceVersion);
                Console.WriteLine("HourMetrics.MetricsLevel      : " + currentProperties.HourMetrics.MetricsLevel);
                Console.WriteLine("HourMetrics.RetentionDays     : " + currentProperties.HourMetrics.RetentionDays);
                Console.WriteLine("HourMetrics.Version           : " + currentProperties.HourMetrics.Version);
                Console.WriteLine("Logging.LoggingOperations     : " + currentProperties.Logging.LoggingOperations);
                Console.WriteLine("Logging.RetentionDays         : " + currentProperties.Logging.RetentionDays);
                Console.WriteLine("Logging.Version               : " + currentProperties.Logging.Version);
                Console.WriteLine("MinuteMetrics.MetricsLevel    : " + currentProperties.MinuteMetrics.MetricsLevel);
                Console.WriteLine("MinuteMetrics.RetentionDays   : " + currentProperties.MinuteMetrics.RetentionDays);
                Console.WriteLine("MinuteMetrics.Version         : " + currentProperties.MinuteMetrics.Version);
            }
            return currentProperties;
        }
    }
}
