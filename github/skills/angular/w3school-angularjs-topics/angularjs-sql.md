# AngularJS SQL

> Source: https://www.w3schools.com/angularjs/angularjs_sql.asp

# AngularJS SQL

AngularJS is perfect for displaying data from a Database.

Just make sure the data is in JSON format.

## Fetching Data From a PHP Server Running MySQL

### AngularJS Example

```javascript
var app = angular.module("myApp", []);
app.controller("customersCtrl", function ($scope, $http) {
  $http.get("customers_mysql.php").then(function (response) {
    $scope.names = response.data.records;
  });
});
```

```html
<div ng-app="myApp" ng-controller="customersCtrl">
  <table>
    <tr ng-repeat="x in names">
      <td>{{ x.Name }}</td>
      <td>{{ x.Country }}</td>
    </tr>
  </table>
</div>
```

## Fetching Data From an ASP.NET Server Running SQL

### AngularJS Example

```javascript
var app = angular.module("myApp", []);
app.controller("customersCtrl", function ($scope, $http) {
  $http.get("customers_sql.aspx").then(function (response) {
    $scope.names = response.data.records;
  });
});
```

```html
<div ng-app="myApp" ng-controller="customersCtrl">
  <table>
    <tr ng-repeat="x in names">
      <td>{{ x.Name }}</td>
      <td>{{ x.Country }}</td>
    </tr>
  </table>
</div>
```

## Server Code Examples

The following section lists server code used to fetch SQL data:

1. Using PHP and MySQL. Returning JSON.
2. Using PHP and MS Access. Returning JSON.
3. Using ASP.NET, VB, and MS Access. Returning JSON.
4. Using ASP.NET, Razor, and SQL Lite. Returning JSON.

## Cross-Site HTTP Requests

A request for data from a different server (other than the requesting page) constitutes a cross-site HTTP request.

Cross-site requests are common on the web. Many pages load CSS, images, and scripts from different servers.

In modern browsers, cross-site HTTP requests from scripts are restricted to the same site for security reasons.

The following line has been added to PHP examples to allow cross-site access:

```
header("Access-Control-Allow-Origin: *");
```

## 1. Server Code PHP and MySQL

```php
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("myServer", "myUser", "myPassword", "Northwind");

$result = $conn->query("SELECT CompanyName, City, Country FROM Customers");

$outp = "";
while($rs = $result->fetch_array(MYSQLI_ASSOC)) {
  if ($outp != "") {$outp .= ",";}
  $outp .= '{"Name":"'  . $rs["CompanyName"] . '",';
  $outp .= '"City":"'   . $rs["City"]        . '",';
  $outp .= '"Country":"'. $rs["Country"]     . '"}';
}
$outp ='{"records":['.$outp.']}';
$conn->close();

echo($outp);
?>
```

## 2. Server Code PHP and MS Access

```php
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=ISO-8859-1");

$conn = new COM("ADODB.Connection");
$conn->open("PROVIDER=Microsoft.Jet.OLEDB.4.0;Data Source=Northwind.mdb");

$rs = $conn->execute("SELECT CompanyName, City, Country FROM Customers");

$outp = "";
while (!$rs->EOF) {
  if ($outp != "") {$outp .= ",";}
  $outp .= '{"Name":"'  . $rs["CompanyName"] . '",';
  $outp .= '"City":"'   . $rs["City"]        . '",';
  $outp .= '"Country":"'. $rs["Country"]     . '"}';
  $rs->MoveNext();
}
$outp ='{"records":['.$outp.']}';

$conn->close();

echo ($outp);
?>
```

## 3. Server Code ASP.NET, VB and MS Access

```vb
<%@ Import Namespace="System.IO"%>
<%@ Import Namespace="System.Data"%>
<%@ Import Namespace="System.Data.OleDb"%>
<%
Response.AppendHeader("Access-Control-Allow-Origin", "*")
Response.AppendHeader("Content-type", "application/json")
Dim conn As OleDbConnection
Dim objAdapter As OleDbDataAdapter
Dim objTable As DataTable
Dim objRow As DataRow
Dim objDataSet As New DataSet()
Dim outp
Dim c
conn = New OledbConnection("Provider=Microsoft.Jet.OLEDB.4.0;data source=Northwind.mdb")
objAdapter = New OledbDataAdapter("SELECT CompanyName, City, Country FROM Customers", conn)
objAdapter.Fill(objDataSet, "myTable")
objTable=objDataSet.Tables("myTable")

outp = ""
c = chr(34)
for each x in objTable.Rows
if outp <> "" then outp = outp & ","
outp = outp & "{" & c & "Name"    & c & ":" & c & x("CompanyName") & c & ","
outp = outp &       c & "City"    & c & ":" & c & x("City")        & c & ","
outp = outp &       c & "Country" & c & ":" & c & x("Country")     & c & "}"
next

outp ="{" & c & "records" & c & ":[" & outp & "]}"
response.write(outp)
conn.close
%>
```

## 4. Server Code ASP.NET, Razor C# and SQL Lite

```csharp
@{
Response.AppendHeader("Access-Control-Allow-Origin", "*")
Response.AppendHeader("Content-type", "application/json")
var db = Database.Open("Northwind");
var query = db.Query("SELECT CompanyName, City, Country FROM Customers");
var outp =""
var c = chr(34)
}
@foreach(var row in query){
if (outp != "") {outp = outp + ","}
outp = outp + "{" + c + "Name"    + c + ":" + c + @row.CompanyName + c + ","
outp = outp +       c + "City"    + c + ":" + c + @row.City        + c + ","
outp = outp +       c + "Country" + c + ":" + c + @row.Country     + c + "}"
}
outp ="{" + c + "records" + c + ":[" + outp + "]}"
@outp
```
