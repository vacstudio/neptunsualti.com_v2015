<? 
session_start();
$skey="";
if (isset($_GET["FE_SESSION_KEY"]))
{
	$skey = $_GET["FE_SESSION_KEY"];
    $sessionKey=split("-",$skey);
    $skey = $sessionKey[0];
    $_SESSION['skey']=$skey;
}
elseif(isset($_SESSION['skey']))
{
	$skey=$_SESSION['skey'];
}

   include("../../start/localconf.php"); 
   $dbh=mysql_connect ($typo_db_host, $typo_db_username, $typo_db_password) or die ('I cannot connect to the database because: ' . mysql_error()); 
   mysql_select_db ($typo_db,$dbh); 
   $result=mysql_query("select * from fe_sessions where ses_id  = '$skey' ",$dbh); 
   if (!$result) {
	       die('Access denied'); 
   } 
   if(mysql_num_rows($result) <= 0){ die('Access denied'); } 
?>