Imports System.Data.SqlClient
Imports System.Net
Imports System.IO
Namespace Uploader
    Public Class UploadController
        Inherits System.Web.Mvc.Controller

        <HttpPost()> _
        Function Upload(ByVal uploadFile As String) As String
            On Error GoTo upload_error
            Dim fStream As Stream = Request.InputStream

            ' We need to hand IE a little bit differently...
            If Request.Browser.Browser = "IE" And Request.Browser.MajorVersion < 10 Then
                ' We need to hand IE a little bit differently...
                Dim myfiles As System.Web.HttpFileCollection = System.Web.HttpContext.Current.Request.Files
                Dim postedFile As System.Web.HttpPostedFile = myfiles(0)
                If Not postedFile.FileName.Equals("") Then
                    fStream = postedFile.InputStream
                End If
            End If

            Dim fileContents() As Byte = New Byte(fStream.Length - 1) {}
            fStream.Read(fileContents, 0, CType(fStream.Length, Integer))
            fStream.Close()
            fStream.Dispose()

            ' You now have all the bytes from the uploaded file in 'FileContents'

            ' You could write it to a database:

            'Dim con As SqlConnection
            'Dim connectionString As String = ""
            'Dim cmd As SqlCommand

            'connectionString = "Data Source=DEV\SQLEXPRESS;Initial Catalog=myDatabase;Trusted_Connection=True;"
            'con = New SqlConnection(connectionString)

            'cmd = New SqlCommand("INSERT INTO blobs VALUES(@filename,@filecontents)", con)
            'cmd.Parameters.Add("@filename", SqlDbType.VarChar).Value = uploadFile
            'cmd.Parameters.Add("@filecontents", SqlDbType.VarBinary).Value = fileContents
            'con.Open()
            'cmd.ExecuteNonQuery()
            'con.Close()


            ' Or write it to the filesystem:
            Dim writeStream As FileStream = New FileStream("C:\TEMP\" & uploadFile, FileMode.Create)
            Dim bw As New BinaryWriter(writeStream)
            bw.Write(fileContents)
            bw.Close()

            ' it all worked ok so send back SUCCESS is true!
            Return "{""success"":true}"
            Exit Function

upload_error:
            Return "{""error"":""An Error Occured""}"
        End Function
    End Class
End Namespace
