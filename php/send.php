<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="https://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />

<title>Neptün Sualtı Merkezi</title>

</head>

<body>


<?php
    $email_to = "info@neptunsualti.com";
    $email = $_POST["email"];
    $name = $_POST["name"];
    $subject = $_POST["subject"];
    $message = $_POST["message"];
    $text = "NAME: $name<br>
             SUBJECT: $subject<br>
             EMAIL: $email<br>
             MESSAGE: $message";
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html; charset=utf-8" . "\r\n";
    $headers .= "From: <$email>" . "\r\n";
    /* change "Message" to your site Name or any thing you want */
    mail($email_to, "Message", $text, $headers);
?>

</body>
</html>